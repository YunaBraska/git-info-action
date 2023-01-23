import {PathOrFileDescriptor} from "fs";

const main = require('../src/index')
const path = require('path');
const fs = require('fs');

// ########## GRADLE ##########

test('[GRADLE] Read empty dir', () => {
    let dir = createEmptyDir(path.join(__dirname, 'resources/gradle/empty'));
    let result = main.run2(dir);
});

test('[GRADLE] Read highest Java Version should be 17', () => {
    let result_src = main.run(path.join(__dirname, 'resources/gradle/source'), -1, -1);
    expect(result_src.get('java_version')).toEqual(17)
    expect(result_src.get('is_gradle')).toEqual(true)
    expect(result_src.get('is_maven')).toEqual(false)
    expect(result_src.get('has_wrapper')).toEqual(true)
    expect(result_src.get('builder_version')).toEqual('7.5')
    expect(result_src.get('cmd')).toEqual(process.platform === "win32" ? 'gradle.bat' : './gradlew')

    let result_lv = main.run(path.join(__dirname, 'resources/gradle/language_version'), -1, -1);
    expect(result_lv.get('java_version')).toEqual(17)
    expect(result_lv.get('is_gradle')).toEqual(true)
    expect(result_lv.get('is_maven')).toEqual(false)
    expect(result_lv.get('has_wrapper')).toEqual(true)
    expect(result_lv.get('builder_version')).toEqual('7.5')
    expect(result_lv.get('cmd')).toEqual(process.platform === "win32" ? 'gradle.bat' : './gradlew')
});

test('[GRADLE] Read highest Java Version with deep limit 1 should be 11', () => {
    let result_src = main.run(path.join(__dirname, 'resources/gradle'), 1, -1);
    expect(result_src.get('java_version')).toEqual(11)
    expect(result_src.get('is_gradle')).toEqual(true)
    expect(result_src.get('is_maven')).toEqual(false)
    expect(result_src.get('has_wrapper')).toEqual(false)
    expect(result_src.get('builder_version')).toEqual(null)
    expect(result_src.get('cmd')).toEqual('gradle')

    let result_lv = main.run(path.join(__dirname, 'resources/gradle/language_version'), 1, -1);
    expect(result_lv.get('java_version')).toEqual(11)
    expect(result_lv.get('is_gradle')).toEqual(true)
    expect(result_lv.get('is_maven')).toEqual(false)
    expect(result_lv.get('has_wrapper')).toEqual(false)
    expect(result_lv.get('builder_version')).toEqual(null)
    expect(result_lv.get('cmd')).toEqual('gradle')
});

test('[GRADLE] Read each file should have expected result', () => {
    (main.listGradleFiles(path.dirname(__filename), -1) as PathOrFileDescriptor[]).forEach(file => {
        let dir = path.dirname(file.toString());
        let result = main.run(dir, 1);

        let hasWrapper = dir.includes('wrapper');
        let expectedVersion = javaVersionOfPath(dir);
        let expectedProjectVersion = projectVersionOfPath(dir);
        expect(result.get('java_version')).toEqual(expectedVersion)
        expect(result.get('project_version')).toEqual(expectedProjectVersion)
        expect(result.get('java_version_legacy')).toEqual(expectedVersion === 8 ? '1.8' : expectedVersion?.toString())
        expect(result.get('has_wrapper')).toEqual(hasWrapper)
        expect(result.get('is_gradle')).toEqual(true)
        expect(result.get('is_maven')).toEqual(false)
        expect(result.get('builder_version')).toEqual(hasWrapper ? '7.5' : null)
        expect(result.get('cmd')).toEqual(hasWrapper ? (process.platform === "win32" ? 'gradle.bat' : './gradlew') : 'gradle')
    });
});

// ########## MAVEN ##########

