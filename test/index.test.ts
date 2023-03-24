import * as fs from "fs";
import {PathOrFileDescriptor} from "fs";
import * as os from 'os';
import * as path from 'path';
import {CHANGE_TYPES, cmd, cmdLog, deleteBranchPrefix, isEmpty, LINE_SEPARATOR} from '../src/common_processing';

const main = require('../src/index');

let workDir: PathOrFileDescriptor;

const context = {
    payload: {
        inputs: {
            input_2: "AaBbCc"
        },
        ref: "refs/heads/main",
        workflow: ".github/workflows/trigger_test.yml",
        repository: {
            id: 612981281,
            size: 0,
            forks_count: 0,
            open_issues: 0,
            stargazers_count: 0,
            fork: false,
            private: false,
            archived: false,
            disabled: false,
            is_template: false,
            allow_forking: true,
            visibility: "public",
            default_branch: "main",
            language: "TypeScript",
            name: "input-merger-action",
            created_at: "2023-03-12T14:59:30Z",
            updated_at: "2023-03-12T15:01:13Z",
            html_url: "https://github.com/YunaBraska/input-merger-action",
            description: "Combines user and default inputs for your workflows.",
            hooks_url: "https://api.github.com/repos/YunaBraska/input-merger-action/hooks",
            license: {
                key: "apache-2.0",
                name: "Apache License 2.0",
            },
            owner: {
                id: 13748223,
                type: "User",
                login: "YunaBraska",
                html_url: "https://github.com/YunaBraska",
            },
        },
        sender: {
            id: 13748223,
            type: "User",
            login: "YunaBraska",
            html_url: "https://github.com/YunaBraska",
        }
    },
    eventName: "workflow_dispatch",
    sha: "b63fd71e769ca531cf47192312af3e804793538d",
    ref: "refs/heads/main",
    workflow: "TRIGGER WORKFLOW CALL",
    actor: "YunaBraska",
    job: "build",
    runNumber: 8,
    runId: 4398246357,
};

beforeEach(() => {
    workDir = path.join(os.tmpdir(), 'git_info_action_test');
    removeDir(workDir);
    fs.mkdirSync(workDir);
});

afterEach(() => {
    removeDir(workDir);
});

test('Test isEmpty', () => {
    expect(isEmpty(null)).toEqual(true);
    expect(isEmpty(undefined)).toEqual(true);
    expect(isEmpty("")).toEqual(true);
    expect(isEmpty("false")).toEqual(false);
    expect(isEmpty("true")).toEqual(false);
    expect(isEmpty(true)).toEqual(false);
    expect(isEmpty(false)).toEqual(false);
    expect(isEmpty(0)).toEqual(false);
    expect(isEmpty(1)).toEqual(false);
});

test('Test on empty dir', () => {
    let result = main.run(null, workDir, new Set<string>(), null, null, null, null, null, null, false);
    expect(result.get('ignore-files')).toEqual(null);
    expect(result.get('has_breaking_changes')).toEqual(false);
    expect(result.get('commit_types')).toEqual(null);
    expect(result.get('commit_scopes')).toEqual(null);
    expect(result.get('ticket_numbers')).toEqual(null);
    expect(result.get('branch-fallback')).toEqual('main');
    expect(result.get('tag-fallback')).toEqual(null);
    expect(result.get('is_git_repo')).toEqual(false);
    expect(result.get('branch')).toEqual(null);
    expect(result.get('branch_default')).toEqual('main');
    expect(result.get('is_default_branch')).toEqual(false);
    expect(result.get('sha_latest')).toEqual(null);
    expect(result.get('sha_latest_tag')).toEqual(null);
    expect(result.get('has_changes')).toEqual(false);
    expect(result.get('has_local_changes')).toEqual(false);
    expect(result.get('commits_ahead')).toEqual(0);
    expect(result.get('commits_behind')).toEqual(0);
    expect(result.get('null-to-empty')).toEqual(false);
    expect(result.get('x_has_changes_java')).toEqual(false);
    expect(result.get('x_has_local_changes_java')).toEqual(false);
});

