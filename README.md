# git-info-action

Reads git information with conventional commit support and ticket number detection

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=HFHFUT3G6TZF6)

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
    echo "ticket_numbers       [${{ steps.git_info.outputs.ticket_numbers }}]"
    echo "x_has_changes_python [${{ steps.git_info.outputs.x_has_changes_python }}]"

```

### Inputs

| parameter              | default | description                                                            |
|------------------------|---------|------------------------------------------------------------------------|
| work-dir               | '.'     | work dir                                                               |
| ignore-files           | null    | regex list to ignore files (comma separated) e.g. '/\.txt$/, /\.doc$/' |
| branch-fallback        | 'main'  | fallback if no branch_default could be found                           |
| tag-fallback           | null    | fallback if no tag could be found                                      |
| fallback-commit-type   | ''      | fallback for commits without type (Conventional Commits)               |
| fallback-commit-scope  | ''      | fallback for commits without scope (Conventional Commits)              |
| commit-msg-with-footer | true    | include footer from commit messages (Conventional Commits)             |

### Outputs

| Name                        | default | description                                                                               |
|-----------------------------|---------|-------------------------------------------------------------------------------------------|
| branch                      | main    | current branch                                                                            |
| branch_default              | main    | default branch                                                                            |
| commits_ahead               | 0       | branch commits that are not in the branch_default                                         |
| commits_behind              | 0       | branch_default commits that are not in the branch                                         |
| is_default_branch           | false   | true if `branch` == `branch_default`                                                      |
| has_changes                 | false   | true if `sha_latest` != `sha_latest_tag`                                                  |
| has_local_changes           | false   | true if there are changes on non committed files                                          |
| has_breaking_changes        | false   | true if a commit has a breaking change (Conventional Commits)                             |
| sha_latest                  | null    | sha from latest commit                                                                    |
| sha_latest_tag              | null    | sha from latest tag                                                                       |
| tag_latest                  | 0.0.1   | latest tag                                                                                |
| commit_type_\<type>         | ""      | list of commit messages for the given commit type (Conventional Commits)                  |
| ticket_numbers              | ""      | list of ticket numbers (Jira  GitHub)                                                     |
| commit_types                | ""      | list of types (Conventional Commits)                                                      |
| commit_scopes               | ""      | list of scopes (Conventional Commits)                                                     |
| commit_scope_\<scope>       | ""      | list of commit messages for the given commit type (Conventional Commits)                  |
| x_has_changes_\<lang>       | false   | true on file changes exists between current sha and latest tag                            |
| x_has_local_changes_\<lang> | false   | true if there are changes on non committed files for the specific language                |
| x_language_list             | -       | a list of supported languages for `x_has_changes_<lang>` and `x_has_local_changes_<lang>` |

### \[DEV] Setup Environment

* setup or clean environment `./clean_node.sh`
* Run `npm run test:coverage` to run all tests
* Run `npm run build` to "compile" `index.ts` to `./lib/index.js`
* NodeJs 16: do not upgrade nodeJs as GitHub actions latest version is 16
* Hint: please do not remove the node modules as they are required for custom GitHub actions :(

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
