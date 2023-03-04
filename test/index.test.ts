import * as fs from "fs";
import {PathOrFileDescriptor} from "fs";
import * as os from 'os';
import * as path from 'path';

const main = require('../src/index');
const LINE_SEPARATOR = os.EOL;

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
    let result = main.run(workDir, new Set<string>(), null, null, null, null, null);
    expect(result.get('ignore-files')).toEqual(null)
    expect(result.get('has_breaking_changes')).toEqual(false)
    expect(result.get('commit_types')).toEqual("")
    expect(result.get('commit_scopes')).toEqual("")
    expect(result.get('ticket_numbers')).toEqual("")
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
    let result = main.run(workDir, new Set<string>(), 'my_fallback_branch', null, null, null, null);
    expect(result.get('ignore-files')).toEqual(null)
    expect(result.get('has_breaking_changes')).toEqual(false)
    expect(result.get('commit_types')).toEqual("")
    expect(result.get('commit_scopes')).toEqual("")
    expect(result.get('ticket_numbers')).toEqual("")
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
    let result = main.run(workDir, new Set<string>(), null, '1.2.3', null, null, null);
    expect(result.get('ignore-files')).toEqual(null)
    expect(result.get('has_breaking_changes')).toEqual(false)
    expect(result.get('commit_types')).toEqual("")
    expect(result.get('commit_scopes')).toEqual("")
    expect(result.get('ticket_numbers')).toEqual("")
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

    let result = main.run(workDir, new Set<string>(), null, null, null, null, null);
    expect(result.get('ignore-files')).toEqual(null)
    expect(result.get('has_breaking_changes')).toEqual(false)
    expect(result.get('commit_types')).toEqual("")
    expect(result.get('commit_scopes')).toEqual("")
    expect(result.get('ticket_numbers')).toEqual("")
    expect(result.get('branch-fallback')).toEqual('main')
    expect(result.get('tag-fallback')).toEqual(null)
    expect(result.get('is_git_repo')).toEqual(true)
    expect(result.get('branch')).toEqual('main')
    expect(result.get('branch_default')).toEqual('main')
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
    commitFile("howdy.java", `init commit`);

    let result = main.run(workDir, new Set<string>(), null, null, null, null, null);
    expect(result.get('ignore-files')).toEqual(null)
    expect(result.get('has_breaking_changes')).toEqual(false)
    expect(result.get('commit_types')).toEqual("")
    expect(result.get('commit_scopes')).toEqual("")
    expect(result.get('ticket_numbers')).toEqual("")
    expect(result.get('branch-fallback')).toEqual('main')
    expect(result.get('tag-fallback')).toEqual(null)
    expect(result.get('is_git_repo')).toEqual(true)
    expect(result.get('branch')).toEqual('main')
    expect(result.get('branch_default')).toEqual('main')
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
    main.cmd(workDir, 'git branch -m main')
    main.cmd(workDir, 'git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main')
    commitFile("main.file", `init commit main`);

    main.cmdLog(workDir, 'git checkout -b add_file')
    commitFile("howdy.java", `init commit branch`);

    let result = main.run(workDir, new Set<string>(), null, null, null, null, null);
    expect(result.get('ignore-files')).toEqual(null)
    expect(result.get('has_breaking_changes')).toEqual(false)
    expect(result.get('commit_types')).toEqual("")
    expect(result.get('commit_scopes')).toEqual("")
    expect(result.get('ticket_numbers')).toEqual("")
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

    let result = main.run(workDir, new Set<string>(['.java', '.jar']), null, null, null, null, null);
    expect(result.get('ignore-files')).toEqual(".java, .jar")
    expect(result.get('has_breaking_changes')).toEqual(false)
    expect(result.get('commit_types')).toEqual("")
    expect(result.get('commit_scopes')).toEqual("")
    expect(result.get('ticket_numbers')).toEqual("")
    expect(result.get('branch-fallback')).toEqual('main')
    expect(result.get('tag-fallback')).toEqual(null)
    expect(result.get('is_git_repo')).toEqual(true)
    expect(result.get('branch')).toEqual('main')
    expect(result.get('branch_default')).toEqual('main')
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

    let result = main.run(workDir, new Set<string>(['.java', '.jar']), null, null, null, null, null);
    expect(result.get('ignore-files')).toEqual(".java, .jar")
    expect(result.get('has_breaking_changes')).toEqual(false)
    expect(result.get('commit_types')).toEqual("")
    expect(result.get('commit_scopes')).toEqual("")
    expect(result.get('ticket_numbers')).toEqual("")
    expect(result.get('branch-fallback')).toEqual('main')
    expect(result.get('tag-fallback')).toEqual(null)
    expect(result.get('is_git_repo')).toEqual(true)
    expect(result.get('branch')).toEqual('main')
    expect(result.get('branch_default')).toEqual('main')
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