test('Test on empty dir with "branch-fallback"', () => {
    let result = main.run(null, workDir, new Set<string>(), 'my_fallback_branch', null, null, null, null, null, false);
    expect(result.get('ignore-files')).toEqual(null);
    expect(result.get('has_breaking_changes')).toEqual(false);
    expect(result.get('commit_types')).toEqual(null);
    expect(result.get('commit_scopes')).toEqual(null);
    expect(result.get('ticket_numbers')).toEqual(null);
    expect(result.get('branch-fallback')).toEqual('my_fallback_branch');
    expect(result.get('tag-fallback')).toEqual(null);
    expect(result.get('is_git_repo')).toEqual(false);
    expect(result.get('branch')).toEqual(null);
    expect(result.get('branch_default')).toEqual('my_fallback_branch');
    expect(result.get('is_default_branch')).toEqual(false);
    expect(result.get('sha_latest')).toEqual(null);
    expect(result.get('sha_latest_tag')).toEqual(null);
    expect(result.get('has_changes')).toEqual(false);
    expect(result.get('has_local_changes')).toEqual(false);
    expect(result.get('commits_ahead')).toEqual(0);
    expect(result.get('commits_behind')).toEqual(0);
    expect(result.get('null-to-empty')).toEqual(false);
    expect(result.get('change_type')).toEqual(null);
    expect(result.get('x_has_changes_java')).toEqual(false);
    expect(result.get('x_has_local_changes_java')).toEqual(false);
});

test('Test on empty dir with "tag-fallback"', () => {
    let result = main.run(null, workDir, new Set<string>(), null, '1.2.3', null, null, null, null, false);
    expect(result.get('ignore-files')).toEqual(null);
    expect(result.get('has_breaking_changes')).toEqual(false);
    expect(result.get('commit_types')).toEqual(null);
    expect(result.get('commit_scopes')).toEqual(null);
    expect(result.get('ticket_numbers')).toEqual(null);
    expect(result.get('branch-fallback')).toEqual('main');
    expect(result.get('tag-fallback')).toEqual('1.2.3');
    expect(result.get('is_git_repo')).toEqual(false);
    expect(result.get('branch')).toEqual(null);
    expect(result.get('branch_default')).toEqual('main');
    expect(result.get('is_default_branch')).toEqual(false);
    expect(result.get('tag_latest')).toEqual('1.2.3');
    expect(result.get('sha_latest')).toEqual(null);
    expect(result.get('sha_latest_tag')).toEqual(null);
    expect(result.get('has_changes')).toEqual(false);
    expect(result.get('has_local_changes')).toEqual(false);
    expect(result.get('commits_ahead')).toEqual(0);
    expect(result.get('commits_behind')).toEqual(0);
    expect(result.get('null-to-empty')).toEqual(false);
    expect(result.get('change_type')).toEqual(null);
    expect(result.get('x_has_changes_java')).toEqual(false);
    expect(result.get('x_has_local_changes_java')).toEqual(false);
});

test('Test with file [howdy.java]', () => {
    setupGit(workDir);
    fs.writeFileSync(path.join(workDir.toString(), "howdy.java"), "Hello there!");

    let result = main.run(null, workDir, new Set<string>(), null, null, null, null, null, null, false);
    expect(result.get('ignore-files')).toEqual(null);
    expect(result.get('has_breaking_changes')).toEqual(false);
    expect(result.get('commit_types')).toEqual('chore');
    expect(result.get('commit_scopes')).toEqual('maintenance');
    expect(result.get('ticket_numbers')).toEqual(null);
    expect(result.get('branch-fallback')).toEqual('main');
    expect(result.get('tag-fallback')).toEqual(null);
    expect(result.get('is_git_repo')).toEqual(true);
    expect(result.get('branch')).toEqual('main');
    expect(result.get('branch_default')).toEqual('main');
    expect(result.get('is_default_branch')).toEqual(true);
    expect(result.get('tag_latest')).toEqual(null);
    expect(result.get('sha_latest')).toEqual(null);
    expect(result.get('sha_latest_tag')).toEqual(null);
    expect(result.get('has_changes')).toEqual(false);
    expect(result.get('has_local_changes')).toEqual(true);
    expect(result.get('commits_ahead')).toEqual(0);
    expect(result.get('commits_behind')).toEqual(0);
    expect(result.get('null-to-empty')).toEqual(false);
    expect(result.get('change_type')).toEqual('rc');
    expect(result.get('x_has_changes_java')).toEqual(false);
    expect(result.get('x_has_local_changes_java')).toEqual(true);
});

