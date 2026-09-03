// One record per live Atlassian Marketplace app. Rendered by layouts/AppPage.astro
// via the thin pages in src/pages/apps/. Images live at public/apps/<slug>/h{1,2,3}.png.
// Copy rule: no em/en dashes in any user-facing string.

export interface AtlassianApp {
  slug: string;
  name: string;
  product: 'Jira' | 'Jira Service Management' | 'Confluence';
  title: string;        // SEO title / H1, search-intent phrased
  tagline: string;
  description: string;  // meta description
  problem: string;      // opening paragraph: the gap this closes
  features: string[];
  captions: [string, string, string]; // one per screenshot
  honest: string[];     // honest-limits bullets
  scopes: { scope: string; why: string }[];
  writes: string | null; // the opt-in write path, or null if read-only
  youtube: string | null;
  listing: string;
  docs: string;
  blog?: string;        // related blog post path, if one exists
}

const docsBase = 'https://github.com/abahocodes/katabarwalabs-docs/blob/master/';

export const atlassianApps: AtlassianApp[] = [
  {
    slug: 'jira-access-governance-reporter',
    name: 'Access Governance Reporter',
    product: 'Jira',
    title: 'Who can access what in Jira: effective permissions, per user and per group',
    tagline: 'See who can access what in Jira and prove it with audit-ready CSV, then revoke the access that should not exist.',
    description: 'Access Governance Reporter builds the effective-access matrix Jira never shows: per user, every project and permission and the exact group or role that grants it, with group-usage views and audit-ready CSV export.',
    problem: 'Jira has no screen that answers "which projects can this user reach, and why?" or "where is this group actually used?" Permission schemes, project roles, and group memberships each tell a fragment; the effective answer lives in nobody\'s head. Access reviews end up as spreadsheets built from a dozen admin screens.',
    features: [
      'Effective-access matrix: per user, which projects and permissions, via which group or role path.',
      'Group-usage view: every project a group grants access to, and how (scheme grant vs project role).',
      'Handles group membership, project-role actors (users and group actors), and direct user grants.',
      'Summary-first report: instant dashboard at any site size, detail pages in on demand with server-side search.',
      'Daily automatic refresh, cached in-tenant for instant reporting.',
      'One-click CSV attestation export, one row per grant path.',
    ],
    captions: [
      'The effective-access matrix: every user, every project, every permission, and the grant path behind it.',
      'Group usage in both directions: what a group grants, and what a user holds through it.',
      'The daily crawl streams per-project facts into bounded, paged storage.',
    ],
    honest: [
      'Global-permission grantees cannot be enumerated through any public Jira Cloud API, so that surface is reported as not coverable rather than silently omitted.',
      'The report reflects the last completed crawl; changes made minutes ago appear after the next refresh or a manual rescan.',
    ],
    scopes: [
      { scope: 'read:jira-work', why: 'projects, permission schemes, and project roles' },
      { scope: 'read:jira-user', why: 'user details for the matrix and CSV' },
      { scope: 'storage:app', why: 'the cached report, entirely in your tenant' },
    ],
    writes: 'An opt-in, preview-first revocation can remove deactivated users from groups and roles. It is dry-run by default, shows the exact change set, requires explicit confirmation, re-checks that each account is still deactivated before acting, and removes access only. It never deactivates accounts.',
    youtube: null,
    listing: 'https://marketplace.atlassian.com/apps/3162504883/access-governance-reporter',
    docs: docsBase + 'access-governance-reporter.md',
    blog: '/blog/jira-group-usage-beyond-permission-schemes',
  },
  {
    slug: 'jira-access-snapshot-drift',
    name: 'Access Snapshot & Drift',
    product: 'Jira',
    title: 'Prove who could access a Jira project on any past date',
    tagline: 'Daily snapshots of who can access every project, retained long-term, diffed for drift, and revertable when access creeps.',
    description: 'Access Snapshot & Drift takes a daily point-in-time snapshot of every Jira project\'s access (roles, groups, effective users), retains it past the native 180-day audit window, and diffs each run so drift stops being guesswork.',
    problem: 'An auditor asks "show me everyone who could access the Payments project on March 3rd." Jira shows access as it is right now; the audit log retains roughly 180 days and records change events, not point-in-time rosters. Past that window, the question is unanswerable.',
    features: [
      'Daily point-in-time snapshot of every project\'s access: roles, groups, and effective users with groups fully expanded.',
      'Long-term retention for a window you control (default around 400 days), with automatic pruning.',
      'Every run diffed against the previous snapshot: users and groups added or removed, per project and role.',
      'View the full access matrix for any retained date.',
      'A retained Recent-changes log so one-day blips are never lost.',
      'One-click, audit-ready CSV export of any snapshot.',
    ],
    captions: [
      'Pick any retained date and read its access matrix back verbatim.',
      'Drift as a delta: who was added or removed since the last run, per project and role.',
      'The daily scheduled snapshot crawls projects, expands groups, and prunes to your retention window.',
    ],
    honest: [
      'History starts at install. The app cannot backfill dates before its first snapshot.',
      'The drift revert is removals-only by design: it rolls back access additions, previews the exact change set first, and anything it removes can be re-granted at any time.',
    ],
    scopes: [
      { scope: 'read:jira-work', why: 'projects, roles, and role actors' },
      { scope: 'read:jira-user', why: 'account details surfaced in the matrix' },
      { scope: 'manage:jira-configuration', why: 'the opt-in drift revert only; never used by the reporting path' },
      { scope: 'storage:app', why: 'the retained snapshot series, in your tenant' },
    ],
    writes: 'The opt-in drift revert can roll back access additions since a baseline you choose. Removals-only, dry-run preview first, explicit confirmation required.',
    youtube: 'tI16AV1EC3w',
    listing: 'https://marketplace.atlassian.com/apps/3543425839/access-snapshot-drift',
    docs: docsBase + 'access-snapshot-drift.md',
  },
  {
    slug: 'jira-audit-log-retention',
    name: 'Compliance Log Vault',
    product: 'Jira',
    title: 'Keep Jira audit logs longer than 180 days',
    tagline: 'Retain Jira audit records long-term and export SOC 2 and ISO evidence. Runs entirely on Atlassian.',
    description: 'Jira\'s audit log ages out after roughly 180 days. Compliance Log Vault syncs every audit record daily into a vault in your own tenant, retains it long-term, and exports the whole history as audit-ready CSV.',
    problem: 'Jira\'s native audit log is capped: records older than roughly 180 days age out and are gone. When a SOC 2 or ISO auditor asks for last year\'s evidence, there is nothing to show. Raising the cap is one of the longest-standing open requests on the public tracker.',
    features: [
      'Daily incremental sync of new Jira audit records into an in-tenant vault.',
      'Dedup by record id: a record is never stored twice, even across overlapping syncs.',
      'Long-term retention past Jira\'s cap; the vault only grows.',
      'Browse retained records newest-first from an admin page.',
      'Retention stats: counts by day and category, and the full retained span.',
      'One-click, audit-ready CSV export of the whole vault.',
    ],
    captions: [
      'The vault: every retained audit record, browsable newest-first.',
      'Retention at a glance: coverage by day and category, and the full span you can prove.',
      'The daily sync pulls new records, dedups by id, and appends to the vault.',
    ],
    honest: [
      'Capture starts at install. Records that had already aged out of Jira\'s window before install cannot be recovered.',
      'The vault stores Jira audit records; it does not capture org-level (admin.atlassian.com) audit events, which live behind a different API surface.',
    ],
    scopes: [
      { scope: 'read:audit-log:jira', why: 'reading the audit records' },
      { scope: 'read:user:jira', why: 'required pair for the auditing endpoint' },
      { scope: 'storage:app', why: 'the vault itself, in your tenant' },
    ],
    writes: null,
    youtube: 'S1mdAPhSxwU',
    listing: 'https://marketplace.atlassian.com/apps/4152437534/compliance-log-vault',
    docs: docsBase + 'compliance-log-vault.md',
    blog: '/blog/keep-atlassian-audit-logs-beyond-retention',
  },
  {
    slug: 'jira-inactive-user-hygiene',
    name: 'Inactive-User Hygiene',
    product: 'Jira',
    title: 'Find inactive Jira users and reclaim their licenses',
    tagline: 'Find idle and never-active Jira accounts from real Jira activity, and export a license-reclaim worklist as CSV.',
    description: 'Jira has no "who has not touched anything in 90 days?" view. Inactive-User Hygiene derives each user\'s last activity from Jira issue history, flags idle and never-active accounts against a threshold you set, and exports a reclaim worklist.',
    problem: 'You pay per user, you suspect a chunk of those seats are dormant, and no screen in the product answers the plain question "who has not touched anything in 90 days?" Jira shows you who exists, not who is working.',
    features: [
      'Derives each user\'s last activity from Jira issue history (assignee or reporter).',
      'Flags idle (beyond a threshold you set, default 90 days) and never-active accounts.',
      'Estimates reclaimable seats: active accounts safe to review for removal.',
      'Filters and sorts the worklist; highlights newly-idle users since the last scan.',
      'One-click, audit-ready CSV export of the full worklist.',
      'Unknown is never inactive: a failed lookup is marked unresolved and never flagged idle.',
    ],
    captions: [
      'Users ranked by days idle, with reclaimable-seat counts at a glance.',
      'The reclaim worklist: idle and never-active accounts with suggested review actions.',
      'The daily scan derives last activity per user and never flags an unresolved lookup.',
    ],
    honest: [
      'It measures Jira activity, not org-wide login. The org admin API is not reachable by a tenant app, and Jira activity is the right signal for reclaiming Jira seats specifically. The report says so on its face.',
      'Removing a user from product-access groups strips access but does not free the license seat. Only deactivating the account in admin.atlassian.com does that.',
    ],
    scopes: [
      { scope: 'read:jira-user', why: 'enumerating the roster' },
      { scope: 'read:jira-work', why: 'deriving last activity from issue history' },
      { scope: 'storage:app', why: 'the cached worklist, in your tenant' },
    ],
    writes: 'An opt-in, admin-confirmed removal takes reviewed idle users out of their product-access groups, always from a preview you approve. Groups that look IdP-synced are skipped, because your identity provider would re-add them.',
    youtube: 'knUtcXXKQn4',
    listing: 'https://marketplace.atlassian.com/apps/2720285106/inactive-user-hygiene',
    docs: docsBase + 'inactive-user-hygiene.md',
  },
  {
    slug: 'jira-orphaned-owner-cleanup',
    name: 'Orphaned-Owner Cleanup',
    product: 'Jira',
    title: 'Find Jira filters, dashboards, and issues owned by deactivated users',
    tagline: 'Every filter, dashboard, issue, and project lead still pointing at deactivated users. Runs entirely on Atlassian.',
    description: 'When people leave, their Jira debris stays: filters nobody can edit, dashboards nobody owns, issues assigned to ghosts. Orphaned-Owner Cleanup scans your whole site daily and exports the cleanup queue as CSV.',
    problem: 'Deactivating a user closes their access but cleans up nothing they owned. Filters go un-editable, dashboards go unowned, issues stay assigned to ghosts, and projects keep leads who left a year ago. Jira has no report that surfaces any of it.',
    features: [
      'Finds every deactivated human account on the site, daily and on demand.',
      'Flags saved filters and dashboards still owned by deactivated users.',
      'Finds issues still assigned to, or reported by, deactivated users, site-wide.',
      'Flags projects whose lead is deactivated.',
      'Groups everything by artifact type and by departed owner, biggest first.',
      'One-click, audit-ready CSV export of the full cleanup queue.',
    ],
    captions: [
      'The cleanup queue: every orphaned artifact, grouped by type.',
      'Per-owner rollup: which departed accounts left the most behind.',
      'The daily scan sweeps filters, dashboards, issues, and project leads.',
    ],
    honest: [
      'The report is evidence, not action: reassignment happens through Jira\'s own admin screens, with the CSV as your worklist.',
      'Only deactivated accounts are flagged. Active accounts never appear in the queue, however idle.',
    ],
    scopes: [
      { scope: 'read:jira-user', why: 'finding deactivated accounts' },
      { scope: 'read:jira-work', why: 'filters, dashboards, issues, and project leads' },
      { scope: 'storage:app', why: 'the cached queue, in your tenant' },
    ],
    writes: null,
    youtube: '2JHiBzKMV-I',
    listing: 'https://marketplace.atlassian.com/apps/2038592087/orphaned-owner-cleanup',
    docs: docsBase + 'orphaned-owner-cleanup.md',
    blog: '/blog/jira-filters-dashboards-deactivated-owners',
  },
  {
    slug: 'jsm-portal-governance',
    name: 'Portal Governance for JSM',
    product: 'Jira Service Management',
    title: 'Audit who can access every JSM portal',
    tagline: 'Every customer, organization, and agent grant on every portal, with drift, deactivated-account flags, and opt-in cleanup.',
    description: 'Portal access sprawls silently across service desks. Portal Governance for JSM scans every desk daily, builds the full access matrix with exposure flags, diffs it for drift, and exports audit-ready CSV.',
    problem: 'Customers get added desk by desk, organizations drift, agents inherit access through groups nobody re-checks, and deactivated accounts linger on the Service Desk Team role. JSM has no single view of who can reach which portal.',
    features: [
      'Scans every service desk daily and on demand.',
      'Lists every customer with direct portal access, per desk.',
      'Rolls up every organization grant with its membership size and members.',
      'Classifies every Service Desk Team agent grant: direct vs group.',
      'Flags deactivated agents, group-granted access, empty orgs, and empty portals.',
      'Diffs each scan against the previous snapshot for per-desk drift, and exports the matrix as CSV.',
    ],
    captions: [
      'The per-desk access matrix: customers, organizations, and agents in one view.',
      'Exposure flags surface deactivated agents and group-granted access.',
      'The daily scan diffs each desk against its previous snapshot.',
    ],
    honest: [
      'Organization membership reads require the customer-management scope; the app uses it for GET calls and the opt-in cleanup only.',
      'Drift history starts at install; the app cannot reconstruct grants that changed before its first scan.',
    ],
    scopes: [
      { scope: 'read:servicedesk-request', why: 'desks and portal configuration' },
      { scope: 'manage:servicedesk-customer', why: 'organization membership GETs and the opt-in cleanup DELETEs' },
      { scope: 'read:jira-work / read:jira-user', why: 'agent and account details' },
      { scope: 'storage:app', why: 'report cache and scan state, in your tenant' },
    ],
    writes: 'An opt-in, admin-gated cleanup can remove flagged customer grants, always from a preview you approve first.',
    youtube: 'YwYZUOkP7zg',
    listing: 'https://marketplace.atlassian.com/apps/1250207589/portal-governance-for-jsm',
    docs: docsBase + 'jsm-portal-governance.md',
    blog: '/blog/audit-jsm-portal-customer-access',
  },
  {
    slug: 'jsm-notification-log',
    name: 'Notification Log for JSM',
    product: 'Jira Service Management',
    title: 'Keep a record of every outgoing JSM customer notification',
    tagline: 'Every outgoing customer notification recorded as it fires, retained and exportable. Runs entirely on Atlassian.',
    description: 'JSM keeps no queryable log of the notifications it sends; its built-in email log records only the ones that fail. Notification Log for JSM records every notification-triggering event as it happens.',
    problem: 'A customer says "I never got the notification." JSM cannot help you: it keeps no queryable log of what it sent, and the native email log records only failed sends. Proving a notification went out is guesswork.',
    features: [
      'Records every outgoing notification event: request created, public reply, status change.',
      'Captures the request, service desk, actor, and recipient set per notification.',
      'Search and filter by request, desk, audience, and type.',
      'Retains history for a configurable window, then prunes automatically.',
      'One-click, audit-ready CSV export of the full log.',
    ],
    captions: [
      'The log: every notification-triggering event with its recipient set.',
      'Filter by request, desk, audience, or event type.',
      'Events are recorded as they fire and deduplicated by id.',
    ],
    honest: [
      'Capture starts at install; events before the first sync are not recoverable.',
      'The app records that a notification-triggering event fired and who the recipients were. Final mail delivery happens inside Atlassian\'s pipeline, beyond what any tenant app can observe.',
      'Where Jira provides only an account id and no display name, the log shows the id. That is a privacy-respecting API behavior, not a bug.',
    ],
    scopes: [
      { scope: 'read:servicedesk-request', why: 'request and desk context per event' },
      { scope: 'read:jira-work / read:jira-user', why: 'actor and recipient details' },
      { scope: 'storage:app', why: 'the log itself, in your tenant' },
    ],
    writes: null,
    youtube: 'IkUOh9VqfY0',
    listing: 'https://marketplace.atlassian.com/apps/966773862/notification-log-for-jsm',
    docs: docsBase + 'jsm-notification-log.md',
  },
  {
    slug: 'jsm-assets-export',
    name: 'Assets Export Manager for JSM',
    product: 'Jira Service Management',
    title: 'Bulk export a JSM Assets object schema to CSV or JSON',
    tagline: 'Export a whole JSM Assets object schema, every object and attribute, to audit-ready CSV or JSON.',
    description: 'JSM Assets has no built-in bulk export. Assets Export Manager lets you pick an object schema, choose CSV or JSON, and download every object with its attributes, straight to your browser.',
    problem: 'JSM Assets has no built-in bulk export. Getting a schema\'s objects into a spreadsheet means paging the AQL API by hand or copying screens. The ask has been open on the public tracker for years.',
    features: [
      'Pick a schema, choose CSV or JSON, download every object with its attributes.',
      'Object identity captured per row: object key, label, and object type.',
      'CSV columns are the sorted union of attribute names across the schema.',
      'A manifest records the schema, object count, and per-type breakdown per export.',
      'A record of every export is kept for audit.',
    ],
    captions: [
      'Pick a schema and format; the export streams to your browser.',
      'Every object with every attribute, one row per object.',
      'The export history: who exported what, when.',
    ],
    honest: [
      'Assets access is per-schema: the app can only export schemas the installing context can read.',
      'Attribute values are exported as their rendered display values, which is what a spreadsheet consumer wants, not raw internal references.',
    ],
    scopes: [
      { scope: 'read:cmdb-schema:jira / read:cmdb-type:jira / read:cmdb-object:jira', why: 'listing schemas and paging objects with attributes' },
      { scope: 'read:servicedesk-request', why: 'resolving the Assets workspace id' },
      { scope: 'storage:app', why: 'export history and in-flight state, in your tenant' },
    ],
    writes: 'An opt-in stale-object cleanup exists with the strictest guardrails we ship: Assets deletion is irreversible, so it is dry-run by default, re-verified server-side, capped per run, excludes referenced objects, and requires an explicit role grant before it can act.',
    youtube: null,
    listing: 'https://marketplace.atlassian.com/apps/3829199441/assets-export-manager-for-jira-service-management',
    docs: docsBase + 'jsm-assets-export.md',
    blog: '/blog/export-jsm-assets-object-schema',
  },
  {
    slug: 'confluence-attachment-cleanup',
    name: 'Attachment Cleanup for Confluence',
    product: 'Confluence',
    title: 'Find unused and orphaned attachments in Confluence Cloud',
    tagline: 'See every attachment across your site, flag the unused and orphaned files, and total the storage you can reclaim.',
    description: 'Confluence gives no site-wide view of attachment storage waste. Attachment Cleanup scans every space, flags unused, orphaned, and large attachments, totals reclaimable storage, and exports audit-ready CSV.',
    problem: 'Attachments pile up silently: an image removed from a page stays in storage, trashed pages keep their files, and giant uploads hide in forgotten spaces. Confluence has no site-wide attachment inventory, so "where is my storage going?" has no native answer.',
    features: [
      'Inventories every attachment site-wide, daily and on demand.',
      'Flags unused, orphaned, and large attachments.',
      'Totals storage and reclaimable bytes per space and site-wide.',
      'Surfaces the biggest cleanup opportunities first.',
      'One-click, audit-ready CSV export of the full inventory.',
      'Opt-in bulk cleanup: preview, confirm, then soft-delete flagged attachments to the space trash. Recoverable, never a permanent purge.',
    ],
    captions: [
      'The site-wide inventory: every attachment with its flag and size.',
      'Reclaimable storage rolled up per space, biggest first.',
      'The daily sweep classifies files and totals what you can reclaim.',
    ],
    honest: [
      'Reference detection is a textual scan of page bodies. It is deliberately conservative, and a file it cannot prove is referenced is flagged for review, not deleted.',
      'Cleanup is soft-delete to the space trash only. Nothing is ever purged permanently by the app.',
    ],
    scopes: [
      { scope: 'read:space:confluence / read:page:confluence', why: 'enumerating spaces, pages, and attachments' },
      { scope: 'storage:app', why: 'the chunked inventory cache, in your tenant' },
    ],
    writes: 'The opt-in bulk cleanup soft-deletes flagged attachments to the space trash after a preview you confirm. Everything it moves can be restored from trash.',
    youtube: 'CxC3Zkko6X0',
    listing: 'https://marketplace.atlassian.com/apps/1397083709/attachment-cleanup-for-confluence',
    docs: docsBase + 'confluence-attachment-cleanup.md',
    blog: '/blog/confluence-attachment-cleanup-storage',
  },
  {
    slug: 'confluence-page-restriction-governance',
    name: 'Page-Restriction Governance',
    product: 'Confluence',
    title: 'See every restricted page in Confluence Cloud and who can reach it',
    tagline: 'Every restricted page, who holds read and update on it, orphaned restrictions, and what changed.',
    description: 'Page restrictions are set one page at a time with no site-wide view. Page-Restriction Governance inventories every restricted page, the users and groups on it, and flags restrictions naming deactivated accounts.',
    problem: 'Restrictions are set page by page, by anyone, with no site-wide view of who can see what. Restrictions keep naming accounts deactivated a year ago, and nobody can list which pages are locked down or why.',
    features: [
      'Inventories every restricted page site-wide, daily and on demand.',
      'Lists the exact users and groups holding read and update on each page.',
      'Flags orphan restrictions naming deactivated accounts.',
      'Notes restricted pages inheriting from a read-restricted ancestor.',
      'Tracks drift vs the previous run: pages and subjects added or removed.',
      'One-click, audit-ready CSV export of the full inventory.',
    ],
    captions: [
      'The inventory: every restricted page with its holders.',
      'Orphan flags: restrictions still naming deactivated accounts.',
      'The daily sweep tracks what changed since the previous run.',
    ],
    honest: [
      'The inventory covers explicit page restrictions and notes ancestor inheritance. Space-level permissions are a different surface and are not re-derived per page.',
      'Drift history starts at install.',
    ],
    scopes: [
      { scope: 'read:space:confluence / read:page:confluence', why: 'enumerating spaces, pages, and their restrictions' },
      { scope: 'storage:app', why: 'the chunked inventory and sweep state, in your tenant' },
    ],
    writes: 'An optional, previewed removal can strip orphaned restrictions that name deactivated accounts, after explicit confirmation.',
    youtube: 'Ryf6RbaPg2c',
    listing: 'https://marketplace.atlassian.com/apps/511936964/page-restriction-governance',
    docs: docsBase + 'page-restriction-governance.md',
  },
];

export const bySlug = Object.fromEntries(atlassianApps.map((a) => [a.slug, a]));
