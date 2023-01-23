import * as fs from "fs";
import {PathOrFileDescriptor} from "fs";
import * as os from 'os';
import * as path from 'path';

const main = require('../src/index')

let workDir: PathOrFileDescriptor;

beforeEach(() => {
    workDir = path.join(os.tmpdir(), 'git_info_action_test');
    removeDir(workDir);
    fs.mkdirSync(workDir);
});

afterEach(() => {
    removeDir(workDir);
});

test('Test on empty dir', () => {
    let result = main.run(workDir, new Set<string>(), null, null);
    expect(result.get('ignore-files')).toEqual(null)
    expect(result.get('branch-fallback')).toEqual('main')
    expect(result.get('tag-fallback')).toEqual(null)
    expect(result.get('is_git_repo')).toEqual(false)
    expect(result.get('branch')).toEqual(null)
    expect(result.get('branch_default')).toEqual('main')
    expect(result.get('is_default_branch')).toEqual(false)
    expect(result.get('sha_latest')).toEqual(null)
    expect(result.get('sha_latest_tag')).toEqual(null)
    expect(result.get('has_changes')).toEqual(false)
    expect(result.get('has_local_changes')).toEqual(false)
    expect(result.get('commits_ahead')).toEqual(0)
    expect(result.get('commits_behind')).toEqual(0)
    expect(result.get('x_has_changes_java')).toEqual(false)
    expect(result.get('x_has_local_changes_java')).toEqual(false)
});

test('Test on empty dir with "branch-fallback"', () => {
    let result = main.run(workDir, new Set<string>(), 'my_fallback_branch', null);
    expect(result.get('ignore-files')).toEqual(null)
    expect(result.get('branch-fallback')).toEqual('my_fallback_branch')
    expect(result.get('tag-fallback')).toEqual(null)
    expect(result.get('is_git_repo')).toEqual(false)
    expect(result.get('branch')).toEqual(null)
    expect(result.get('branch_default')).toEqual('my_fallback_branch')
    expect(result.get('is_default_branch')).toEqual(false)
    expect(result.get('sha_latest')).toEqual(null)
    expect(result.get('sha_latest_tag')).toEqual(null)
    expect(result.get('has_changes')).toEqual(false)
    expect(result.get('has_local_changes')).toEqual(false)
    expect(result.get('commits_ahead')).toEqual(0)
    expect(result.get('commits_behind')).toEqual(0)
    expect(result.get('x_has_changes_java')).toEqual(false)
    expect(result.get('x_has_local_changes_java')).toEqual(false)
});

test('Test on empty dir with "tag-fallback"', () => {
    let result = main.run(workDir, new Set<string>(), null, '1.2.3');
    expect(result.get('ignore-files')).toEqual(null)
    expect(result.get('branch-fallback')).toEqual('main')
    expect(result.get('tag-fallback')).toEqual('1.2.3')
    expect(result.get('is_git_repo')).toEqual(false)
    expect(result.get('branch')).toEqual(null)
    expect(result.get('branch_default')).toEqual('main')
    expect(result.get('is_default_branch')).toEqual(false)
    expect(result.get('tag_latest')).toEqual('1.2.3')
    expect(result.get('sha_latest')).toEqual(null)
    expect(result.get('sha_latest_tag')).toEqual(null)
    expect(result.get('has_changes')).toEqual(false)
    expect(result.get('has_local_changes')).toEqual(false)
    expect(result.get('commits_ahead')).toEqual(0)
    expect(result.get('commits_behind')).toEqual(0)
    expect(result.get('x_has_changes_java')).toEqual(false)
    expect(result.get('x_has_local_changes_java')).toEqual(false)
});

test('Test with file [howdy.java]', () => {
    setupGit(workDir)
    fs.writeFileSync(path.join(workDir.toString(), "howdy.java"), "Hello there!");

    let result = main.run(workDir, new Set<string>(), null, null);
    expect(result.get('ignore-files')).toEqual(null)
    expect(result.get('branch-fallback')).toEqual('main')
    expect(result.get('tag-fallback')).toEqual(null)
    expect(result.get('is_git_repo')).toEqual(true)
    expect(result.get('branch')).toEqual('master')
    expect(result.get('branch_default')).toEqual('master')
    expect(result.get('is_default_branch')).toEqual(true)
    expect(result.get('tag_latest')).toEqual(null)
    expect(result.get('sha_latest')).toEqual(null)
    expect(result.get('sha_latest_tag')).toEqual(null)
    expect(result.get('has_changes')).toEqual(false)
    expect(result.get('has_local_changes')).toEqual(true)
    expect(result.get('commits_ahead')).toEqual(0)
    expect(result.get('commits_behind')).toEqual(0)
    expect(result.get('x_has_changes_java')).toEqual(false)
    expect(result.get('x_has_local_changes_java')).toEqual(true)
});

test('Test with file [howdy.java] && commit', () => {
    setupGit(workDir)
    fs.writeFileSync(path.join(workDir.toString(), "howdy.java"), "Hello there!");
    main.cmdLog(workDir, 'git add .')
    main.cmdLog(workDir, 'git commit -am "init commit"')

    let result = main.run(workDir, new Set<string>(), null, null);
    expect(result.get('ignore-files')).toEqual(null)
    expect(result.get('branch-fallback')).toEqual('main')
    expect(result.get('tag-fallback')).toEqual(null)
    expect(result.get('is_git_repo')).toEqual(true)
    expect(result.get('branch')).toEqual('master')
    expect(result.get('branch_default')).toEqual('master')
    expect(result.get('is_default_branch')).toEqual(true)
    expect(result.get('tag_latest')).toEqual(null)
    expect(result.get('sha_latest')).not.toEqual(null)
    expect(result.get('sha_latest_tag')).not.toEqual(null)
    expect(result.get('has_changes')).toEqual(false)
    expect(result.get('has_local_changes')).toEqual(false)
    expect(result.get('commits_ahead')).toEqual(0)
    expect(result.get('commits_behind')).toEqual(0)
    expect(result.get('x_has_changes_java')).toEqual(false)
    expect(result.get('x_has_local_changes_java')).toEqual(false)
});