test('Test with file [howdy.java] && commit', () => {
    setupGit(workDir);
    commitFile("howdy.java", `init commit`);

    let result = main.run(null, workDir, new Set<string>(), null, null, null, null, null, null, false);
    expect(result.get('ignore-files')).toEqual(null);
    expect(result.get('has_breaking_changes')).toEqual(false);
    expect(result.get('commit_types')).toEqual(null);
    expect(result.get('commit_scopes')).toEqual(null);
    expect(result.get('ticket_numbers')).toEqual(null);
    expect(result.get('branch-fallback')).toEqual('main');
    expect(result.get('tag-fallback')).toEqual(null);
    expect(result.get('is_git_repo')).toEqual(true);
    expect(result.get('branch')).toEqual('main');
    expect(result.get('branch_default')).toEqual('main');
    expect(result.get('is_default_branch')).toEqual(true);
    expect(result.get('tag_latest')).toEqual(null);
    expect(result.get('sha_latest')).not.toEqual(null);
    expect(result.get('sha_latest_tag')).not.toEqual(null);
    expect(result.get('has_changes')).toEqual(false);
    expect(result.get('has_local_changes')).toEqual(false);
    expect(result.get('commits_ahead')).toEqual(0);
    expect(result.get('commits_behind')).toEqual(0);
    expect(result.get('null-to-empty')).toEqual(false);
    expect(result.get('change_type')).toEqual(null);
    expect(result.get('x_has_changes_java')).toEqual(false);
    expect(result.get('x_has_local_changes_java')).toEqual(false);
});

test('Test with file [howdy.java] && branch && default branch [init] && commit', () => {
    setupGit(workDir);
    cmd(workDir, 'git branch -m main');
    cmd(workDir, 'git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main');
    commitFile("main.file", `init commit main`);

    cmdLog(workDir, 'git checkout -b add_file');
    commitFile("howdy.java", `init commit branch`);

    let result = main.run(null, workDir, new Set<string>(), null, null, null, null, null, null, false);
    expect(result.get('ignore-files')).toEqual(null);
    expect(result.get('has_breaking_changes')).toEqual(false);
    expect(result.get('commit_types')).toEqual(null);
    expect(result.get('commit_scopes')).toEqual(null);
    expect(result.get('ticket_numbers')).toEqual(null);
    expect(result.get('branch-fallback')).toEqual('main');
    expect(result.get('tag-fallback')).toEqual(null);
    expect(result.get('is_git_repo')).toEqual(true);
    expect(result.get('branch')).toEqual('add_file');
    expect(result.get('branch_default')).toEqual('main');
    expect(result.get('is_default_branch')).toEqual(false);
    expect(result.get('tag_latest')).toEqual(null);
    expect(result.get('sha_latest')).not.toEqual(null);
    expect(result.get('sha_latest_tag')).not.toEqual(null);
    expect(result.get('has_changes')).toEqual(false);
    expect(result.get('has_local_changes')).toEqual(false);
    expect(result.get('commits_ahead')).toEqual(1);
    expect(result.get('commits_behind')).toEqual(0);
    expect(result.get('null-to-empty')).toEqual(false);
    expect(result.get('change_type')).toEqual(null);
    expect(result.get('x_has_changes_java')).toEqual(false);
    expect(result.get('x_has_local_changes_java')).toEqual(false);
});

test('Test with ignore files', () => {
    setupGit(workDir);
    fs.writeFileSync(path.join(workDir.toString(), "howdy.java"), "Hello there!");
    fs.writeFileSync(path.join(workDir.toString(), "howdy.py"), "Hello there!");

    let result = main.run(null, workDir, new Set<string>(['.java', '.jar']), null, null, null, null, null, null, false);
    expect(result.get('ignore-files')).toEqual(".java, .jar");
    expect(result.get('has_breaking_changes')).toEqual(false);
    expect(result.get('commit_types')).toEqual('chore');
    expect(result.get('commit_scopes')).toEqual('maintenance');
    expect(result.get('ticket_numbers')).toEqual(null);
    expect(result.get('branch-fallback')).toEqual('main');
    expect(result.get('tag-fallback')).toEqual(null);
    expect(result.get('is_git_repo')).toEqual(true);
    expect(result.get('branch')).toEqual('main');
    expect(result.get('branch_default')).toEqual('main');
    expect(result.get('is_default_branch')).toEqual(true);
    expect(result.get('tag_latest')).toEqual(null);
    expect(result.get('sha_latest')).toEqual(null);
    expect(result.get('sha_latest_tag')).toEqual(null);
    expect(result.get('has_changes')).toEqual(false);
    expect(result.get('has_local_changes')).toEqual(true);
    expect(result.get('commits_ahead')).toEqual(0);
    expect(result.get('commits_behind')).toEqual(0);
    expect(result.get('null-to-empty')).toEqual(false);
    expect(result.get('change_type')).toEqual('rc');
    expect(result.get('x_has_changes_java')).toEqual(false);
    expect(result.get('x_has_local_changes_java')).toEqual(false);
    expect(result.get('x_has_local_changes_python')).toEqual(true);
});

