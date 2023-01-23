"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const core = require('@actions/core');
const fs = require('fs');
//FILE ENDINGS
const fileEndingsMap = new Map([["js", [".js", ".mjs", ".cjs"]],
    ["ts", [".ts", ".tsx"]],
    ["python", [".py", ".pyc", ".pyd", ".pyo"]],
    ["java", [".java", ".class", ".jar", ".jav", ".jsp", ".jspf", ".jsf", ".groovy"]],
    ["kotlin", [".kt", ".kts"]],
    ["cs", [".cs", ".dll"]],
    ["cpp", [".c", ".cpp", ".h", ".hpp", ".o", ".a"]],
    ["ruby", [".rb", ".rbw", ".rake", ".gemspec"]],
    ["php", [".php", ".phtml", ".php3", ".php4", ".php5", ".phps"]],
    ["swift", [".swift", ".swiftdoc", ".swiftmodule"]],
    ["go", [".go", ".a", ".o"]],
    ["shell", [".sh", ".bash", ".csh", ".tcsh", ".ksh", ".zsh", ".fish", ".bat", ".cmd"]],
    ["perl", [".pl", ".pm", ".pod", ".t"]],
    ["lua", [".lua"]],
    ["r", [".r", ".R"]],
    ["sql", [".sql", ".ddl", ".dml"]],
    ["html", [".html", ".htm", ".xhtml"]],
    ["css", [".css", "scss"]],
    ["xml", [".xml"]],
    ["json", [".json"]],
    ["yaml", [".yml", ".yaml"]],
    ["config", [".config", ".ini", ".cfg", ".conf", ".properties", ".yml", ".yaml"]],
    ["json", [".json"]],
    ["envs", [".env"]],
    ["toml", [".toml"]],
    ["md", [".md", ".markdown", ".mdown", ".mkdn", ".mkd", ".mdwn", ".mdtxt", ".mdtext", ".mdml"]],
    ["text", [".txt", ".text",]],
    ["pictures", [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".heic", ".svg", ".webp", ".avif", ".raw"]],
]);
try {
    let workDir = core.getInput('work-dir');
    let ignoreFilesStr = core.getInput('ignore-files') || null;
    let branchFallback = core.getInput('branch-fallback') || null;
    let tagFallback = core.getInput('tag-fallback') || null;
    let workspace = ((_a = process.env['GITHUB_WORKSPACE']) === null || _a === void 0 ? void 0 : _a.toString()) || null;
    if (!workDir || workDir === ".") {
        workDir = getWorkingDirectory(workspace);
    }
    let ignoreFiles = isEmpty(ignoreFilesStr) ? new Set() : ignoreFilesStr.split(',');
    let result = run(workDir, ignoreFiles, branchFallback, tagFallback);
    result.set('GITHUB_WORKSPACE', workspace || null);
    console.log(JSON.stringify(Object.fromEntries(sortMap(result)), null, 4));
    result.forEach((value, key) => {
        core.setOutput(key, value);
    });
}
catch (e) {
    if (typeof e === "string") {
        core.setFailed(e.toUpperCase());
    }
    else if (e instanceof Error) {
        core.setFailed(e.message);
    }
}
function run(workDir, ignoreFiles, branchFallback, tagFallback) {
    //DEFAULTS
    let result = new Map();
    branchFallback = isEmpty(branchFallback) ? 'main' : branchFallback;
    ignoreFiles = new Set(Array.from(ignoreFiles, s => s.trim()));
    result.set('work-dir', workDir.toString());
    result.set('ignore-files', Array.from(ignoreFiles).join(", ") || null);
    result.set('branch-fallback', branchFallback);
    result.set('tag-fallback', tagFallback);
    let gitStatus = cmd(workDir, 'git status --porcelain');
    cmd(workDir, 'git fetch --all --tags');
    result.set('is_git_repo', !isEmpty(cmd(workDir, 'git rev-parse --is-inside-work-tree', 'git rev-parse --git-dir')));
    result.set('branch', deleteBranchPrefix(cmd(workDir, 'git branch --show-current', 'git branch --show', 'git rev-parse --abbrev-ref HEAD', 'git rev-parse --abbrev-ref --symbolic-full-name @{u}')));
    result.set('branch_default', getDefaultBranch(workDir, branchFallback));
    result.set('is_default_branch', result.get('branch') === result.get('branch_default') && result.get('branch') !== null);
    result.set('sha_latest', cmd(workDir, 'git rev-parse HEAD'));
    result = setLatestTag(workDir, result, tagFallback);
    result.set('has_changes', result.get('sha_latest') !== result.get('sha_latest_tag'));
    let changedFiles = toFilesSet(ignoreFiles, cmd(workDir, 'git diff ' + result.get('sha_latest') + ' ' + result.get('sha_latest_tag') + ' --name-only'));
    let changedLocalFiles = toFilesSet(ignoreFiles, gitStatus);
    result.set('has_local_changes', changedLocalFiles && changedLocalFiles.size > 0);
    fileEndingsMap.forEach((fileEndings, language) => {
        result.set('x_has_local_changes_' + language.toLowerCase(), hasFileEnding(changedLocalFiles, fileEndings));
    });
    fileEndingsMap.forEach((fileEndings, language) => {
        result.set('x_has_changes_' + language.toLowerCase(), hasFileEnding(changedFiles, fileEndings));
    });
    let languages = Array.from(fileEndingsMap.keys());
    languages.sort();
    result.set('x_language_list', languages.join(', '));
    let aheadBehind = cmd(workDir, 'git rev-list --count --left-right ' + result.get('branch') + '...' + result.get('branch_default'));
    let ahead = isEmpty(aheadBehind) ? null : aheadBehind === null || aheadBehind === void 0 ? void 0 : aheadBehind.split(/\s/)[0].trim();
    let behind = isEmpty(aheadBehind) ? null : aheadBehind === null || aheadBehind === void 0 ? void 0 : aheadBehind.split(/\s/)[1].trim();
    result.set('commits_ahead', parseInt(ahead || '0'));
    result.set('commits_behind', parseInt(behind || '0'));
    return result;
}
function toFilesSet(ignoreFiles, changesLog) {
    let result = new Set();
    if (isEmpty(changesLog) || changesLog === null) {
        return result;
    }
    for (const line of changesLog.split(/\r?\n|\r/)) {
        if (!isEmpty(line) && line.includes('.')) {
            result.add(line.trim());
        }
    }
    return ignoreFiles && ignoreFiles.size > 0 ? new Set([...result].filter(file => {
        return !Array.from(ignoreFiles).some(regex => new RegExp(regex).test(file));
    })) : result;
}
function hasFileEnding(fileNames, fileEndings) {
    return Array.from(fileNames).some(fileName => {
        return fileEndings.some(ending => fileName.toLowerCase().endsWith(ending.toLowerCase()));
    });
}
function setLatestTag(workDir, result, tagFallback) {
    let latestTag = cmd(workDir, 'git describe --tags --abbrev=0');
    if (!isEmpty(latestTag)) {
        result.set('tag_latest', latestTag);
        result.set('sha_latest_tag', cmd(workDir, 'git rev-list -n 1 ' + latestTag));
    }
    else {
        result.set('tag_latest', isEmpty(tagFallback) ? null : tagFallback);
        result.set('sha_latest_tag', result.get('sha_latest') || null);
    }
    return result;
}
function deleteBranchPrefix(branchName) {
    let index = branchName == null ? -1 : branchName.lastIndexOf('/');
    return branchName != null && index > 0 ? branchName.substring(index + 1) : branchName;
}
function getDefaultBranch(workDir, fallback) {
    let result = deleteBranchPrefix(cmd(workDir, 'git symbolic-ref refs/remotes/origin/HEAD', 'git symbolic-ref refs/remotes/origin/HEAD'));
    result = isEmpty(result) ? deleteBranchPrefix(cmd(workDir, 'git symbolic-ref HEAD')) : result;
    result = !isEmpty(result) && result != null ? result.trim() : result;
    return isEmpty(result) || result == null ? fallback : result;
}
function isEmpty(input) {
    return !input || input.trim().length === 0;
}
function cmd(workDir, ...commands) {
    for (const command of commands) {
        let result = null;
        try {
            result = require('child_process').execSync(command, {
                cwd: workDir.toString(),
                encoding: 'utf8',
                timeout: 10000
            });
        }
        catch (ignored) {
            // console.debug(ignored)
            continue;
        }
        if (!isEmpty(result)) {
            return result.trim();
        }
    }
    return null;
}
function getWorkingDirectory(workspace) {
    return workspace && fs.existsSync(workspace) ? workspace : process.cwd();
}
function sortMap(input) {
    const sortedEntries = Array.from(input.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return new Map(sortedEntries);
}
module.exports = { run, cmd };
