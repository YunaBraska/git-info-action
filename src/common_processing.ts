import {PathOrFileDescriptor} from "fs";
import os from "os";
import path from "path";
import * as fs from "fs";

export type ResultType = string | number | boolean | null;

export const LINE_SEPARATOR = os.EOL;
export const BC_PATTERN = /\Wbreaking\W?change\W/mgi;
export const TICKET_PATTERN = /(\w*)-\d+|#\d+/mgi;
export const LINE_SPLIT_REGEX = /\r?\n|\r/g;
export const CHANGE_TYPES = [
    ['major', 'major'],
    ['majors', 'major'],
    ['fix', 'patch'],
    ['fixs', 'patch'],
    ['patch', 'patch'],
    ['patchs', 'patch'],
    ['feat', 'minor'],
    ['feats', 'minor'],
    ['minor', 'minor'],
    ['refactor', 'minor'],
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

export function str(result: string | number | boolean | null | undefined): string {
    return (result ?? '').toString();
}

export function int(result: string | number | boolean | null | undefined): number {
    if (typeof result === 'number') {
        return result;
    } else if (typeof result === 'string') {
        const parsedInt = Number.parseInt(result, 10);
        if (Number.isNaN(parsedInt)) {
            return 0;
        }
        return parsedInt;
    } else {
        return 0;
    }
}

export function formatSizeUnits(bytes: number): string {
    const units = ['b', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb'];
    let index = 0;
    let size = bytes;

    while (size >= 1024 && index < units.length - 1) {
        size /= 1024;
        index++;
    }

    return `${Math.floor(size)}_${units[index]}`;
}

export function strShort(input: string, cutAt: number): string {
    input = input.trim();
    let threshold = input.endsWith('.') ? 2 : 3;
    if (cutAt > threshold && input.length > (cutAt - threshold)) {
        return input.substring(0, (cutAt - threshold)) + ".".repeat(threshold);
    } else {
        return input;
    }
}

export function separateWith(values: string[], sep: string): string {
    return values
        .filter(val => !isEmpty(val))
        .map(val => val.endsWith('.') ? val.slice(0, -1) : val)
        .filter(val => !isEmpty(val))
        .map(val => val.trim())
        .filter((val, index, arr) => arr.indexOf(val) === index)
        .join(sep);
}

export function isEmpty(input: string | number | boolean | null | undefined): boolean {
    return input === null || input === undefined || String(input).trim().length === 0;
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
        if (value === null || value === undefined || value === 'null') {
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

export function orderByChangeType(typeMap: Map<string, string[]>): Map<string, string[]> {
    const orderedMap: Map<string, string[]> = new Map();

    // Add all keys from CHANGE_TYPES in order
    for (const [key, value] of CHANGE_TYPES) {
        if (typeMap.has(key)) {
            orderedMap.set(key, typeMap.get(key)!);
        }
    }

    // Add any remaining keys
    for (const [key, value] of typeMap) {
        if (!orderedMap.has(key)) {
            orderedMap.set(key, value);
        }
    }

    return orderedMap;
}

export function listFiles(dir: PathOrFileDescriptor, deep: number, filter: string, resultList: PathOrFileDescriptor[], deep_current: number): PathOrFileDescriptor[] {
    deep_current = deep_current || 0
    resultList = resultList || []
    if (deep > -1 && deep_current > deep) {
        return resultList;
    }
    const files = fs.readdirSync(dir.toString(), {withFileTypes: true});
    for (const file of files) {
        if (file.isDirectory()) {
            listFiles(path.join(dir.toString(), file.name), deep, filter, resultList, deep_current++);
        } else if (!filter || new RegExp(filter).test(file.name)) {
            resultList.push(path.join(dir.toString(), file.name));
        }
    }
    return resultList;
}