test('Test with ignore files should not have changes', () => {
    setupGit(workDir);
    fs.writeFileSync(path.join(workDir.toString(), "howdy.java"), "Hello there!");

    let result = main.run(null, workDir, new Set<string>(['.java', '.jar']), null, null, null, null, null, null, false);
    expect(result.get('ignore-files')).toEqual(".java, .jar");
    expect(result.get('has_breaking_changes')).toEqual(false);
    expect(result.get('commit_types')).toEqual(null);
    expect(result.get('commit_scopes')).toEqual(null);
    expect(result.get('ticket_numbers')).toEqual(null);
    expect(result.get('branch-fallback')).toEqual('main');
    expect(result.get('tag-fallback')).toEqual(null);
    expect(result.get('is_git_repo')).toEqual(true);
    expect(result.get('branch')).toEqual('main');
    expect(result.get('branch_default')).toEqual('main');
    expect(result.get('is_default_branch')).toEqual(true);
    expect(result.get('tag_latest')).toEqual(null);
    expect(result.get('sha_latest')).toEqual(null);
    expect(result.get('sha_latest_tag')).toEqual(null);
    expect(result.get('has_changes')).toEqual(false);
    expect(result.get('has_local_changes')).toEqual(false);
    expect(result.get('commits_ahead')).toEqual(0);
    expect(result.get('commits_behind')).toEqual(0);
    expect(result.get('null-to-empty')).toEqual(false);
    expect(result.get('change_type')).toEqual(null);
    expect(result.get('x_has_changes_java')).toEqual(false);
    expect(result.get('x_has_local_changes_java')).toEqual(false);
});

test('Test conventional commit', () => {
    setupGit(workDir);
    cmdLog(workDir, 'git branch -m main');
    cmdLog(workDir, 'git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main');
    commitFile("00.txt", "init commit");
    cmdLog(workDir, 'git tag 1.0.0');
    commitFile("aa.txt", "feat(shopping cart): add the amazing button");
    commitFile("bb.txt", "feat: remove ticket list endpoint");
    commitFile("cc.txt", `feat: remove ticket list endpoint${LINE_SEPARATOR}refers to JIRA-1337${LINE_SEPARATOR}BREAKING CHANGES: ticket endpoints no longer supports list all entites.`);
    commitFile("dd.txt", `fix: add missing parameter to service call${LINE_SEPARATOR}The error occurred because of >reasons<.`);
    commitFile("ee.txt", `build: update dependencies`);
    commitFile("ff.txt", `refactor: implement calculation method as recursion`);
    commitFile("gg.txt", `style: remove empty line`);
    commitFile("hh.txt", `style: remove empty line`);
    commitFile("ii.txt", `feat!: send an email to the customer when a product is shipped`);
    commitFile("jj.txt", `feat(api)!: send an email to the customer when a product is shipped`);
    commitFile("kk.txt", `chore!: drop support for Node 6${LINE_SEPARATOR}#1338 BREAKING CHANGE: use JavaScript features not available in Node 6.`);
    commitFile("ll.txt", `docs: correct spelling of CHANGELOG`);
    commitFile("mm.txt", `feat(lang): add Polish language`);
    commitFile("nn.txt", `fix: prevent racing of requests`);
    commitFile("oo.txt", `fix: prevent racing of requests${LINE_SEPARATOR}Introduce a request id and a reference to latest request. Dismiss${LINE_SEPARATOR}incoming responses other than from latest request.${LINE_SEPARATOR}Remove timeouts which were used to mitigate the racing issue but are${LINE_SEPARATOR}obsolete now.${LINE_SEPARATOR}Reviewed-by: Z${LINE_SEPARATOR}Refs: #123`);
    commitFile("pp.txt", `style:`);
    commitFile("qq.txt", `hi:`);

    let result = main.run(null, workDir, new Set<string>(), null, null, null, null, null, 50, false);
    expect(result.get('has_changes')).toEqual(true);
    expect(result.get('has_breaking_changes')).toEqual(true);
    expect(result.get('commit_types')).toEqual("build, chore, docs, feat, fix, hi, refactor, style");
    expect(result.get('commit_scopes')).toEqual("api, lang, shopping cart");
    expect(result.get('ticket_numbers')).toEqual("");
    expect(result.get('change_type')).toEqual("major");
    expect(result.get('change_log').length).toEqual(50);
    expect(result.get('null-to-empty')).toEqual(false);
    if (!os.platform().toLowerCase().startsWith('win')) {
        expect(String(result.get('change_log')).trim()).toEqual(`Prevent racing of requests. ${LINE_SEPARATOR}Add missing parame...`);
    }
});

