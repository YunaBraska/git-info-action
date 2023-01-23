"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const xmlReader = require('xmldoc');
const git = require('simple-git');
try {
    //TODO: auto update java & gradle versions
    let workDir = core.getInput('work-dir');
    let jvFallback = core.getInput('jv-fallback') || 17;
    let pvFallback = core.getInput('pv-fallback') || null;
    let deep = parseInt(core.getInput('deep')) || 1;
    let workspace = ((_a = process.env['GITHUB_WORKSPACE']) === null || _a === void 0 ? void 0 : _a.toString()) || null;
    if (!workDir || workDir === ".") {
        workDir = getWorkingDirectory(workspace);
    }
    let result = run(workDir, deep, jvFallback, pvFallback);
    result.set('deep', deep);
    result.set('work-dir', workDir);
    result.set('jv-fallback', jvFallback);
    result.set('pv-fallback', pvFallback);
    result.set('GITHUB_WORKSPACE', workspace || null);
    console.log(JSON.stringify(Object.fromEntries(result), null, 4));
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
function run2(workDir) {
    //DEFAULTS
    let result = new Map([
        ['sha_latest_commit', null],
        ['sha_latest_tag', null],
        ['tag_latest', null],
        ['branch', null],
        ['branch_default', null],
        ['is_default_branch', null],
        ['has_changes_local', null],
        ['has_changes', null],
    ]);
    //PROCESSING
    result.set('sha_latest_commit', git.raw('git', 'rev-parse', 'HEAD'));
    return result;
}
function run(workDir, deep, jvFallback, pvFallback) {
    //DEFAULTS
    let result = new Map([
        ['cmd', null],
        ['cmd_test', null],
        ['cmd_build', null],
        ['is_maven', false],
        ['is_gradle', false],
        ['has_wrapper', false],
        ['java_version', null],
        ['cmd_test_build', null],
        ['builder_version', null],
        ['project_version', null],
        ['cmd_update_deps', null],
        ['cmd_update_plugs', null],
        ['cmd_update_props', null],
        ['cmd_update_parent', null],
        ['cmd_update_wrapper', null]
    ]);
    //PROCESSING
    let mavenFiles = listMavenFiles(workDir, deep);
    let gradleFiles = listGradleFiles(workDir, deep);
    if (gradleFiles.length > 0) {
        result = readGradle(gradleFiles, result);
    }
    else if (mavenFiles.length > 0) {
        result = readMaven(mavenFiles, result);
    }
    //POST PROCESSING
    result.set('project_version', result.get('project_version') || pvFallback || null);
    result.set('java_version', result.get('java_version') || jvFallback || null);
    result.set('java_version_legacy', toLegacyJavaVersion(result.get('java_version')));
    result.set('is_gradle', gradleFiles.length > 0);
    result.set('is_maven', mavenFiles.length > 0);
    return result;
}
function readMaven(mavenFiles, result) {
    result.set('is_maven', mavenFiles.length > 0);
    mavenFiles.forEach(file => {
        try {
            let dir = path.dirname(file.toString());
            let wrapperMapFile = path.join(dir, '.mvn', 'wrapper', 'maven-wrapper.properties');
            let xmlDocument = new xmlReader.XmlDocument(fs.readFileSync(file, { encoding: 'utf-8' }));
            //PROJECT VERSION
            let projectVersion = readProjectVersionMaven(xmlDocument);
            if (projectVersion) {
                result.set('project_version', projectVersion);
            }
            //JAVA VERSION
            let javaVersion = readJavaVersionMaven(xmlDocument);
            if (javaVersion && (!result.get('java_version') || result.get('java_version') < javaVersion)) {
                result.set('java_version', javaVersion);
            }
            if (fs.existsSync(path.join(dir, 'mvnw.cmd')) || fs.existsSync(path.join(dir, 'mvnw')) || fs.existsSync(wrapperMapFile)) {
                result.set('has_wrapper', true);
            }
            if (fs.existsSync(wrapperMapFile)) {
                result.set('builder_version', readBuilderVersion(wrapperMapFile, result.get('builder_version')));
            }
        }
        catch (err) {
            console.error(err);
        }
    });
    result.set('cmd', result.get('has_wrapper') ? (process.platform === "win32" ? 'mvn.cmd' : './mvnw') : 'mvn');
    result.set('cmd_test', result.get('cmd') + ' clean test');
    result.set('cmd_build', result.get('cmd') + ' clean package -DskipTests');
    result.set('cmd_test_build', result.get('cmd') + ' clean package');
    result.set('cmd_update_deps', result.get('cmd') + ' versions:use-latest-versions -B -q -DgenerateBackupPoms=false');
    result.set('cmd_update_plugs', result.get('cmd') + ' versions:use-latest-versions -B -q -DgenerateBackupPoms=false');
    result.set('cmd_update_props', result.get('cmd') + ' versions:update-properties -B -q -DgenerateBackupPoms=false');
    result.set('cmd_update_parent', result.get('cmd') + ' versions:update-parent -B -q -DgenerateBackupPoms=false');
    result.set('cmd_resolve_plugs', result.get('cmd') + ' dependency:resolve-plugins -B -q');
    result.set('cmd_resolve_deps', result.get('cmd') + ' dependency:resolve -B -q');
    result.set('cmd_update_wrapper', result.get('cmd') + ' -B -q -N io.takari:maven:wrapper');
    return result;
}
function readProjectVersionMaven(xmlDocument) {
    var _a, _b;
    return (_b = (_a = getNodeByPath(xmlDocument, ['version'], 0)) === null || _a === void 0 ? void 0 : _a.filter(node => node.type === 'element')) === null || _b === void 0 ? void 0 : _b.map(node => { var _a; return (_a = node.val) === null || _a === void 0 ? void 0 : _a.trim(); })[0];
}
function readJavaVersionMaven(xmlDocument) {
    var _a, _b, _c, _d;
    let propertyMap = new Map((_b = (_a = getNodeByPath(xmlDocument, ['properties'], 0)[0]) === null || _a === void 0 ? void 0 : _a.children.filter(node => node.type === 'element')) === null || _b === void 0 ? void 0 : _b.map(node => [node.name, node.val]));
    let javaVersions = (_d = (_c = getNodeByPath(xmlDocument, ['build', 'plugins', 'plugin|artifactId=maven-compiler-plugin', 'configuration'], 0)[0]) === null || _c === void 0 ? void 0 : _c.children.filter(node => node.type === 'element')) === null || _d === void 0 ? void 0 : _d.map(node => { var _a; return (_a = node.val) === null || _a === void 0 ? void 0 : _a.trim(); });
    let result = null;
    javaVersions === null || javaVersions === void 0 ? void 0 : javaVersions.forEach(jv => {
        let version = javaVersionOf(jv.startsWith('${') ? propertyMap.get(jv.substring(2, jv.length - 1)) : jv);
        result = version && (!result || result < version) ? version : result;
    });
    for (const pjv of ['java.version', 'java-version', 'maven.compiler.source', 'maven.compiler.target', 'maven.compiler.release']) {
        let jv = propertyMap.get(pjv);
        let version = jv ? javaVersionOf(jv.startsWith('${') ? propertyMap.get(jv.substring(2, jv.length - 1)) : jv) : undefined;
        result = version && (!result || result < version) ? version : result;
    }
    return result;
}
function readGradle(gradleFiles, result) {
    let gradleLTS = '7.5.1';
    result.set('is_gradle', gradleFiles.length > 0);
    gradleFiles.forEach(file => {
        try {
            let dir = path.dirname(file.toString());
            let wrapperMapFile = path.join(dir, 'gradle', 'wrapper', 'gradle-wrapper.properties');
            let propertyMap = readPropertiesGradle(file);
            //PROJECT_VERSION
            let projectVersion = getMapValue(propertyMap, 'project.version', '\\d+');
            if (projectVersion) {
                result.set('project_version', projectVersion);
            }
            //JAVA_VERSION
            let javaVersion = readJavaVersionGradle(propertyMap);
            if (javaVersion && (!result.get('java_version') || result.get('java_version') < javaVersion)) {
                result.set('java_version', javaVersion);
            }
            if (fs.existsSync(path.join(dir, 'gradle.bat')) || fs.existsSync(path.join(dir, 'gradlew')) || fs.existsSync(wrapperMapFile)) {
                result.set('has_wrapper', true);
            }
            if (fs.existsSync(wrapperMapFile)) {
                result.set('builder_version', readBuilderVersion(wrapperMapFile, result.get('builder_version')));
            }
        }
        catch (err) {
            console.error(err);
        }
    });
    result.set('cmd', result.get('has_wrapper') ? (process.platform === "win32" ? 'gradle.bat' : './gradlew') : 'gradle');
    result.set('cmd_test', result.get('cmd') + ' clean test');
    result.set('cmd_build', result.get('cmd') + ' clean build -x test');
    result.set('cmd_test_build', result.get('cmd') + ' clean build');
    result.set('cmd_update_deps', result.get('cmd') + ' check');
    result.set('cmd_update_plugs', result.get('cmd') + ' check');
    result.set('cmd_update_props', result.get('cmd') + ' check');
    result.set('cmd_update_parent', result.get('cmd') + ' check');
    result.set('cmd_resolve_plugs', result.get('cmd') + ' check');
    result.set('cmd_resolve_deps', result.get('cmd') + ' --refresh-dependencies check -x test');
    result.set('cmd_update_wrapper', result.get('cmd') + ' wrapper --gradle-version ' + gradleLTS);
    return result;
}
function readBuilderVersion(wrapperMapFile, fallback) {
    if (fs.existsSync(wrapperMapFile.toString())) {
        let wrapperMap = readPropertiesGradle(wrapperMapFile);
        let distributionUrl = wrapperMap.get('distributionUrl');
        let builderVersion = distributionUrl ? new RegExp('(\\d[\._]?){2,}').exec(distributionUrl) : null;
        return builderVersion ? builderVersion[0] : fallback;
    }
    return fallback;
}
function javaVersionOf(string) {
    if (string) {
        string = string.includes("_") ? string.substring(string.indexOf("_") + 1) : string;
        string = string.includes(".") ? string.substring(string.indexOf(".") + 1) : string;
        return parseInt(string.trim());
    }
    return null;
}
function readJavaVersionGradle(propertyMap) {
    let value = getMapValue(propertyMap, 'sourceCompatibility', '\\d+') || getMapValue(propertyMap, 'targetCompatibility', '\\d+');
    return value ? javaVersionOf(value) : null;
}
function readPropertiesGradle(file) {
    let result = new Map;
    fs.readFileSync(file, { encoding: 'utf-8' }).split(/\r?\n/).forEach(function (line) {
        let eq = line.indexOf('=');
        if (eq > 0) {
            let key = line.substring(0, eq).trim();
            let spaceIndex = key.lastIndexOf(' ');
            key = spaceIndex > 0 ? key.substring(spaceIndex + 1).trim() : key;
            let value = line.substring(eq + 1).trim().replace(/['"]+/g, '');
            let counter = getKeyOccurrence(result, key);
            result.set(counter > 0 ? key + '#' + counter : key, value);
        }
        else if (!result.get('sourceCompatibility') && !result.get('targetCompatibility') && line.includes('languageVersion.set')) {
            result.set('targetCompatibility', line.trim()
                .replace('JavaLanguageVersion', '')
                .replace('languageVersion.set', '')
                .replace('.of', '').trim()
                .replace(/[()]+/g, '')
                .replace(/['"]+/g, ''));
        }
    });
    return result;
}
function listGradleFiles(workDir, deep) {
    return listFiles(workDir, !deep ? 1 : deep, 'build\.gradle.*', [], 0);
}
function listMavenFiles(workDir, deep) {
    return listFiles(workDir, !deep ? 1 : deep, 'pom.*\.xml', [], 0);
}
function listFiles(dir, deep, filter, resultList, deep_current) {
    deep = deep || 1;
    deep_current = deep_current || 0;
    resultList = resultList || [];
    if (deep > -1 && deep_current > deep) {
        return resultList;
    }
    const files = fs.readdirSync(dir.toString(), { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            listFiles(path.join(dir.toString(), file.name), deep, filter, resultList, deep_current++);
        }
        else if (!filter || new RegExp(filter).test(file.name)) {
            resultList.push(path.join(dir.toString(), file.name));
        }
    }
    return resultList;
}
function getWorkingDirectory(workspace) {
    return workspace && fs.existsSync(workspace) ? workspace : process.cwd();
}
function getNodeByPath(node, nodeNames, index) {
    index = index || 0;
    if (nodeNames.length === index) {
        return [node];
    }
    let nodeName = nodeNames[index].split('|');
    return node.childrenNamed(nodeName[0])
        .filter(node => node.type === 'element')
        .filter(node => matchFilter(node, nodeName[1]))
        .filter(node => node.childrenNamed(nodeNames[index + 1]))
        .flatMap(node => getNodeByPath(node, nodeNames, index + 1));
}
function matchFilter(node, filter) {
    var _a;
    if (!node || !filter) {
        return true;
    }
    let kv = filter.split('=');
    let childNode = node.childrenNamed(kv[0]);
    return childNode && ((_a = childNode[0]) === null || _a === void 0 ? void 0 : _a.val) === kv[1];
}
function toLegacyJavaVersion(javaVersion) {
    if (javaVersion) {
        return javaVersion < 10 ? '1.' + javaVersion : javaVersion.toString();
    }
    return null;
}
function getKeyOccurrence(map, key) {
    if (map.get(key)) {
        let count = 0;
        map.forEach((v, k) => {
            k = k.includes('#') ? k.substring(0, k.indexOf('#')) : k;
            if (key === k) {
                count++;
            }
        });
        return count;
    }
    return 0;
}
function getMapValue(map, key, regex) {
    if (map.get(key)) {
        for (let [mapKey, mapValue] of map) {
            if (mapValue !== key && (mapKey === key || mapKey.startsWith(key + '#'))) {
                mapValue = map.get(mapValue) || mapValue;
                if (!regex || (mapValue && new RegExp(regex).exec(mapValue))) {
                    return mapValue;
                }
            }
        }
    }
    return null;
}
module.exports = { run, run2, listGradleFiles, listMavenFiles };
