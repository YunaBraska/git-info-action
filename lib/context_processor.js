"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addContext = void 0;
function addContext(result, context) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34;
    //PAYLOAD
    result.set('context_ref', ((_a = context === null || context === void 0 ? void 0 : context.payload) === null || _a === void 0 ? void 0 : _a.ref) || (context === null || context === void 0 ? void 0 : context.ref) || null);
    result.set('context_workflow_file', ((_b = context === null || context === void 0 ? void 0 : context.payload) === null || _b === void 0 ? void 0 : _b.workflow) || null);
    result.set('context_actor_id', ((_d = (_c = context === null || context === void 0 ? void 0 : context.payload) === null || _c === void 0 ? void 0 : _c.sender) === null || _d === void 0 ? void 0 : _d.id) || null);
    result.set('context_actor_name', ((_f = (_e = context === null || context === void 0 ? void 0 : context.payload) === null || _e === void 0 ? void 0 : _e.sender) === null || _f === void 0 ? void 0 : _f.login) || (context === null || context === void 0 ? void 0 : context.actor) || null);
    result.set('context_actor_type', ((_h = (_g = context === null || context === void 0 ? void 0 : context.payload) === null || _g === void 0 ? void 0 : _g.sender) === null || _h === void 0 ? void 0 : _h.type) || null);
    //CONTEXT
    result.set('context_sha', (context === null || context === void 0 ? void 0 : context.sha) || null);
    result.set('context_event_mame', (context === null || context === void 0 ? void 0 : context.eventName) || null);
    result.set('context_workflow_name', (context === null || context === void 0 ? void 0 : context.workflow) || null);
    result.set('context_job_name', (context === null || context === void 0 ? void 0 : context.job) || null);
    result.set('context_run_id', (context === null || context === void 0 ? void 0 : context.runId) || null);
    result.set('context_run_number', (context === null || context === void 0 ? void 0 : context.runNumber) || null);
    //REPOSITORY
    result.set('repo_id', ((_k = (_j = context === null || context === void 0 ? void 0 : context.payload) === null || _j === void 0 ? void 0 : _j.repository) === null || _k === void 0 ? void 0 : _k.id) || null);
    result.set('repo_size', ((_m = (_l = context === null || context === void 0 ? void 0 : context.payload) === null || _l === void 0 ? void 0 : _l.repository) === null || _m === void 0 ? void 0 : _m.size) !== undefined ? context.payload.repository.size : null);
    result.set('repo_open_issues', ((_p = (_o = context === null || context === void 0 ? void 0 : context.payload) === null || _o === void 0 ? void 0 : _o.repository) === null || _p === void 0 ? void 0 : _p.open_issues) !== undefined ? context.payload.repository.open_issues : null);
    result.set('repo_star_count', ((_r = (_q = context === null || context === void 0 ? void 0 : context.payload) === null || _q === void 0 ? void 0 : _q.repository) === null || _r === void 0 ? void 0 : _r.stargazers_count) !== undefined ? context.payload.repository.stargazers_count : null);
    result.set('is_repo_fork', ((_t = (_s = context === null || context === void 0 ? void 0 : context.payload) === null || _s === void 0 ? void 0 : _s.repository) === null || _t === void 0 ? void 0 : _t.fork) !== undefined ? context.payload.repository.fork : null);
    result.set('is_repo_private', ((_v = (_u = context === null || context === void 0 ? void 0 : context.payload) === null || _u === void 0 ? void 0 : _u.repository) === null || _v === void 0 ? void 0 : _v.private) !== undefined ? context.payload.repository.private : null);
    result.set('is_repo_archived', ((_x = (_w = context === null || context === void 0 ? void 0 : context.payload) === null || _w === void 0 ? void 0 : _w.repository) === null || _x === void 0 ? void 0 : _x.archived) !== undefined ? context.payload.repository.archived : null);
    result.set('is_repo_disabled', ((_z = (_y = context === null || context === void 0 ? void 0 : context.payload) === null || _y === void 0 ? void 0 : _y.repository) === null || _z === void 0 ? void 0 : _z.disabled) !== undefined ? context.payload.repository.disabled : null);
    result.set('is_repo_template', ((_1 = (_0 = context === null || context === void 0 ? void 0 : context.payload) === null || _0 === void 0 ? void 0 : _0.repository) === null || _1 === void 0 ? void 0 : _1.is_template) !== undefined ? context.payload.repository.is_template : null);
    result.set('repo_visibility', ((_3 = (_2 = context === null || context === void 0 ? void 0 : context.payload) === null || _2 === void 0 ? void 0 : _2.repository) === null || _3 === void 0 ? void 0 : _3.visibility) || null);
    result.set('repo_default_branch', ((_5 = (_4 = context === null || context === void 0 ? void 0 : context.payload) === null || _4 === void 0 ? void 0 : _4.repository) === null || _5 === void 0 ? void 0 : _5.default_branch) || null);
    result.set('repo_language', ((_7 = (_6 = context === null || context === void 0 ? void 0 : context.payload) === null || _6 === void 0 ? void 0 : _6.repository) === null || _7 === void 0 ? void 0 : _7.language) || null);
    result.set('repo_name', ((_9 = (_8 = context === null || context === void 0 ? void 0 : context.payload) === null || _8 === void 0 ? void 0 : _8.repository) === null || _9 === void 0 ? void 0 : _9.name) || null);
    result.set('repo_created_at', ((_11 = (_10 = context === null || context === void 0 ? void 0 : context.payload) === null || _10 === void 0 ? void 0 : _10.repository) === null || _11 === void 0 ? void 0 : _11.created_at) || null);
    result.set('repo_updated_at', ((_13 = (_12 = context === null || context === void 0 ? void 0 : context.payload) === null || _12 === void 0 ? void 0 : _12.repository) === null || _13 === void 0 ? void 0 : _13.updated_at) || null);
    result.set('repo_html_url', ((_15 = (_14 = context === null || context === void 0 ? void 0 : context.payload) === null || _14 === void 0 ? void 0 : _14.repository) === null || _15 === void 0 ? void 0 : _15.html_url) || null);
    result.set('repo_hooks_url', ((_17 = (_16 = context === null || context === void 0 ? void 0 : context.payload) === null || _16 === void 0 ? void 0 : _16.repository) === null || _17 === void 0 ? void 0 : _17.hooks_url) || null);
    result.set('repo_description', ((_19 = (_18 = context === null || context === void 0 ? void 0 : context.payload) === null || _18 === void 0 ? void 0 : _18.repository) === null || _19 === void 0 ? void 0 : _19.description) || null);
    result.set('repo_license_key', ((_22 = (_21 = (_20 = context === null || context === void 0 ? void 0 : context.payload) === null || _20 === void 0 ? void 0 : _20.repository) === null || _21 === void 0 ? void 0 : _21.license) === null || _22 === void 0 ? void 0 : _22.key) || null);
    result.set('repo_license_name', ((_25 = (_24 = (_23 = context === null || context === void 0 ? void 0 : context.payload) === null || _23 === void 0 ? void 0 : _23.repository) === null || _24 === void 0 ? void 0 : _24.license) === null || _25 === void 0 ? void 0 : _25.name) || null);
    result.set('repo_owner_id', ((_28 = (_27 = (_26 = context === null || context === void 0 ? void 0 : context.payload) === null || _26 === void 0 ? void 0 : _26.repository) === null || _27 === void 0 ? void 0 : _27.owner) === null || _28 === void 0 ? void 0 : _28.id) || null);
    result.set('repo_owner_name', ((_31 = (_30 = (_29 = context === null || context === void 0 ? void 0 : context.payload) === null || _29 === void 0 ? void 0 : _29.repository) === null || _30 === void 0 ? void 0 : _30.owner) === null || _31 === void 0 ? void 0 : _31.login) || null);
    result.set('repo_owner_type', ((_34 = (_33 = (_32 = context === null || context === void 0 ? void 0 : context.payload) === null || _32 === void 0 ? void 0 : _32.repository) === null || _33 === void 0 ? void 0 : _33.owner) === null || _34 === void 0 ? void 0 : _34.type) || null);
}
exports.addContext = addContext;