test('Test conventional commit with defaults && with footer && no breaking change', () => {
    setupGit(workDir);
    cmdLog(workDir, 'git branch -m main');
    cmdLog(workDir, 'git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main');
    commitFile("00.txt", "init commit");
    cmdLog(workDir, 'git tag 1.0.0');
    commitFile("aa.txt", `feat(shopping cart): add the amazing button${LINE_SEPARATOR}JIRA-1337`);
    commitFile("bb.txt", `feat: add the amazing button${LINE_SEPARATOR}Refs: #123`);
    commitFile("cc.txt", `drop support for Node 6 #1338`);

    let result = main.run(null, workDir, new Set<string>(), null, null, 'default-type', 'default-scope', true, null, null);
    expect(result.get('has_changes')).toEqual(true);
    expect(result.get('has_breaking_changes')).toEqual(false);
    expect(result.get('commit_types')).toEqual("default-type, feat");
    expect(result.get('commit_scopes')).toEqual("default-scope, shopping cart");
    //FIXME: get ALL ticket numbers also on windows
    if (os.platform().toLowerCase().startsWith('win')) {
        expect(result.get('ticket_numbers')).toEqual("#1338");
    } else {
        expect(result.get('ticket_numbers')).toEqual("#1338, #123, JIRA-1337");
    }
});

test('Test conventional commit with defaults && no footer && breaking change', () => {
    setupGit(workDir);
    cmdLog(workDir, 'git branch -m main');
    cmdLog(workDir, 'git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main');
    commitFile("00.txt", "init commit");
    cmdLog(workDir, 'git tag 1.0.0');
    commitFile("aa.txt", `feat(shopping cart): add the amazing button${LINE_SEPARATOR}JIRA-1337`);
    commitFile("bb.txt", `feat!: add the amazing button${LINE_SEPARATOR}Refs: #123`);
    commitFile("cc.txt", `drop support for Node 6 #1338`);

    let result = main.run(null, workDir, new Set<string>(), null, null, 'default-type', 'default-scope', false, null, true);
    expect(result.get('has_changes')).toEqual(true);
    expect(result.get('has_breaking_changes')).toEqual(true);
    expect(result.get('commit_types')).toEqual("default-type, feat");
    expect(result.get('commit_scopes')).toEqual("default-scope, shopping cart");
    expect(result.get('ticket_numbers')).toEqual("#1338");
    expect(result.get('null-to-empty')).toEqual(true);
    expect(result.get('change_type')).toEqual("major");
});