test('Test with file [howdy.java] && branch && default branch [init] && commit', () => {
    setupGit(workDir)
    main.cmdLog(workDir, 'git branch -m main')
    main.cmdLog(workDir, 'git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main')
    fs.writeFileSync(path.join(workDir.toString(), "main.file"), "File for main branch");
    main.cmdLog(workDir, 'git add .')
    main.cmdLog(workDir, 'git commit -am "init commit"')

    main.cmdLog(workDir, 'git checkout -b add_file')
    fs.writeFileSync(path.join(workDir.toString(), "howdy.java"), "Hello there!");
    main.cmdLog(workDir, 'git add .')
    main.cmdLog(workDir, 'git commit -am "add file"')

    let result = main.run(workDir, new Set<string>(), null, null);
    expect(result.get('ignore-files')).toEqual(null)
    expect(result.get('branch-fallback')).toEqual('main')
    expect(result.get('tag-fallback')).toEqual(null)
    expect(result.get('is_git_repo')).toEqual(true)
    expect(result.get('branch')).toEqual('add_file')
    expect(result.get('branch_default')).toEqual('main')
    expect(result.get('is_default_branch')).toEqual(false)
    expect(result.get('tag_latest')).toEqual(null)
    expect(result.get('sha_latest')).not.toEqual(null)
    expect(result.get('sha_latest_tag')).not.toEqual(null)
    expect(result.get('has_changes')).toEqual(false)
    expect(result.get('has_local_changes')).toEqual(false)
    expect(result.get('commits_ahead')).toEqual(1)
    expect(result.get('commits_behind')).toEqual(0)
    expect(result.get('x_has_changes_java')).toEqual(false)
    expect(result.get('x_has_local_changes_java')).toEqual(false)
});

test('Test with ignore files', () => {
    setupGit(workDir)
    fs.writeFileSync(path.join(workDir.toString(), "howdy.java"), "Hello there!");
    fs.writeFileSync(path.join(workDir.toString(), "howdy.py"), "Hello there!");

    let result = main.run(workDir, new Set<string>(['.java', '.jar']), null, null);
    expect(result.get('ignore-files')).toEqual(".java, .jar")
    expect(result.get('branch-fallback')).toEqual('main')
    expect(result.get('tag-fallback')).toEqual(null)
    expect(result.get('is_git_repo')).toEqual(true)
    expect(result.get('branch')).toEqual('master')
    expect(result.get('branch_default')).toEqual('master')
    expect(result.get('is_default_branch')).toEqual(true)
    expect(result.get('tag_latest')).toEqual(null)
    expect(result.get('sha_latest')).toEqual(null)
    expect(result.get('sha_latest_tag')).toEqual(null)
    expect(result.get('has_changes')).toEqual(false)
    expect(result.get('has_local_changes')).toEqual(true)
    expect(result.get('commits_ahead')).toEqual(0)
    expect(result.get('commits_behind')).toEqual(0)
    expect(result.get('x_has_changes_java')).toEqual(false)
    expect(result.get('x_has_local_changes_java')).toEqual(false)
    expect(result.get('x_has_local_changes_python')).toEqual(true)
});

test('Test with ignore files should not have changes', () => {
    setupGit(workDir)
    fs.writeFileSync(path.join(workDir.toString(), "howdy.java"), "Hello there!");

    let result = main.run(workDir, new Set<string>(['.java', '.jar']), null, null);
    expect(result.get('ignore-files')).toEqual(".java, .jar")
    expect(result.get('branch-fallback')).toEqual('main')
    expect(result.get('tag-fallback')).toEqual(null)
    expect(result.get('is_git_repo')).toEqual(true)
    expect(result.get('branch')).toEqual('master')
    expect(result.get('branch_default')).toEqual('master')
    expect(result.get('is_default_branch')).toEqual(true)
    expect(result.get('tag_latest')).toEqual(null)
    expect(result.get('sha_latest')).toEqual(null)
    expect(result.get('sha_latest_tag')).toEqual(null)
    expect(result.get('has_changes')).toEqual(false)
    expect(result.get('has_local_changes')).toEqual(false)
    expect(result.get('commits_ahead')).toEqual(0)
    expect(result.get('commits_behind')).toEqual(0)
    expect(result.get('x_has_changes_java')).toEqual(false)
    expect(result.get('x_has_local_changes_java')).toEqual(false)
});

function setupGit(workDir: PathOrFileDescriptor) {
    main.cmd(workDir, 'git init')
    main.cmd(workDir, 'git config --file .git/config user.email "kira@yuna.berlin"')
    main.cmd(workDir, 'git config --file .git/config user.name "Kira"')
    console.log('is_git_repo' + main.cmd(workDir, 'git rev-parse --is-inside-work-tree', 'git rev-parse --git-dir'))
}

function removeDir(folderPath: PathOrFileDescriptor) {
    if (fs.existsSync(folderPath.toString())) {
        fs.readdirSync(folderPath.toString()).forEach((file, index) => {
            const curPath = path.join(folderPath.toString(), file);
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                removeDir(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath.toString());
    }
}