test('Test conventional commit', () => {
    setupGit(workDir)
    main.cmdLog(workDir, 'git branch -m main')
    main.cmdLog(workDir, 'git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main')
    commitFile("00.txt", "init commit");
    main.cmdLog(workDir, 'git tag 1.0.0')
    commitFile("aa.txt", "feat(shopping cart): add the amazing button");
    commitFile("bb.txt", "feat: remove ticket list endpoint");
    commitFile("cc.txt", `feat: remove ticket list endpoint${LINE_SEPARATOR}refers to JIRA-1337${LINE_SEPARATOR}BREAKING CHANGES: ticket endpoints no longer supports list all entites.`);
    commitFile("dd.txt", `fix: add missing parameter to service call${LINE_SEPARATOR}The error occurred because of >reasons<.`);
    commitFile("ee.txt", `build: update dependencies`);
    commitFile("ff.txt", `refactor: implement calculation method as recursion`);
    commitFile("gg.txt", `style: remove empty line`);
    commitFile("hh.txt", `feat!: send an email to the customer when a product is shipped`);
    commitFile("ii.txt", `feat(api)!: send an email to the customer when a product is shipped`);
    commitFile("jj.txt", `chore!: drop support for Node 6${LINE_SEPARATOR}#1338 BREAKING CHANGE: use JavaScript features not available in Node 6.`);
    commitFile("kk.txt", `docs: correct spelling of CHANGELOG`);
    commitFile("ll.txt", `feat(lang): add Polish language`);
    commitFile("mm.txt", `fix: prevent racing of requests${LINE_SEPARATOR}Introduce a request id and a reference to latest request. Dismiss${LINE_SEPARATOR}incoming responses other than from latest request.${LINE_SEPARATOR}Remove timeouts which were used to mitigate the racing issue but are${LINE_SEPARATOR}obsolete now.${LINE_SEPARATOR}Reviewed-by: Z${LINE_SEPARATOR}Refs: #123`);
    commitFile("nn.txt", `style:`);
    commitFile("oo.txt", `hi:`);

    let result = main.run(workDir, new Set<string>(), null, null, null, null, null);
    expect(result.get('has_changes')).toEqual(true)
    expect(result.get('has_breaking_changes')).toEqual(true)
    expect(result.get('commit_types')).toEqual("build, chore, docs, feat, fix, hi, refactor, style")
    expect(result.get('commit_scopes')).toEqual("api, lang, shopping cart")
    expect(result.get('ticket_numbers')).toEqual("")
});

test('Test conventional commit with defaults && with footer && no breaking change', () => {
    setupGit(workDir)
    main.cmdLog(workDir, 'git branch -m main')
    main.cmdLog(workDir, 'git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main')
    commitFile("00.txt", "init commit");
    main.cmdLog(workDir, 'git tag 1.0.0')
    commitFile("aa.txt", `feat(shopping cart): add the amazing button${LINE_SEPARATOR}JIRA-1337`);
    commitFile("bb.txt", `feat: add the amazing button${LINE_SEPARATOR}Refs: #123`);
    commitFile("cc.txt", `drop support for Node 6 #1338`);

    let result = main.run(workDir, new Set<string>(), null, null, 'default-type', 'default-scope', true);
    expect(result.get('has_changes')).toEqual(true)
    expect(result.get('has_breaking_changes')).toEqual(false)
    expect(result.get('commit_types')).toEqual("default-type, feat")
    expect(result.get('commit_scopes')).toEqual("default-scope, shopping cart")
    expect(result.get('ticket_numbers')).toEqual("#1338, #123, JIRA-1337")
});

test('Test conventional commit with defaults && no footer && breaking change', () => {
    setupGit(workDir)
    main.cmdLog(workDir, 'git branch -m main')
    main.cmdLog(workDir, 'git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main')
    commitFile("00.txt", "init commit");
    main.cmdLog(workDir, 'git tag 1.0.0')
    commitFile("aa.txt", `feat(shopping cart): add the amazing button${LINE_SEPARATOR}JIRA-1337`);
    commitFile("bb.txt", `feat!: add the amazing button${LINE_SEPARATOR}Refs: #123`);
    commitFile("cc.txt", `drop support for Node 6 #1338`);

    let result = main.run(workDir, new Set<string>(), null, null, 'default-type', 'default-scope', false);
    expect(result.get('has_changes')).toEqual(true)
    expect(result.get('has_breaking_changes')).toEqual(true)
    expect(result.get('commit_types')).toEqual("default-type, feat")
    expect(result.get('commit_scopes')).toEqual("default-scope, shopping cart")
    expect(result.get('ticket_numbers')).toEqual("#1338")
});

function commitFile(name: string, message : string) {
    fs.writeFileSync(path.join(workDir.toString(), name), message);
    main.cmdLog(workDir, 'git add .')
    main.cmdLog(workDir, `git commit -am "${message}"`)
}

function setupGit(workDir: PathOrFileDescriptor) {
    main.cmd("git config init.defaultBranch main");
    main.cmd("git config --global init.defaultBranch main");
    main.cmd(workDir, 'git init')
    main.cmd(workDir, 'git checkout -b main')
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



