"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const common_processing_1 = require("./common_processing");
const context_processor_1 = require("./context_processor");
const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
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
    let fallbackCommitType = core.getInput('fallback-commit-type') || null;
    let fallbackCommitScope = core.getInput('fallback-commit-scope') || null;
    let commitMsgWithFooter = core.getInput('commit-msg-with-footer') || null;
    let nullToEmpty = core.getInput('null-to-empty') || null;
    let workspace = ((_a = process.env['GITHUB_WORKSPACE']) === null || _a === void 0 ? void 0 : _a.toString()) || null;
    if (!workDir || workDir === ".") {
        workDir = getWorkingDirectory(workspace);
    }
    let ignoreFiles = (0, common_processing_1.isEmpty)(ignoreFilesStr) ? new Set() : ignoreFilesStr.split(',');
    let result = run(github.context, workDir, ignoreFiles, branchFallback, tagFallback, !(0, common_processing_1.isEmpty)(fallbackCommitType) ? fallbackCommitType : "", !(0, common_processing_1.isEmpty)(fallbackCommitScope) ? fallbackCommitScope : "", !(0, common_processing_1.isEmpty)(commitMsgWithFooter) ? commitMsgWithFooter.toLowerCase() === 'true' : true, !(0, common_processing_1.isEmpty)(nullToEmpty) ? nullToEmpty.toLowerCase() === 'true' : true);
    result.set('GITHUB_WORKSPACE', workspace || null);
    console.log(JSON.stringify(Object.fromEntries((0, common_processing_1.sortMap)(result)), null, 4));
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
function run(context, workDir, ignoreFiles, branchFallback, tagFallback, fallbackCommitType, fallbackCommitScope, commitMsgWithFooter, nullToEmpty) {
    var _a, _b;
    //DEFAULTS
    let result = new Map();
    branchFallback = (0, common_processing_1.isEmpty)(branchFallback) ? 'main' : branchFallback;
    ignoreFiles = new Set(Array.from(ignoreFiles, s => s.trim()));
    result.set('work-dir', workDir.toString());
    result.set('ignore-files', Array.from(ignoreFiles).join(", ") || null);
    result.set('branch-fallback', branchFallback);
    result.set('tag-fallback', tagFallback);
    result.set('fallback-commit-type', fallbackCommitType);
    result.set('fallback-commit-scope', fallbackCommitScope);
    result.set('commit-msg-with-footer', commitMsgWithFooter);
    result.set('null-to-empty', nullToEmpty);
    result.set('ticket_numbers', "");
    result.set('has_breaking_changes', false);
    result.set("commit_types", "");
    result.set("commit_scopes", "");
    (0, context_processor_1.addContext)(result, context);
    (0, common_processing_1.cmd)(workDir, 'git fetch --all --tags');
    result.set('is_git_repo', !(0, common_processing_1.isEmpty)((0, common_processing_1.cmd)(workDir, 'git rev-parse --is-inside-work-tree', 'git rev-parse --git-dir')));
    result.set('branch', (0, common_processing_1.deleteBranchPrefix)(((_a = context === null || context === void 0 ? void 0 : context.payload) === null || _a === void 0 ? void 0 : _a.ref) || (context === null || context === void 0 ? void 0 : context.ref) || (0, common_processing_1.cmd)(workDir, 'git branch --show-current', 'git branch --show', 'git rev-parse --abbrev-ref HEAD', 'git rev-parse --abbrev-ref --symbolic-full-name @{u}')));
    result.set('branch_default', ((_b = context === null || context === void 0 ? void 0 : context.repository) === null || _b === void 0 ? void 0 : _b.default_branch) || getDefaultBranch(workDir, branchFallback));
    result.set('is_default_branch', result.get('branch') === result.get('branch_default') && result.get('branch') !== null);
    result.set('sha_latest', (0, common_processing_1.cmd)(workDir, 'git rev-parse HEAD'));
    result = setLatestTag(workDir, result, tagFallback);
    result.set('has_changes', result.get('sha_latest') !== result.get('sha_latest_tag'));
    addChanges(ignoreFiles, workDir, result);
    addAheadBehind(workDir, result);
    addSemCommits(result, workDir, fallbackCommitType, fallbackCommitScope, commitMsgWithFooter);
    return (0, common_processing_1.sortMap)(nullToEmpty ? (0, common_processing_1.replaceNullWithEmptyMap)(result) : result);
}
function addAheadBehind(workDir, result) {
    let aheadBehind = (0, common_processing_1.cmd)(workDir, 'git rev-list --count --left-right ' + result.get('branch') + '...' + result.get('branch_default'));
    let ahead = (0, common_processing_1.isEmpty)(aheadBehind) ? null : aheadBehind === null || aheadBehind === void 0 ? void 0 : aheadBehind.split(/\s/)[0].trim();
    let behind = (0, common_processing_1.isEmpty)(aheadBehind) ? null : aheadBehind === null || aheadBehind === void 0 ? void 0 : aheadBehind.split(/\s/)[1].trim();
    result.set('commits_ahead', parseInt(ahead || '0'));
    result.set('commits_behind', parseInt(behind || '0'));
}
function addChanges(ignoreFiles, workDir, result) {
    let gitStatus = (0, common_processing_1.cmd)(workDir, 'git status --porcelain');
    let changedFiles = toFilesSet(ignoreFiles, (0, common_processing_1.cmd)(workDir, 'git diff ' + result.get('sha_latest') + ' ' + result.get('sha_latest_tag') + ' --name-only'));
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
}
function addSemCommits(result, workDir, fallbackCommitType, fallbackCommitScope, commitMsgWithFooter) {
    if (result.get("has_changes") === true) {
        let commits = (0, common_processing_1.toCommitMessages)((0, common_processing_1.cmd)(workDir, 'git log ' + result.get('sha_latest_tag') + '..' + result.get('sha_latest')))
            .map(commit => (0, common_processing_1.toSemanticCommit)(commit[3], fallbackCommitType, fallbackCommitScope, commitMsgWithFooter));
        let hasBreakingChange = commits.some(([_, __, breakingChange]) => !(0, common_processing_1.isEmpty)(breakingChange) ? breakingChange.toLowerCase() === 'true' : false);
        result.set("ticket_numbers", (0, common_processing_1.getTicketNumbers)(commits).join(', '));
        let typeMap = new Map();
        let scopeMap = new Map();
        commits.forEach(commit => {
            if (commit.length >= 1 && !(0, common_processing_1.isEmpty)(commit[0])) {
                let message = typeMap.has(commit[0]) ? typeMap.get(commit[0]) : [];
                message.push(commit[3]);
                typeMap.set(commit[0], message);
            }
            if (commit.length >= 2 && !(0, common_processing_1.isEmpty)(commit[1])) {
                let message = scopeMap.has(commit[1]) ? scopeMap.get(commit[1]) : [];
                message.push(commit[3]);
                scopeMap.set(commit[1], message);
            }
        });
        setSemCommits(result, typeMap, scopeMap, hasBreakingChange);
    }
    else if (result.get("has_local_changes") === true) {
        result.set('ticket_numbers', null);
        setSemCommits(result, new Map([["chore", [""]]]), new Map([["maintenance", ['']]]), false);
    }
    else {
        result.set('has_breaking_changes', false);
        ['commit_types', 'commit_scopes', 'change_type', 'ticket_numbers'].forEach(key => {
            result.set(key, null);
        });
    }
}
function setSemCommits(result, typeMap, scopeMap, hasBreakingChange) {
    var _a;
    result.set('commit_types', Array.from((0, common_processing_1.sortMap)(typeMap).keys()).join(', '));
    result.set('commit_scopes', Array.from((0, common_processing_1.sortMap)(scopeMap).keys()).join(', '));
    result.set('has_breaking_changes', hasBreakingChange);
    typeMap.forEach((value, key) => {
        //TODO: max changelog length
        result.set('commit_type_' + key, value.join(`. ${common_processing_1.LINE_SEPARATOR}`));
    });
    scopeMap.forEach((value, key) => {
        //TODO: max changelog length
        result.set('commit_scope_' + key, value.join(`. ${common_processing_1.LINE_SEPARATOR}`));
    });
    //TODO: normal changelog without semver commit?
    const keys = Array.from(typeMap.keys());
    result.set('change_type', hasBreakingChange ? 'major' : ((_a = common_processing_1.CHANGE_TYPES.find(([key, _]) => keys.includes(key))) === null || _a === void 0 ? void 0 : _a[1]) || null);
}
function toFilesSet(ignoreFiles, changesLog) {
    let result = new Set();
    if ((0, common_processing_1.isEmpty)(changesLog) || changesLog === null) {
        return result;
    }
    for (const line of changesLog.split(common_processing_1.LINE_SPLIT_REGEX)) {
        if (!(0, common_processing_1.isEmpty)(line) && line.includes('.')) {
            result.add(line.trim());
        }
    }
    return ignoreFiles && ignoreFiles.size > 0
        ? new Set(Array.from(result).filter(file => {
            return !Array.from(ignoreFiles).some(regex => new RegExp(regex).test(file));
        }))
        : result;
}
function hasFileEnding(fileNames, fileEndings) {
    return Array.from(fileNames).some(fileName => {
        return fileEndings.some(ending => fileName.toLowerCase().endsWith(ending.toLowerCase()));
    });
}
function setLatestTag(workDir, result, tagFallback) {
    let latestTag = (0, common_processing_1.cmd)(workDir, 'git describe --tags --abbrev=0');
    if (!(0, common_processing_1.isEmpty)(latestTag)) {
        result.set('tag_latest', latestTag);
        result.set('sha_latest_tag', (0, common_processing_1.cmd)(workDir, 'git rev-list -n 1 ' + latestTag));
    }
    else {
        result.set('tag_latest', (0, common_processing_1.isEmpty)(tagFallback) ? null : tagFallback);
        result.set('sha_latest_tag', result.get('sha_latest') || null);
    }
    return result;
}
function getDefaultBranch(workDir, fallback) {
    let result = (0, common_processing_1.deleteBranchPrefix)((0, common_processing_1.cmd)(workDir, 'git symbolic-ref refs/remotes/origin/HEAD', 'git symbolic-ref refs/remotes/origin/HEAD'));
    result = (0, common_processing_1.isEmpty)(result) ? (0, common_processing_1.deleteBranchPrefix)((0, common_processing_1.cmd)(workDir, 'git symbolic-ref HEAD')) : result;
    result = !(0, common_processing_1.isEmpty)(result) && result != null ? result.trim() : result;
    return (0, common_processing_1.isEmpty)(result) || result == null ? fallback : result;
}
function getWorkingDirectory(workspace) {
    return workspace && fs.existsSync(workspace) ? workspace : process.cwd();
}
module.exports = { run };
