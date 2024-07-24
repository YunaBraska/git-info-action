# git-info-action

Instant insights into the latest changes and commits.
Provides valuable outputs such as ticket number detection, breaking changes, latest branch & commit & tag information,
variety of programming languages and conventions.

[![](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/YunaBraska)

[![Build][build_shield]][build_link]
[![Maintainable][maintainable_shield]][maintainable_link]
[![Coverage][coverage_shield]][coverage_link]
[![Issues][issues_shield]][issues_link]
[![Commit][commit_shield]][commit_link]
[![License][license_shield]][license_link]
[![Tag][tag_shield]][tag_link]
[![Size][size_shield]][size_shield]
![Label][label_shield]
![Label][node_version]
[![Licenses](https://img.shields.io/badge/Licenses-065d7c?style=flat-square)](https://github.com/YunaBraska/git-info-action/blob/main/dist/licenses.txt)

### Features

* update Shields/Badges see [ShieldsDemo](./ShieldDemo.md)

## Usage

```yaml
# RUNNER
- name: "Read Git Info"
  id: "git_info"
  uses: YunaBraska/git-info-action@main

  # CONFIGS (Optional)
  with:
    workDir: '.'
    ignore-files: '.java, .groovy, .jar'
    branch-fallback: 'main'
    tag-fallback: '0.0.1'
    fallback-commit-type: 'chore'
    fallback-commit-scope: 'performance'
    commit-msg-with-footer: 'true'
    max-changelog-length: 200

  # PRINT
- name: "Print Git Info"
  run: |
    echo "is_git_repo          [${{ steps.git_info.outputs.is_git_repo }}]"
    echo "tag_latest           [${{ steps.git_info.outputs.tag_latest }}]"
    echo "sha_latest           [${{ steps.git_info.outputs.sha_latest }}]"
    echo "sha_latest_tag       [${{ steps.git_info.outputs.sha_latest_tag }}]"
    echo "branch               [${{ steps.git_info.outputs.branch }}]"
    echo "branch_default       [${{ steps.git_info.outputs.branch_default }}]"
    echo "has_changes          [${{ steps.git_info.outputs.has_changes }}]"
    echo "has_local_changes    [${{ steps.git_info.outputs.has_local_changes }}]"
    echo "has_breaking_changes [${{ steps.git_info.outputs.has_breaking_changes }}]"
    echo "commit_types         [${{ steps.git_info.outputs.commit_types }}]"
    echo "commit_scopes        [${{ steps.git_info.outputs.commit_scopes }}]"
    echo "change_log           [${{ steps.git_info.outputs.change_log }}]"
    echo "change_log_type_feat [${{ steps.git_info.outputs.change_log_type_feat }}]"
    echo "ticket_numbers       [${{ steps.git_info.outputs.ticket_numbers }}]"
    echo "x_has_changes_python [${{ steps.git_info.outputs.x_has_changes_python }}]"

```

### Inputs

| parameter              | default | description                                                            |
|------------------------|---------|------------------------------------------------------------------------|
| work-dir               | '.'     | Work dir                                                               |
| ignore-files           | null    | Regex list to ignore files (comma separated) e.g. '/\.txt$/, /\.doc$/' |
| branch-fallback        | 'main'  | Fallback if no branch_default could be found                           |
| tag-fallback           | null    | Fallback if no tag could be found                                      |
| tag-match-pattern      | null    | Pattern, using glob(7) syntax, to match tags in the repository         |
| fallback-commit-type   | ''      | Fallback for commits without type (Conventional Commits)               |
| fallback-commit-scope  | ''      | Fallback for commits without scope (Conventional Commits)              |
| commit-msg-with-footer | false   | Include footer from commit messages (Conventional Commits)             |
| null-to-empty          | true    | Replaces null values with empty strings                                |

### Outputs

| Name                        | Example                                                         | Default | Description                                                                               |
|-----------------------------|-----------------------------------------------------------------|---------|-------------------------------------------------------------------------------------------|
| branch                      | main                                                            | main    | Current branch                                                                            |
| branch_default              | main                                                            | main    | Default branch                                                                            |
| commits_ahead               | 0                                                               | 0       | Branch commits that are not in the branch_default                                         |
| commits_behind              | 0                                                               | 0       | Branch_default commits that are not in the branch                                         |
| is_default_branch           | false                                                           | false   | true if `branch` == `branch_default`                                                      |
| has_changes                 | false                                                           | false   | true if `sha_latest` != `sha_latest_tag`                                                  |
| has_local_changes           | false                                                           | false   | true if there are changes on non committed files                                          |
| has_breaking_changes        | false                                                           | false   | true if a commit has a breaking change (Conventional Commits)                             |
| sha_latest                  | "b63fd71e769ca531cf47192312af3e804793538d"                      | null    | SHA from latest commit                                                                    |
| sha_latest_tag              | "e3fb9b698ee7b0e725adaf16187be06d732a7e3f"                      | null    | SHA from latest tag                                                                       |
| tag_latest                  | 0.0.1                                                           | null    | Latest tag                                                                                |
| ticket_numbers              | "JIRA-123, #123"                                                | null    | List of ticket numbers (Jira  GitHub)                                                     |
| commit_types                | "feat, chore, docs"                                             | null    | List of types (Conventional Commits)                                                      |
| commit_scopes               | "frontend, feature_a, bug_b"                                    | null    | List of scopes (Conventional Commits)                                                     |
| change_type                 | "major"                                                         | null    | Change Type \[major, minor, patch, rc] (Conventional Commits)                             |
| change_log                  | "Added ShopButton. Changed Logo"                                | null    | Full Change Log (Conventional Commits)                                                    |
| change_log_type_\<type>     | "Added ShopButton."                                             | -       | Change Log for the given type (Conventional Commits)                                      |
| change_log_scope_\<scope>   | "Changed Logo"                                                  | -       | Change Log for the given scope (Conventional Commits)                                     |
| file_changes                | "file.txt, json.js"                                             | ''      | List of local file changes                                                                |
| file_changes_local          | "file.txt, json.js"                                             | ''      | List of file changes (sha_latest <> sha_latest_tag)                                       |
| x_has_changes_\<lang>       | true                                                            | false   | true on file changes exists between current sha and latest tag                            |
| x_has_local_changes_\<lang> | true                                                            | false   | true if there are changes on non committed files for the specific language                |
| x_language_list             | "go, html, css, java, js, json, md, php, python, yaml"          | -       | A list of supported languages for `x_has_changes_<lang>` and `x_has_local_changes_<lang>` |
| context_ref                 | "refs/heads/main"                                               | null    | The git ref of the triggering event                                                       |
| context_workflow_file       | ".github/workflows/trigger_test.yml"                            | null    | The workflow file where the triggering event occurred                                     |
| context_actor_id            | 13748223                                                        | null    | The ID of the user or app that triggered the event                                        |
| context_actor_name          | "YunaBraska"                                                    | null    | The name of the user or app that triggered the event                                      |
| context_actor_type          | "User"                                                          | null    | The type of the user or app that triggered the event                                      |
| context_sha                 | "b63fd71e769ca531cf47192312af3e804793538d"                      | null    | The git SHA of the commit that triggered the event                                        |
| context_event_name          | "workflow_dispatch"                                             | null    | The name of the event that triggered the workflow                                         |
| context_workflow_name       | "TRIGGER WORKFLOW CALL"                                         | null    | The name of the workflow that was triggered                                               |
| context_job_name            | "build"                                                         | null    | The name of the job that was triggered                                                    |
| context_run_id              | 4398246357                                                      | null    | The ID of the workflow run that was triggered                                             |
| context_run_number          | 8                                                               | null    | The number of the workflow run that was triggered                                         |
| repo_id                     | 612981281                                                       | null    | The ID of the repository where the triggering event occurred                              |
| repo_size                   | 0                                                               | null    | The size of the repository where the triggering event occurred                            |
| repo_open_issues            | 0                                                               | null    | The number of open issues in the repository where the triggering event occurred           |
| repo_star_count             | 0                                                               | null    | The number of stars the repository where the triggering event occurred has                |
| is_repo_fork                | false                                                           | null    | Whether the repository where the triggering event occurred is a fork                      |
| is_repo_private             | false                                                           | null    | Whether the repository where the triggering event occurred is private                     |
| is_repo_archived            | false                                                           | null    | Whether the repository where the triggering event occurred is archived                    |
| is_repo_disabled            | false                                                           | null    | Whether the repository where the triggering event occurred is disabled                    |
| is_repo_template            | false                                                           | null    | Whether the repository where the triggering event occurred is a template                  |
| repo_visibility             | "public"                                                        | null    | The visibility of the repository where the triggering event occurred                      |
| repo_default_branch         | "main"                                                          | null    | The default branch of the repository where the triggering event occurred                  |
| repo_language               | "TypeScript"                                                    | null    | The main language used in the repository where the triggering event occurred              |
| repo_name                   | "input-merger-action"                                           | null    | The name of the repository where the triggering event occurred                            |
| repo_created_at             | "2023-03-12T14:59:30Z"                                          | null    | The date and time the repository where the triggering event occurred was created          |
| repo_updated_at             | "2023-03-12T15:01:13Z"                                          | null    | The date and time the repository where the triggering event occurred was last updated     |
| repo_html_url               | "https://github.com/YunaBraska/git-info-action"                 | null    | The URL of the repository                                                                 |
| repo_hooks_url              | "https://api.github.com/repos/YunaBraska/git-info-action/hooks" | null    | The URL of the repository's hooks                                                         |
| repo_description            | "Git insights such as branch, commit, tag, ticket number,..."   | null    | The description of the repository                                                         |
| repo_license_key            | "apache-2.0"                                                    | null    | The license key of the repository                                                         |
| repo_license_name           | "Apache License 2.0"                                            | null    | The license name of the repository                                                        |
| repo_owner_id               | 13748223                                                        | null    | The ID of the owner of the repository                                                     |
| repo_owner_name             | "YunaBraska"                                                    | null    | The username of the owner of the repository                                               |
| repo_owner_type             | "User"                                                          | null    | The type of the owner                                                                     |

### \[DEV] Setup Environment

* Build: `npm run build` to "compile" `index.ts` to `./lib/index.js`
* Test: `npm run test`
* _clean environment: `./clean_node.sh`_
* NodeJs 20: do not upgrade nodeJs as GitHub actions latest version is 20

[build_shield]: https://github.com/YunaBraska/git-info-action/workflows/RELEASE/badge.svg

[build_link]: https://github.com/YunaBraska/git-info-action/actions/workflows/publish.yml/badge.svg

[maintainable_shield]: https://img.shields.io/codeclimate/maintainability/YunaBraska/git-info-action?style=flat-square

[maintainable_link]: https://codeclimate.com/github/YunaBraska/git-info-action/maintainability

[coverage_shield]: https://img.shields.io/codeclimate/coverage/YunaBraska/git-info-action?style=flat-square

[coverage_link]: https://codeclimate.com/github/YunaBraska/git-info-action/test_coverage

[issues_shield]: https://img.shields.io/github/issues/YunaBraska/git-info-action?style=flat-square

[issues_link]: https://github.com/YunaBraska/git-info-action/commits/main

[commit_shield]: https://img.shields.io/github/last-commit/YunaBraska/git-info-action?style=flat-square

[commit_link]: https://github.com/YunaBraska/git-info-action/issues

[license_shield]: https://img.shields.io/github/license/YunaBraska/git-info-action?style=flat-square

[license_link]: https://github.com/YunaBraska/git-info-action/blob/main/LICENSE

[tag_shield]: https://img.shields.io/github/v/tag/YunaBraska/git-info-action?style=flat-square

[tag_link]: https://github.com/YunaBraska/git-info-action/releases

[size_shield]: https://img.shields.io/github/repo-size/YunaBraska/git-info-action?style=flat-square

[label_shield]: https://img.shields.io/badge/Yuna-QueenInside-blueviolet?style=flat-square

[gitter_shield]: https://img.shields.io/gitter/room/YunaBraska/git-info-action?style=flat-square

[gitter_link]: https://gitter.im/git-info-action/Lobby

[node_version]: https://img.shields.io/badge/node-16-blueviolet?style=flat-square
