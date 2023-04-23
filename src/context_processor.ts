import {ResultType} from './common_processing';
import path from "path";
import os from "os";

export function addContext(result: Map<string, ResultType>, context: any) {
    //PAYLOAD
    result.set('context_ref', context?.payload?.ref || context?.ref || null)
    result.set('context_workflow_file', context?.payload?.workflow || null)
    result.set('context_actor_id', context?.payload?.sender?.id || null)
    result.set('context_actor_name', context?.payload?.sender?.login || context?.actor || null)
    result.set('context_actor_type', context?.payload?.sender?.type || null)

    //CONTEXT
    result.set('context_sha', context?.sha || null)
    result.set('context_event_mame', context?.eventName || null)
    result.set('context_workflow_name', context?.workflow || null)
    result.set('context_job_name', context?.job || null)
    result.set('context_run_id', context?.runId || null)
    result.set('context_run_number', context?.runNumber || null)

    //REPOSITORY
    result.set('repo_id', context?.payload?.repository?.id || 0)
    result.set('repo_size', context?.payload?.repository?.size !== undefined ? context.payload.repository.size : 0)
    result.set('repo_open_issues', context?.payload?.repository?.open_issues !== undefined ? context.payload.repository.open_issues : 0)
    result.set('repo_star_count', context?.payload?.repository?.stargazers_count !== undefined ? context.payload.repository.stargazers_count : 0)
    result.set('is_repo_fork', context?.payload?.repository?.fork !== undefined ? context.payload.repository.fork : false)
    result.set('is_repo_private', context?.payload?.repository?.private !== undefined ? context.payload.repository.private : true)
    result.set('is_repo_archived', context?.payload?.repository?.archived !== undefined ? context.payload.repository.archived : false)
    result.set('is_repo_disabled', context?.payload?.repository?.disabled !== undefined ? context.payload.repository.disabled : false)
    result.set('is_repo_template', context?.payload?.repository?.is_template !== undefined ? context.payload.repository.is_template : false)
    result.set('repo_visibility', context?.payload?.repository?.visibility || 'unknown')
    result.set('repo_default_branch', context?.payload?.repository?.default_branch || null)
    result.set('repo_language', context?.payload?.repository?.language || null)
    result.set('repo_name', context?.payload?.repository?.name || path.basename(process.cwd()))
    result.set('repo_created_at', context?.payload?.repository?.created_at || null)
    result.set('repo_updated_at', context?.payload?.repository?.updated_at || null)
    result.set('repo_html_url', context?.payload?.repository?.html_url || null)
    result.set('repo_hooks_url', context?.payload?.repository?.hooks_url || null)
    result.set('repo_description', context?.payload?.repository?.description || null)
    result.set('repo_license_key', context?.payload?.repository?.license?.key || null)
    result.set('repo_license_name', context?.payload?.repository?.license?.name || null)
    result.set('repo_owner_id', context?.payload?.repository?.owner?.id || null)
    result.set('repo_owner_name', context?.payload?.repository?.owner?.login || os?.userInfo()?.username || null)
    result.set('repo_owner_type', context?.payload?.repository?.owner?.type || 'User')
}