test('[MAVEN] Read empty dir', () => {
    let dir = createEmptyDir(path.join(__dirname, 'resources/maven/empty'));
    let result = main.run(dir, -1, 17);
    expect(result.get('java_version')).toEqual(17)
    expect(result.get('is_gradle')).toEqual(false)
    expect(result.get('is_maven')).toEqual(false)
    expect(result.get('has_wrapper')).toEqual(false)
    expect(result.get('builder_version')).toEqual(null)
    expect(result.get('cmd')).toEqual(null)
});

test('[MAVEN] Read highest Java Version should be 17', () => {
    let result_src = main.run(path.join(__dirname, 'resources/maven'), -1, -1);
    expect(result_src.get('java_version')).toEqual(17)
    expect(result_src.get('is_maven')).toEqual(true)
    expect(result_src.get('has_wrapper')).toEqual(true)
    expect(result_src.get('builder_version')).toEqual('3.6.3')
    expect(result_src.get('cmd')).toEqual(process.platform === "win32" ? 'mvnw.cmd' : './mvnw')
});

test('[MAVEN] Read highest Java Version with deep limit 1 should be 11', () => {
    let result_source = main.run(path.join(__dirname, 'resources/maven/m_release'), 1, -1);
    expect(result_source.get('java_version')).toEqual(11)
    expect(result_source.get('is_maven')).toEqual(true)
    expect(result_source.get('has_wrapper')).toEqual(false)
    expect(result_source.get('builder_version')).toEqual(null)
    expect(result_source.get('cmd')).toEqual('mvn')

    let result_target = main.run(path.join(__dirname, 'resources/maven/m_release'), 1, -1);
    expect(result_target.get('java_version')).toEqual(11)
    expect(result_target.get('is_maven')).toEqual(true)
    expect(result_target.get('has_wrapper')).toEqual(false)
    expect(result_target.get('builder_version')).toEqual(null)
    expect(result_target.get('cmd')).toEqual('mvn')

    let result_release = main.run(path.join(__dirname, 'resources/maven/m_release'), 1, -1);
    expect(result_release.get('java_version')).toEqual(11)
    expect(result_release.get('is_maven')).toEqual(true)
    expect(result_release.get('has_wrapper')).toEqual(false)
    expect(result_release.get('builder_version')).toEqual(null)
    expect(result_release.get('cmd')).toEqual('mvn')
});

test('[MAVEN] Read each file should have expected result', () => {
    (main.listMavenFiles(path.dirname(__filename), -1) as PathOrFileDescriptor[]).forEach(file => {
        let dir = path.dirname(file.toString());
        let result = main.run(dir, 1);

        let hasWrapper = dir.includes('wrapper');
        let expectedVersion = javaVersionOfPath(dir);
        let expectedProjectVersion = projectVersionOfPath(dir) || '0.0.1';
        expect(result.get('java_version')).toEqual(expectedVersion)
        expect(result.get('project_version')).toEqual(expectedProjectVersion)
        expect(result.get('java_version_legacy')).toEqual(expectedVersion === 8 ? '1.8' : expectedVersion?.toString())
        expect(result.get('has_wrapper')).toEqual(hasWrapper)
        expect(result.get('is_maven')).toEqual(true)
        expect(result.get('builder_version')).toEqual(hasWrapper ? '3.6.3' : null)
        expect(result.get('cmd')).toEqual(hasWrapper ? (process.platform === "win32" ? 'mvnw.cmd' : './mvnw') : 'mvn')
    });
});

function createEmptyDir(dir: PathOrFileDescriptor): PathOrFileDescriptor {
    if (!fs.existsSync(dir.toString())) {
        fs.mkdirSync(dir.toString());
    }
    return dir;
}

function javaVersionOfPath(pathString: string): number | null | undefined {
    let jv = pathString.substring(pathString.lastIndexOf('\\') + 1);
    jv = jv.substring(jv.lastIndexOf('/') + 1);
    jv = jv.substring(jv.lastIndexOf('_') + 1);
    return parseInt(jv.trim())
}

function projectVersionOfPath(pathString: string): string | null {
    let regexResult = new RegExp('(\\d[\\.]){2,}\\d').exec(pathString);
    return regexResult !== null? regexResult[0] : null
}



