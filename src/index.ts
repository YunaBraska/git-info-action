//https://github.com/actions/toolkit/tree/main/packages/
import {PathOrFileDescriptor} from "fs";

const os = require('os');
const fs = require('fs');
const core = require('@actions/core');
const LINE_SEPARATOR = os.EOL;
const BC_PATTERN = /\Wbreaking\W?change\W/mgi;
const TICKET_PATTERN = /(\w*)-\d+|#\d+/mgi;

type ResultType = string | number | boolean | null;
//FILE ENDINGS
const fileEndingsMap = new Map<string, string[]>(
    [["js", [".js", ".mjs", ".cjs"]],
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
    let fallbackCommitType = core.getInput('fallback-commit-type');
    let fallbackCommitScope = core.getInput('fallback-commit-scope');
    let commitMsgWithFooter = core.getInput('commit-msg-with-footer');
    let workspace = process.env['GITHUB_WORKSPACE']?.toString() || null;
    if (!workDir || workDir === ".") {
        workDir = getWorkingDirectory(workspace)
    }
    let ignoreFiles = isEmpty(ignoreFilesStr) ? new Set<string>() : ignoreFilesStr.split(',');
    let result = run(
        workDir,
        ignoreFiles,
        branchFallback,
        tagFallback,
        !isEmpty(fallbackCommitType) ? fallbackCommitType : "",
        !isEmpty(fallbackCommitScope) ? fallbackCommitScope : "",
        !isEmpty(commitMsgWithFooter) ? commitMsgWithFooter.toLowerCase() === 'true' : true
    );
    result.set('GITHUB_WORKSPACE', workspace || null);

    console.log(JSON.stringify(Object.fromEntries(sortMap(result)), null, 4))

    result.forEach((value, key) => {
        core.setOutput(key, value);
    })
} catch (e) {
    if (typeof e === "string") {
        core.setFailed(e.toUpperCase());
    } else if (e instanceof Error) {
        core.setFailed(e.message);
    }
}

function run(
    workDir: PathOrFileDescriptor,
    ignoreFiles: Set<string>,
    branchFallback: string,
    tagFallback: string,
    fallbackCommitType: string,
    fallbackCommitScope: string,
    commitMsgWithFooter: boolean
): Map<string, ResultType> {
    //DEFAULTS
    let result = new Map<string, ResultType>();
    branchFallback = isEmpty(branchFallback) ? 'main' : branchFallback
    ignoreFiles = new Set(Array.from(ignoreFiles, s => s.trim()));
    result.set('work-dir', workDir.toString());
    result.set('ignore-files', Array.from(ignoreFiles).join(", ") || null);
    result.set('branch-fallback', branchFallback);
    result.set('tag-fallback', tagFallback);
    result.set('fallback-commit-type', fallbackCommitType);
    result.set('fallback-commit-scope', fallbackCommitScope);
    result.set('commit-msg-with-footer', commitMsgWithFooter);
    result.set('ticket_numbers', "");
    result.set('has_breaking_changes', false);
    result.set("commit_types", "");
    result.set("commit_scopes", "");

    let gitStatus = cmd(workDir, 'git status --porcelain');
    cmd(workDir, 'git fetch --all --tags');
    result.set('is_git_repo', !isEmpty(cmd(workDir, 'git rev-parse --is-inside-work-tree', 'git rev-parse --git-dir')));
    result.set('branch', deleteBranchPrefix(cmd(workDir, 'git branch --show-current', 'git branch --show', 'git rev-parse --abbrev-ref HEAD', 'git rev-parse --abbrev-ref --symbolic-full-name @{u}')));
    result.set('branch_default', getDefaultBranch(workDir, branchFallback));
    result.set('is_default_branch', result.get('branch') === result.get('branch_default') && result.get('branch') !== null);
    result.set('sha_latest', cmd(workDir, 'git rev-parse HEAD'));
    result = setLatestTag(workDir, result, tagFallback);
    result.set('has_changes', result.get('sha_latest') !== result.get('sha_latest_tag'));

    let changedFiles = toFilesSet(ignoreFiles, cmd(workDir, 'git diff ' + result.get('sha_latest') + ' ' + result.get('sha_latest_tag') + ' --name-only'))
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

    let aheadBehind = cmd(workDir, 'git rev-list --count --left-right ' + result.get('branch') + '...' + result.get('branch_default'))
    let ahead = isEmpty(aheadBehind) ? null : aheadBehind?.split(/\s/)[0].trim()
    let behind = isEmpty(aheadBehind) ? null : aheadBehind?.split(/\s/)[1].trim()
    result.set('commits_ahead', parseInt(ahead || '0'));
    result.set('commits_behind', parseInt(behind || '0'));

    if (result.get("has_changes")) {
        let commits = toCommitMessages(cmd(workDir, 'git log ' + result.get('sha_latest_tag') + '..' + result.get('sha_latest')))
            .map(commit => toSemanticCommit(commit[3], fallbackCommitType, fallbackCommitScope, commitMsgWithFooter))
        result.set("ticket_numbers", getTicketNumbers(commits).join(', '));
        result.set("has_breaking_changes", commits.some(([_, __, breakingChange]) => !isEmpty(breakingChange) ? breakingChange.toLowerCase() === 'true' : false));

        let typeMap = new Map<string, string[]>();
        let scopeMap = new Map<string, string[]>();
        commits.forEach(commit => {
            if (commit.length >= 1 && !isEmpty(commit[0])) {
                let message = typeMap.has(commit[0]) ? typeMap.get(commit[0])! : [];
                message.push(commit[3]);
                typeMap.set(commit[0], message);
            }
            if (commit.length >= 2 && !isEmpty(commit[1])) {
                let message = scopeMap.has(commit[1]) ? scopeMap.get(commit[1])! : [];
                message.push(commit[3]);
                scopeMap.set(commit[1], message);
            }
        })
        result.set("commit_types", Array.from(sortMap(typeMap).keys()).join(', '));
        result.set("commit_scopes", Array.from(sortMap(scopeMap).keys()).join(', '));
        typeMap.forEach((value, key) => {
            result.set("commit_type_" + key, value.join(`. ${LINE_SEPARATOR}`));
        })
        scopeMap.forEach((value, key) => {
            result.set("commit_scope_" + key, value.join(`. ${LINE_SEPARATOR}`));
        })
    }
    return result;
}


function getTicketNumbers(commits: string[][]): string[] {
    let tickets: string[] = [];
    commits.forEach(commit => {
        commit[3]?.match(TICKET_PATTERN)?.forEach(ticket => tickets.push(ticket.trim()))
    })
    return tickets;
}

function toCommitMessages(messages: string | null): string[][] {
    let result: string[][] = [];
    let commit = ""
    let author = ""
    let date = ""
    let msg = ""
    str(messages).split(/\r?\n|\r/).forEach(line => {
        if (line.startsWith('commit ')) {
            if (!isEmpty(commit)) {
                result.push([commit, author, date, msg])
                msg = ""
            }
            commit = line.substring('commit '.length);
        } else if (line.startsWith('Author: ')) {
            author = line.substring('Author: '.length);
        } else if (line.startsWith('Date: ')) {
            date = line.substring('Date: '.length);
        } else if (!isEmpty(line)) {
            msg += line.trim() + LINE_SEPARATOR
        }
        console.log(line);
    });
    if (!isEmpty(commit)) {
        result.push([commit, author, date, msg.trim()])
    }
    return result;
}

function toSemanticCommit(message: string, fallbackCommitType: string, fallbackCommitScope: string, commitMsgWithFooter: boolean): string[] {
    message = message ? message : "";
    let typeIndex = message.indexOf(":");
    let scopeStartIndex = message.indexOf("(");
    let scopeEndIndex = message.indexOf(")");
    let bcIndex = message.indexOf("!");
    let type = typeIndex != -1 ? message.substring(0, Math.min(...[typeIndex, scopeStartIndex, scopeEndIndex, bcIndex].filter(i => i !== -1))) : fallbackCommitType;
    let scope = typeIndex != -1 && scopeEndIndex < typeIndex && scopeStartIndex < scopeEndIndex ? message.substring(scopeStartIndex + 1, scopeEndIndex) : fallbackCommitScope;
    let breakingChange = Boolean((bcIndex + 1 == typeIndex) || message.match(BC_PATTERN));
    let body = typeIndex != -1 ? message.substring(typeIndex + 1).trim() : message.trim();
    body = body + (body.endsWith('.') ? "" : ".");
    body = isEmpty(body) ? "" : body.charAt(0).toUpperCase() + body.slice(1);
    if (!commitMsgWithFooter && (body.includes('\n') || body.includes('\r'))) {
        body = body.split(/\r?\n|\r/)[0]
    }
    return [type, scope, str(breakingChange), body];
}

function str(result: string | number | boolean | null | undefined): string {
    return (result ?? '').toString();
}


function toFilesSet(ignoreFiles: Set<string>, changesLog: string | null): Set<string> {
    let result = new Set<string>();
    if (isEmpty(changesLog) || changesLog === null) {
        return result;
    }
    for (const line of changesLog.split(/\r?\n|\r/)) {
        if (!isEmpty(line) && line.includes('.')) {
            result.add(line.trim())
        }
    }
    return ignoreFiles && ignoreFiles.size > 0
        ? new Set(Array.from(result).filter(file => {
            return !Array.from(ignoreFiles).some(regex => new RegExp(regex).test(file));
        }))
        : result;
}

function hasFileEnding(fileNames: Set<string>, fileEndings: string[]): boolean {
    return Array.from(fileNames).some(fileName => {
        return fileEndings.some(ending => fileName.toLowerCase().endsWith(ending.toLowerCase()));
    });
}

function setLatestTag(workDir: PathOrFileDescriptor, result: Map<string, ResultType>, tagFallback: string): Map<string, ResultType> {
    let latestTag = cmd(workDir, 'git describe --tags --abbrev=0');
    if (!isEmpty(latestTag)) {
        result.set('tag_latest', latestTag);
        result.set('sha_latest_tag', cmd(workDir, 'git rev-list -n 1 ' + latestTag));
    } else {
        result.set('tag_latest', isEmpty(tagFallback) ? null : tagFallback);
        result.set('sha_latest_tag', result.get('sha_latest') || null);
    }
    return result;
}

function deleteBranchPrefix(branchName: string | null): string | null {
    let index = branchName == null ? -1 : branchName.lastIndexOf('/');
    return branchName != null && index > 0 ? branchName.substring(index + 1) : branchName;
}

function getDefaultBranch(workDir: PathOrFileDescriptor, fallback: string): string {
    let result = deleteBranchPrefix(cmd(workDir, 'git symbolic-ref refs/remotes/origin/HEAD', 'git symbolic-ref refs/remotes/origin/HEAD'));
    result = isEmpty(result) ? deleteBranchPrefix(cmd(workDir, 'git symbolic-ref HEAD')) : result;
    result = !isEmpty(result) && result != null ? result.trim() : result;
    return isEmpty(result) || result == null ? fallback : result;
}

function isEmpty(input: string | null | undefined): boolean {
    return !input || input.trim().length === 0;

}

function cmd(workDir: PathOrFileDescriptor, ...commands: string[]): string | null {
    return execCmd(workDir, false, commands);
}

function cmdLog(workDir: PathOrFileDescriptor, ...commands: string[]): string | null {
    return execCmd(workDir, true, commands);
}

function execCmd(workDir: PathOrFileDescriptor, logError: boolean, commands: string[]): string | null {
    for (const command of commands) {
        let result = null;
        try {
            let devNull = os.platform().toLowerCase().startsWith('win') ? " 2>NUL" : " 2>/dev/null"
            result = require('child_process').execSync(command + (logError ? devNull : ''), {
                cwd: workDir.toString(),
                encoding: 'utf8',
                timeout: 10000
            });
        } catch (error) {
            if (logError) {
                console.debug(error)
            }
            continue;
        }
        if (!isEmpty(result)) {
            return result.trim();
        }
    }
    return null;
}

function getWorkingDirectory(workspace: string | undefined | null): PathOrFileDescriptor {
    return workspace && fs.existsSync(workspace) ? workspace : process.cwd();
}

function sortMap(input: Map<string, any>): Map<string, any> {
    const sortedEntries = Array.from(input.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return new Map(sortedEntries);
}

module.exports = {run, cmd, cmdLog};
