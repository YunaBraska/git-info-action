"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execCmd = exports.toSemanticCommit = exports.toCommitMessages = exports.cmdLog = exports.cmd = exports.replaceNullWithEmptyMap = exports.sortMap = exports.deleteBranchPrefix = exports.getTicketNumbers = exports.isEmpty = exports.str = exports.CHANGE_TYPES = exports.LINE_SPLIT_REGEX = exports.TICKET_PATTERN = exports.BC_PATTERN = exports.LINE_SEPARATOR = void 0;
const os_1 = __importDefault(require("os"));
exports.LINE_SEPARATOR = os_1.default.EOL;
exports.BC_PATTERN = /\Wbreaking\W?change\W/mgi;
exports.TICKET_PATTERN = /(\w*)-\d+|#\d+/mgi;
exports.LINE_SPLIT_REGEX = /\r?\n|\r/g;
exports.CHANGE_TYPES = [
    ['major', 'major'],
    ['majors', 'major'],
    ['fix', 'patch'],
    ['fixs', 'patch'],
    ['patch', 'patch'],
    ['patchs', 'patch'],
    ['refactor', 'minor'],
    ['feats', 'minor'],
    ['feat', 'minor'],
    ['minor', 'minor'],
    ['build', 'rc'],
    ['builds', 'rc'],
    ['rc', 'rc'],
    ['ci', 'rc'],
    ['docs', 'rc'],
    ['doc', 'rc'],
    ['style', 'rc'],
    ['styles', 'rc'],
    ['perf', 'rc'],
    ['test', 'rc'],
    ['tests', 'rc'],
    ['chore', 'rc'],
    ['core', 'rc']
];
function str(result) {
    return (result !== null && result !== void 0 ? result : '').toString();
}
exports.str = str;
function isEmpty(input) {
    return input === null || input === undefined || String(input).trim().length === 0;
}
exports.isEmpty = isEmpty;
function getTicketNumbers(commits) {
    let tickets = [];
    commits.forEach(commit => {
        var _a, _b, _c;
        (_c = (_b = (_a = commit[3]) === null || _a === void 0 ? void 0 : _a.trim()) === null || _b === void 0 ? void 0 : _b.split(exports.LINE_SPLIT_REGEX)) === null || _c === void 0 ? void 0 : _c.forEach(c => { var _a; return (_a = c.trim().match(exports.TICKET_PATTERN)) === null || _a === void 0 ? void 0 : _a.forEach(ticket => tickets.push(ticket.trim())); });
    });
    return tickets;
}
exports.getTicketNumbers = getTicketNumbers;
function deleteBranchPrefix(branchName) {
    let index = branchName == null ? -1 : branchName.lastIndexOf('/');
    return branchName != null && index > 0 ? branchName.substring(index + 1) : branchName;
}
exports.deleteBranchPrefix = deleteBranchPrefix;
function sortMap(input) {
    const sortedEntries = Array.from(input.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return new Map(sortedEntries);
}
exports.sortMap = sortMap;
function replaceNullWithEmptyMap(input) {
    const output = new Map();
    input.forEach((value, key) => {
        if (value === null || value === undefined || value === 'null') {
            output.set(key, '');
        }
        else {
            output.set(key, value);
        }
    });
    return output;
}
exports.replaceNullWithEmptyMap = replaceNullWithEmptyMap;
function cmd(workDir, ...commands) {
    return execCmd(workDir, false, commands);
}
exports.cmd = cmd;
function cmdLog(workDir, ...commands) {
    return execCmd(workDir, true, commands);
}
exports.cmdLog = cmdLog;
function toCommitMessages(messages) {
    let result = [];
    let commit = "";
    let author = "";
    let date = "";
    let msg = "";
    str(messages).split(exports.LINE_SPLIT_REGEX).forEach(line => {
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
            msg += line.trim() + exports.LINE_SEPARATOR;
        }
        console.log(line);
    });
    if (!isEmpty(commit)) {
        result.push([commit, author, date, msg.trim()]);
    }
    return result;
}
exports.toCommitMessages = toCommitMessages;
function toSemanticCommit(message, fallbackCommitType, fallbackCommitScope, commitMsgWithFooter) {
    message = message ? message : "";
    let typeIndex = message.indexOf(":");
    let scopeStartIndex = message.indexOf("(");
    let scopeEndIndex = message.indexOf(")");
    let bcIndex = message.indexOf("!");
    let type = typeIndex != -1 ? message.substring(0, Math.min(...[typeIndex, scopeStartIndex, scopeEndIndex, bcIndex].filter(i => i !== -1))) : fallbackCommitType;
    let scope = typeIndex != -1 && scopeEndIndex < typeIndex && scopeStartIndex < scopeEndIndex ? message.substring(scopeStartIndex + 1, scopeEndIndex) : fallbackCommitScope;
    let breakingChange = Boolean((bcIndex + 1 == typeIndex) || message.match(exports.BC_PATTERN));
    let body = typeIndex != -1 ? message.substring(typeIndex + 1).trim() : message.trim();
    body = body + (body.endsWith('.') ? "" : ".");
    body = isEmpty(body) ? "" : body.charAt(0).toUpperCase() + body.slice(1);
    if (!commitMsgWithFooter && (body.includes('\n') || body.includes('\r'))) {
        body = body.split(exports.LINE_SPLIT_REGEX)[0];
    }
    return [type, scope, str(breakingChange), body];
}
exports.toSemanticCommit = toSemanticCommit;
function execCmd(workDir, logError, commands) {
    for (const command of commands) {
        let result = null;
        try {
            let devNull = os_1.default.platform().toLowerCase().startsWith('win') ? " 2>NUL" : " 2>/dev/null";
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
exports.execCmd = execCmd;
