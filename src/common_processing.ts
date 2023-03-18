import {PathOrFileDescriptor} from "fs";
import os from "os";

export type ResultType = string | number | boolean | null;

export const LINE_SEPARATOR = os.EOL;
export const BC_PATTERN = /\Wbreaking\W?change\W/mgi;
export const TICKET_PATTERN = /(\w*)-\d+|#\d+/mgi;
export const LINE_SPLIT_REGEX = /\r?\n|\r/g;

export function str(result: string | number | boolean | null | undefined): string {
    return (result ?? '').toString();
}

export function isEmpty(input: string | null | undefined): boolean {
    return !input || input.trim().length === 0;

}

export function getTicketNumbers(commits: string[][]): string[] {
    let tickets: string[] = [];
    commits.forEach(commit => {
        commit[3]?.trim()?.split(LINE_SPLIT_REGEX)?.forEach(c =>
            c.trim().match(TICKET_PATTERN)?.forEach(ticket => tickets.push(ticket.trim()))
        );
    });
    return tickets;
}

export function deleteBranchPrefix(branchName: string | null): string | null {
    let index = branchName == null ? -1 : branchName.lastIndexOf('/');
    return branchName != null && index > 0 ? branchName.substring(index + 1) : branchName;
}

export function sortMap(input: Map<string, any>): Map<string, any> {
    const sortedEntries = Array.from(input.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return new Map(sortedEntries);
}

export function replaceNullWithEmptyMap(input: Map<string, any>): Map<string, any> {
    const output = new Map<string, any>();
    input.forEach((value, key) => {
        if (value === null || value === undefined) {
            output.set(key, '');
        } else {
            output.set(key, value);
        }
    });
    return output;
}

export function cmd(workDir: PathOrFileDescriptor, ...commands: string[]): string | null {
    return execCmd(workDir, false, commands);
}

export function cmdLog(workDir: PathOrFileDescriptor, ...commands: string[]): string | null {
    return execCmd(workDir, true, commands);
}

export function toCommitMessages(messages: string | null): string[][] {
    let result: string[][] = [];
    let commit = ""
    let author = ""
    let date = ""
    let msg = ""
    str(messages).split(LINE_SPLIT_REGEX).forEach(line => {
        if (line.startsWith('commit ')) {
            if (!isEmpty(commit)) {
                result.push([commit, author, date, msg]);
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
        result.push([commit, author, date, msg.trim()]);
    }
    return result;
}

export function toSemanticCommit(message: string, fallbackCommitType: string, fallbackCommitScope: string, commitMsgWithFooter: boolean): string[] {
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
        body = body.split(LINE_SPLIT_REGEX)[0]
    }
    return [type, scope, str(breakingChange), body];
}

export function execCmd(workDir: PathOrFileDescriptor, logError: boolean, commands: string[]): string | null {
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
