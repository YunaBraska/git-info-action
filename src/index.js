"use strict";
var _a;
exports.__esModule = true;
var os = require('os');
var fs = require('fs');
var core = require('@actions/core');
var LINE_SEPARATOR = os.EOL;
var BC_PATTERN = /\Wbreaking\W?change\W/mgi;
var TICKET_PATTERN = /(\w*)-\d+|#\d+/mgi;
//FILE ENDINGS
var fileEndingsMap = new Map([["js", [".js", ".mjs", ".cjs"]],
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
    var workDir = core.getInput('work-dir');
    var ignoreFilesStr = core.getInput('ignore-files') || null;
    var branchFallback = core.getInput('branch-fallback') || null;
    var tagFallback = core.getInput('tag-fallback') || null;
    var fallbackCommitType = core.getInput('fallback-commit-type');
    var fallbackCommitScope = core.getInput('fallback-commit-scope');
    var commitMsgWithFooter = core.getInput('commit-msg-with-footer');
    var workspace = ((_a = process.env['GITHUB_WORKSPACE']) === null || _a === void 0 ? void 0 : _a.toString()) || null;
    if (!workDir || workDir === ".") {
        workDir = getWorkingDirectory(workspace);
    }
    var ignoreFiles = isEmpty(ignoreFilesStr) ? new Set() : ignoreFilesStr.split(',');
    var result = run(workDir, ignoreFiles, branchFallback, tagFallback, !isEmpty(fallbackCommitType) ? fallbackCommitType : "", !isEmpty(fallbackCommitScope) ? fallbackCommitScope : "", !isEmpty(commitMsgWithFooter) ? commitMsgWithFooter.toLowerCase() === 'true' : true);
    result.set('GITHUB_WORKSPACE', workspace || null);
    console.log(JSON.stringify(Object.fromEntries(sortMap(result)), null, 4));
    result.forEach(function (value, key) {
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
function run(workDir, ignoreFiles, branchFallback, tagFallback, fallbackCommitType, fallbackCommitScope, commitMsgWithFooter) {
    //DEFAULTS
    var result = new Map();
    branchFallback = isEmpty(branchFallback) ? 'main' : branchFallback;
    ignoreFiles = new Set(Array.from(ignoreFiles, function (s) { return s.trim(); }));
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
    var gitStatus = cmd(workDir, 'git status --porcelain');
    cmd(workDir, 'git fetch --all --tags');
    result.set('is_git_repo', !isEmpty(cmd(workDir, 'git rev-parse --is-inside-work-tree', 'git rev-parse --git-dir')));
    result.set('branch', deleteBranchPrefix(cmd(workDir, 'git branch --show-current', 'git branch --show', 'git rev-parse --abbrev-ref HEAD', 'git rev-parse --abbrev-ref --symbolic-full-name @{u}')));
    result.set('branch_default', getDefaultBranch(workDir, branchFallback));
    result.set('is_default_branch', result.get('branch') === result.get('branch_default') && result.get('branch') !== null);
    result.set('sha_latest', cmd(workDir, 'git rev-parse HEAD'));
    result = setLatestTag(workDir, result, tagFallback);
    result.set('has_changes', result.get('sha_latest') !== result.get('sha_latest_tag'));
    var changedFiles = toFilesSet(ignoreFiles, cmd(workDir, 'git diff ' + result.get('sha_latest') + ' ' + result.get('sha_latest_tag') + ' --name-only'));
    var changedLocalFiles = toFilesSet(ignoreFiles, gitStatus);
    result.set('has_local_changes', changedLocalFiles && changedLocalFiles.size > 0);
    fileEndingsMap.forEach(function (fileEndings, language) {
        result.set('x_has_local_changes_' + language.toLowerCase(), hasFileEnding(changedLocalFiles, fileEndings));
    });
    fileEndingsMap.forEach(function (fileEndings, language) {
        result.set('x_has_changes_' + language.toLowerCase(), hasFileEnding(changedFiles, fileEndings));
    });
    var languages = Array.from(fileEndingsMap.keys());
    languages.sort();
    result.set('x_language_list', languages.join(', '));
    var aheadBehind = cmd(workDir, 'git rev-list --count --left-right ' + result.get('branch') + '...' + result.get('branch_default'));
    var ahead = isEmpty(aheadBehind) ? null : aheadBehind === null || aheadBehind === void 0 ? void 0 : aheadBehind.split(/\s/)[0].trim();
    var behind = isEmpty(aheadBehind) ? null : aheadBehind === null || aheadBehind === void 0 ? void 0 : aheadBehind.split(/\s/)[1].trim();
    result.set('commits_ahead', parseInt(ahead || '0'));
    result.set('commits_behind', parseInt(behind || '0'));
    if (result.get("has_changes")) {
        var commits = toCommitMessages(cmd(workDir, 'git log ' + result.get('sha_latest_tag') + '..' + result.get('sha_latest')))
            .map(function (commit) { return toSemanticCommit(commit[3], fallbackCommitType, fallbackCommitScope, commitMsgWithFooter); });
        result.set("ticket_numbers", getTicketNumbers(commits).join(', '));
        result.set("has_breaking_changes", commits.some(function (_a) {
            var _ = _a[0], __ = _a[1], breakingChange = _a[2];
            return !isEmpty(breakingChange) ? breakingChange.toLowerCase() === 'true' : false;
        }));
        var typeMap_1 = new Map();
        var scopeMap_1 = new Map();
        commits.forEach(function (commit) {
            if (commit.length >= 1 && !isEmpty(commit[0])) {
                var message = typeMap_1.has(commit[0]) ? typeMap_1.get(commit[0]) : [];
                message.push(commit[3]);
                typeMap_1.set(commit[0], message);
            }
            if (commit.length >= 2 && !isEmpty(commit[1])) {
                var message = scopeMap_1.has(commit[1]) ? scopeMap_1.get(commit[1]) : [];
                message.push(commit[3]);
                scopeMap_1.set(commit[1], message);
            }
        });
        result.set("commit_types", Array.from(sortMap(typeMap_1).keys()).join(', '));
        result.set("commit_scopes", Array.from(sortMap(scopeMap_1).keys()).join(', '));
        typeMap_1.forEach(function (value, key) {
            result.set("commit_type_" + key, value.join(". ".concat(LINE_SEPARATOR)));
        });
        scopeMap_1.forEach(function (value, key) {
            result.set("commit_scope_" + key, value.join(". ".concat(LINE_SEPARATOR)));
        });
    }
    return result;
}
function getTicketNumbers(commits) {
    var tickets = [];
    commits.forEach(function (commit) {
        var _a, _b;
        (_b = (_a = commit[3]) === null || _a === void 0 ? void 0 : _a.match(TICKET_PATTERN)) === null || _b === void 0 ? void 0 : _b.forEach(function (ticket) { return tickets.push(ticket.trim()); });
    });
    return tickets;
}
function toCommitMessages(messages) {
    var result = [];
    var commit = "";
    var author = "";
    var date = "";
    var msg = "";
    str(messages).split(/\r?\n|\r/).forEach(function (line) {
        if (line.startsWith('commit ')) {
            if (!isEmpty(commit)) {
                result.push([commit, author, date, msg]);
                msg = "";
            }
            commit = line.substring('commit '.length);
        }
        else if (line.startsWith('Author: ')) {
            author = line.substring('Author: '.length);
        }
        else if (line.startsWith('Date: ')) {
            date = line.substring('Date: '.length);
        }
        else if (!isEmpty(line)) {
            msg += line.trim() + LINE_SEPARATOR;
        }
        console.log(line);
    });
    if (!isEmpty(commit)) {
        result.push([commit, author, date, msg.trim()]);
    }
    return result;
}
function toSemanticCommit(message, fallbackCommitType, fallbackCommitScope, commitMsgWithFooter) {
    message = message ? message : "";
    var typeIndex = message.indexOf(":");
    var scopeStartIndex = message.indexOf("(");
    var scopeEndIndex = message.indexOf(")");
    var bcIndex = message.indexOf("!");
    var type = typeIndex != -1 ? message.substring(0, Math.min.apply(Math, [typeIndex, scopeStartIndex, scopeEndIndex, bcIndex].filter(function (i) { return i !== -1; }))) : fallbackCommitType;
    var scope = typeIndex != -1 && scopeEndIndex < typeIndex && scopeStartIndex < scopeEndIndex ? message.substring(scopeStartIndex + 1, scopeEndIndex) : fallbackCommitScope;
    var breakingChange = Boolean((bcIndex + 1 == typeIndex) || message.match(BC_PATTERN));
    var body = typeIndex != -1 ? message.substring(typeIndex + 1).trim() : message.trim();
    body = body + (body.endsWith('.') ? "" : ".");
    body = isEmpty(body) ? "" : body.charAt(0).toUpperCase() + body.slice(1);
    if (!commitMsgWithFooter && (body.includes('\n') || body.includes('\r'))) {
        body = body.split(/\r?\n|\r/)[0];
    }
    return [type, scope, str(breakingChange), body];
}
function str(result) {
    return (result !== null && result !== void 0 ? result : '').toString();
}
function toFilesSet(ignoreFiles, changesLog) {
    var result = new Set();
    if (isEmpty(changesLog) || changesLog === null) {
        return result;
    }
    for (var _i = 0, _a = changesLog.split(/\r?\n|\r/); _i < _a.length; _i++) {
        var line = _a[_i];
        if (!isEmpty(line) && line.includes('.')) {
            result.add(line.trim());
        }
    }
    return ignoreFiles && ignoreFiles.size > 0
        ? new Set(Array.from(result).filter(function (file) {
            return !Array.from(ignoreFiles).some(function (regex) { return new RegExp(regex).test(file); });
        }))
        : result;
}
function hasFileEnding(fileNames, fileEndings) {
    return Array.from(fileNames).some(function (fileName) {
        return fileEndings.some(function (ending) { return fileName.toLowerCase().endsWith(ending.toLowerCase()); });
    });
}
function setLatestTag(workDir, result, tagFallback) {
    var latestTag = cmd(workDir, 'git describe --tags --abbrev=0');
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
    var index = branchName == null ? -1 : branchName.lastIndexOf('/');
    return branchName != null && index > 0 ? branchName.substring(index + 1) : branchName;
}
function getDefaultBranch(workDir, fallback) {
    var result = deleteBranchPrefix(cmd(workDir, 'git symbolic-ref refs/remotes/origin/HEAD', 'git symbolic-ref refs/remotes/origin/HEAD'));
    result = isEmpty(result) ? deleteBranchPrefix(cmd(workDir, 'git symbolic-ref HEAD')) : result;
    result = !isEmpty(result) && result != null ? result.trim() : result;
    return isEmpty(result) || result == null ? fallback : result;
}
function isEmpty(input) {
    return !input || input.trim().length === 0;
}
function cmd(workDir) {
    var commands = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        commands[_i - 1] = arguments[_i];
    }
    return execCmd(workDir, false, commands);
}
function cmdLog(workDir) {
    var commands = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        commands[_i - 1] = arguments[_i];
    }
    return execCmd(workDir, true, commands);
}
function execCmd(workDir, logError, commands) {
    for (var _i = 0, commands_1 = commands; _i < commands_1.length; _i++) {
        var command = commands_1[_i];
        var result = null;
        try {
            var devNull = os.platform().toLowerCase().startsWith('win') ? " 2>NUL" : " 2>/dev/null";
            result = require('child_process').execSync(command + (logError ? devNull : ''), {
                cwd: workDir.toString(),
                encoding: 'utf8',
                timeout: 10000
            });
        }
        catch (error) {
            if (logError) {
                console.debug(error);
            }
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
    var sortedEntries = Array.from(input.entries()).sort(function (a, b) { return a[0].localeCompare(b[0]); });
    return new Map(sortedEntries);
}
module.exports = { run: run, cmd: cmd, cmdLog: cmdLog };
