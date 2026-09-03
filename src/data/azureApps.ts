// One record per live Azure Marketplace app. Shared by the homepage directory
// and the /azure hub page. Listing URL = azureBase + slug.

export const azureBase = 'https://marketplace.microsoft.com/en-us/product/azure-application/katabarwalabs.';

export interface AzureApp {
  name: string;
  blurb: string;
  slug: string;
  group: string;
}

export const azureGroups: [string, string][] = [
  ['Secrets & certificates', 'Alert before secrets and certificates expire and break production.'],
  ['Cost control', 'Hard caps, anomaly alerts, and orphaned-resource cleanup for the Azure bill.'],
  ['Access & identity', 'Role hygiene, just-in-time elevation, and identity lifecycle automation.'],
  ['Governance & hygiene', 'Policy exemptions, storage security, and resource attribution.'],
  ['Coverage & risk', 'Find the resources with no backup, no alerts, or a takeover-able DNS record.'],
];

export const azureApps: AzureApp[] = [
  { name: 'Secret Sentinel', blurb: 'App registration secret and certificate expiry alerts', slug: 'secret-sentinel', group: 'Secrets & certificates' },
  { name: 'Cert Sentinel', blurb: 'App Gateway and App Service TLS certificate expiry alerts', slug: 'cert-sentinel', group: 'Secrets & certificates' },
  { name: 'Key Vault Expiry Digest', blurb: 'One digest so nothing in your vaults expires silently', slug: 'keyvault-digest', group: 'Secrets & certificates' },
  { name: 'Cost Breaker', blurb: 'A fuse box for your Azure bill', slug: 'cost-breaker', group: 'Cost control' },
  { name: 'Cost Spike Sentinel', blurb: 'Per-team cost anomaly alerts', slug: 'cost-spike-sentinel', group: 'Cost control' },
  { name: 'Orphan Cleanup', blurb: 'Stop paying for resources attached to nothing', slug: 'orphan-cleanup', group: 'Cost control' },
  { name: 'JIT RBAC', blurb: 'Just-in-time role elevation with Teams approval', slug: 'jit-rbac', group: 'Access & identity' },
  { name: 'RBAC Janitor', blurb: 'Clean up orphaned "Identity not found" role assignments', slug: 'rbac-janitor', group: 'Access & identity' },
  { name: 'Role Definition Guard', blurb: 'Detect dangerous custom role definitions', slug: 'role-definition-guard', group: 'Access & identity' },
  { name: 'Identity Lifecycle', blurb: 'Entra joiner and leaver automations at a flat fee', slug: 'identity-lifecycle', group: 'Access & identity' },
  { name: 'Policy Exemption Tracker', blurb: 'No policy exemption lapses or lingers unnoticed', slug: 'policy-exemptions', group: 'Governance & hygiene' },
  { name: 'Storage Hygiene Scorecard', blurb: 'Grade every storage account on access security', slug: 'storage-hygiene', group: 'Governance & hygiene' },
  { name: 'Auto Tagger', blurb: 'CreatedBy and CreatedOn tags for every resource', slug: 'auto-tagger', group: 'Governance & hygiene' },
  { name: 'Dangling DNS Sentinel', blurb: 'Subdomain-takeover monitoring for your DNS zones', slug: 'dangling-dns', group: 'Coverage & risk' },
  { name: 'Backup Auditor', blurb: 'Prove every VM, database, and share is backed up', slug: 'backup-auditor', group: 'Coverage & risk' },
  { name: 'Alert Blindspot', blurb: 'Find the resources you have zero alerts on', slug: 'alert-blindspot', group: 'Coverage & risk' },
];
