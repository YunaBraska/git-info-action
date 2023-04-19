"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBadges = void 0;
const fs_1 = require("fs");
const common_processing_1 = require("./common_processing");
const REGEX_BADGE_GENERIC = /!\[c_(.*?)]\s*\(.*\/badge\/(.*?)(\?.*?)?\)/mg;
const brightgreen = '4c1';
const green = '97CA00';
const yellowgreen = 'a4a61d';
const yellow = 'dfb317';
const orange = 'fe7d37';
const red = 'e05d44';
const blue = '007EC6';
const grey = '555';
const lightgrey = '9f9f9f';
const pink = 'ffc0cb';
const purple = '9370db';
function setColor(key, val, color) {
    if (key.startsWith('is_')) {
        if (val === 'true') {
            color = green;
        }
        else if (val === 'false') {
            color = red;
        }
    }
    else if (key.endsWith('_version')) {
        if (val.startsWith("0") || val.startsWith("v0") || val.startsWith("v0") || val.includes("+") || val.includes("rc")) {
            color = orange;
        }
        else {
            color = green;
        }
    }
    else if (key === 'repo_star_count') {
        let count = (0, common_processing_1.int)(val);
        if (count < 10) {
            color = orange;
        }
        else if (count < 50) {
            color = yellow;
        }
        else if (count < 100) {
            color = yellowgreen;
        }
        else if (count < 500) {
            color = green;
        }
        else if (count < 1000) {
            color = brightgreen;
        }
        else if (count < 10000) {
            color = purple;
        }
        else if (count < 50000) {
            color = pink;
        }
        else {
            color = grey;
        }
    }
    else if (key === 'branch' || key === 'branch_default') {
        if (val === 'main' || val === 'master') {
            color = green;
        }
        else if (val === 'dev' || val === 'develop') {
            color = yellow;
        }
        else {
            color = orange;
        }
    }
    else if (key === 'repo_name') {
        color = blue;
    }
    else if (key === 'repo_size') {
        if (val.endsWith('kb')) {
            color = green;
        }
        else if (val.endsWith('mb')) {
            color = yellowgreen;
        }
        else if (val.endsWith('gb')) {
            color = yellow;
        }
        else if (val.endsWith('tb')) {
            color = orange;
        }
        else if (val.endsWith('pb') || val.endsWith('eb') || val.endsWith('zb') || val.endsWith('yb')) {
            color = red;
        }
        else if (val.endsWith('b')) {
            color = brightgreen;
        }
    }
    return color;
}
function updateBadges(result, workDir, deep) {
    (0, common_processing_1.listFiles)(workDir, deep, '.*\\.(md|markdown|mdown|mkd|mdwn|mdtext|mdtxt)', [], 0).forEach(file => {
        const fileContentOrg = (0, fs_1.readFileSync)(file, 'utf-8');
        let content = (0, common_processing_1.str)(fileContentOrg);
        content = content.replace(REGEX_BADGE_GENERIC, (match, key, link) => {
            // Get the value from the result map based on the captured key
            return updateLink(key, clearKeyOrValue((0, common_processing_1.str)(result.get(key))), match, (0, common_processing_1.str)(link));
        });
        // Write the updated content back to the file
        if (content !== fileContentOrg) {
            (0, fs_1.writeFileSync)(file, content, 'utf-8');
        }
    });
}
exports.updateBadges = updateBadges;
function updateLink(key, value, match, link) {
    if (key === 'repo_size') {
        value = value + ' ' + (0, common_processing_1.formatSizeUnits)((0, common_processing_1.int)(value));
    }
    let color;
    if ((0, common_processing_1.isEmpty)(value)) {
        value = 'not_available';
        color = red;
    }
    else {
        color = orange;
        color = setColor(key, value, (0, common_processing_1.isEmpty)(color) ? orange : color);
    }
    //format key
    key = clearKeyOrValue(key);
    key = key === 'repo_star_count' ? 'stars' : key;
    // Replace the link with the new value
    if (match.toLowerCase().includes('shields.io')) {
        return match.replace(link, `${key}-${value}-${color}`);
    }
    else if (match.toLowerCase().includes('badgen.net')) {
        return match.replace(link, `${key}/${value}/${color}`);
    }
    return match;
}
function clearKeyOrValue(keyOrValue) {
    return (keyOrValue.toLowerCase().startsWith('x_') ? keyOrValue.substring(2) : keyOrValue).trim().replace(/[^a-zA-Z0-9\\.]/g, '_').replace('__', '_').replace('._', '.');
}
