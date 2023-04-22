import {PathOrFileDescriptor, readFileSync, writeFileSync} from "fs";
import {formatSizeUnits, int, isEmpty, listFiles, ResultType, str} from './common_processing';

const REGEX_BADGE_GENERIC = /!\[c_(.*?)]\s*\(.*\/badge\/(.*?)(\?.*?)?\)/mg;

const brightgreen = '4c1'
const green = '97CA00'
const yellowgreen = 'a4a61d'
const yellow = 'dfb317'
const orange = 'fe7d37'
const red = 'e05d44'
const blue = '007EC6'
const grey = '555'
const lightgrey = '9f9f9f'
const pink = 'ffc0cb'
const purple = '9370db'

function setColor(key: string, val: string, color: string): string {
    if (key.startsWith('is_')) {
        if (val === 'true') {
            color = green;
        } else if (val === 'false') {
            color = red;
        }
    } else if (key.endsWith('_version')) {
        if (val.startsWith("0") || val.startsWith("v0") || val.startsWith("v0") || val.includes("+") || val.includes("rc")) {
            color = orange;
        } else {
            color = green;
        }
    } else if (key === 'repo_star_count') {
        let count = int(val);
        if (count < 10) {
            color = orange;
        } else if (count < 50) {
            color = yellow;
        } else if (count < 100) {
            color = yellowgreen;
        } else if (count < 500) {
            color = green;
        } else if (count < 1000) {
            color = brightgreen;
        } else if (count < 10000) {
            color = purple;
        } else if (count < 50000) {
            color = pink;
        } else {
            color = grey;
        }
    } else if (key === 'branch' || key === 'branch_default') {
        if (val === 'main' || val === 'master') {
            color = green;
        } else if (val === 'dev' || val === 'develop') {
            color = yellow;
        } else {
            color = orange;
        }
    } else if (key === 'repo_name') {
        color = blue;
    } else if (key === 'repo_size') {
        if (val.endsWith('kb')) {
            color = green;
        } else if (val.endsWith('mb')) {
            color = yellowgreen;
        } else if (val.endsWith('gb')) {
            color = yellow;
        } else if (val.endsWith('tb')) {
            color = orange;
        } else if (val.endsWith('pb') || val.endsWith('eb') || val.endsWith('zb') || val.endsWith('yb')) {
            color = red;
        } else if (val.endsWith('b')) {
            color = brightgreen;
        }
    }
    return color;
}

export function updateBadges(result: Map<string, ResultType>, workDir: string | Buffer | URL | number, deep: number) {
    listFiles(workDir, deep, '.*\\.(md|markdown|mdown|mkd|mdwn|mdtext|mdtxt)', [], 0).forEach(file => {
        const fileContentOrg = readFileSync(file, 'utf-8');
        let content = str(fileContentOrg);
        content = content.replace(REGEX_BADGE_GENERIC, (match, key, link) => {
            // Get the value from the result map based on the captured key
            return updateLink(file, key, clearKeyOrValue(str(result.get(key))), match, str(link));
        });

        // Write the updated content back to the file
        if (content !== fileContentOrg) {
            writeFileSync(file, content, 'utf-8');
        }
    });
}

function updateLink(file: PathOrFileDescriptor, key: string, value: string, match: string, link: string) {
    if (key === 'repo_size') {
        value = value + ' ' + formatSizeUnits(int(value));
    }

    let color: string;
    if (isEmpty(value)) {
        value = 'not_available';
        color = red;
        console.warn(`Badges/Shields Updater: key [${key}] does not match any output variable. File [${file}]`)
    } else {
        color = orange;
        color = setColor(key, value, isEmpty(color) ? orange : color);
    }

    //format key
    key = clearKeyOrValue(key)
    key = key === 'repo_star_count' ? 'stars' : key;
    // Replace the link with the new value
    if (match.toLowerCase().includes('shields.io')) {
        return match.replace(link, `${key}-${value}-${color}`);
    } else if (match.toLowerCase().includes('badgen.net')) {
        return match.replace(link, `${key}/${value}/${color}`);
    }
    return match
}

function clearKeyOrValue(keyOrValue: string): string {
    return (keyOrValue.toLowerCase().startsWith('x_') ? keyOrValue.substring(2) : keyOrValue).trim().replace(/[^a-zA-Z0-9\\.]/g, '_').replace('__', '_').replace('._', '.');
}