test('Test context', () => {
    setupGit(workDir);

    let result = main.run(context, workDir, new Set<string>(), null, null, null, null, null, null, false);
    //PAYLOAD
    expect(result.get('context_ref')).toEqual(context.payload.ref);
    expect(result.get('context_workflow_file')).toEqual(context.payload.workflow);
    expect(result.get('context_actor_id')).toEqual(context.payload.sender.id);
    expect(result.get('context_actor_name')).toEqual(context.payload.sender.login);
    expect(result.get('context_actor_type')).toEqual(context.payload.sender.type);

    //CONTEXT
    expect(result.get('context_sha')).toEqual(context.sha);
    expect(result.get('context_event_mame')).toEqual(context.eventName);
    expect(result.get('context_workflow_name')).toEqual(context.workflow);
    expect(result.get('context_job_name')).toEqual(context.job);
    expect(result.get('context_run_id')).toEqual(context.runId);
    expect(result.get('context_run_number')).toEqual(context.runNumber);

    //REPOSITORY
    expect(result.get('repo_id')).toEqual(context.payload.repository.id);
    expect(result.get('repo_size')).toEqual(context.payload.repository.size);
    expect(result.get('repo_open_issues')).toEqual(context.payload.repository.open_issues);
    expect(result.get('repo_star_count')).toEqual(context.payload.repository.stargazers_count);
    expect(result.get('is_repo_fork')).toEqual(context.payload.repository.fork);
    expect(result.get('is_repo_private')).toEqual(context.payload.repository.private);
    expect(result.get('is_repo_archived')).toEqual(context.payload.repository.archived);
    expect(result.get('is_repo_disabled')).toEqual(context.payload.repository.disabled);
    expect(result.get('is_repo_template')).toEqual(context.payload.repository.is_template);
    expect(result.get('repo_visibility')).toEqual(context.payload.repository.visibility);
    expect(result.get('repo_default_branch')).toEqual(context.payload.repository.default_branch);
    expect(result.get('repo_language')).toEqual(context.payload.repository.language);
    expect(result.get('repo_name')).toEqual(context.payload.repository.name);
    expect(result.get('repo_created_at')).toEqual(context.payload.repository.created_at);
    expect(result.get('repo_updated_at')).toEqual(context.payload.repository.updated_at);
    expect(result.get('repo_html_url')).toEqual(context.payload.repository.html_url);
    expect(result.get('repo_hooks_url')).toEqual(context.payload.repository.hooks_url);
    expect(result.get('repo_description')).toEqual(context.payload.repository.description);
    expect(result.get('repo_license_key')).toEqual(context.payload.repository.license.key);
    expect(result.get('repo_license_name')).toEqual(context.payload.repository.license.name);
    expect(result.get('repo_owner_id')).toEqual(context.payload.repository.owner.id);
    expect(result.get('repo_owner_name')).toEqual(context.payload.repository.owner.login);
    expect(result.get('repo_owner_type')).toEqual(context.payload.repository.owner.type);
    expect(result.get('branch')).toEqual(context.payload.repository.default_branch);
    expect(result.get('branch_default')).toEqual(deleteBranchPrefix(context.payload.ref));
    expect(result.get('null-to-empty')).toEqual(false);
    expect(result.get('change_type')).toEqual(null);
});

test('Test null to empty', () => {
    setupGit(workDir);
    fs.writeFileSync(path.join(workDir.toString(), "howdy.java"), "Hello there!");

    let result = main.run(null, workDir, new Set<string>(['.java', '.jar']), null, null, null, null, null, null, true);
    expect(result.get('tag-fallback')).toEqual("");
    expect(result.get('tag_latest')).toEqual("");
    expect(result.get('sha_latest')).toEqual("");
    expect(result.get('sha_latest_tag')).toEqual("");
    expect(result.get('null-to-empty')).toEqual(true);
    expect(result.get('change_type')).toEqual("");
});

test('Test changeTypes', () => {
    setupGit(workDir);
    cmdLog(workDir, 'git branch -m main');
    cmdLog(workDir, 'git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main');
    commitFile("00.txt", "init commit");
    cmdLog(workDir, 'git tag 1.0.0');

    const reverseChangeTypes = [...CHANGE_TYPES];
    reverseChangeTypes.reverse()

    for (const [key, value] of Object.entries(reverseChangeTypes)) {
        commitFile(`${value[0]}.txt`, `${value[0]}: conventional commit`);
        let result = main.run(null, workDir, new Set<string>(), null, null, null, null, null, true, null);
        expect(result.get('change_type')).toEqual(value[1]);
    }
});

function commitFile(name: string, message: string) {
    fs.writeFileSync(path.join(workDir.toString(), name), message);
    cmdLog(workDir, 'git add .');
    cmdLog(workDir, `git commit -am "${message}"`);
}

function setupGit(workDir: PathOrFileDescriptor) {
    cmd(workDir, "git config init.defaultBranch main");
    cmd(workDir, "git config --global init.defaultBranch main");
    cmd(workDir, 'git init');
    cmd(workDir, 'git checkout -b main');
    cmd(workDir, 'git config --file .git/config user.email "kira@yuna.berlin"');
    cmd(workDir, 'git config --file .git/config user.name "Kira"');
    console.log('is_git_repo' + cmd(workDir, 'git rev-parse --is-inside-work-tree', 'git rev-parse --git-dir'));
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



