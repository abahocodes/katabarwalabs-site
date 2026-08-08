# Deploying katabarwalabs.dev on AWS

100% AWS: Route 53 (domain + DNS) → ACM (TLS) → S3 (private origin) → CloudFront (CDN).
Account: `520829456724` (default profile). Region for ACM + the stack: **us-east-1**.

## 1. Register the domain (one-time)

Registering the domain also creates the Route 53 hosted zone. Contact details are required by
ICANN. Run once (`contact.json` holds the registrant/admin/tech contact — same for all three):

```bash
aws route53domains register-domain --region us-east-1 \
  --domain-name katabarwalabs.dev \
  --duration-in-years 1 --auto-renew \
  --admin-contact  file://aws/contact.json \
  --registrant-contact file://aws/contact.json \
  --tech-contact   file://aws/contact.json \
  --privacy-protect-admin-contact --privacy-protect-registrant-contact --privacy-protect-tech-contact
# → returns an OperationId; poll until SUCCESSFUL:
aws route53domains get-operation-detail --region us-east-1 --operation-id <OperationId>
```

`aws/contact.json` (git-ignored — contains the postal address):

```json
{
  "ContactType": "COMPANY",
  "OrganizationName": "Katabarwa Labs Inc",
  "FirstName": "Abaho", "LastName": "Katabarwa",
  "Email": "abahomyster@gmail.com",
  "PhoneNumber": "+1.6502857980",
  "AddressLine1": "<street>", "City": "<city>",
  "State": "<ST>", "CountryCode": "US", "ZipCode": "<zip>"
}
```

## 2. Deploy hosting + content

Once the domain shows registered:

```bash
AWS_PROFILE=default ./aws/deploy.sh
```

This finds the hosted zone, requests + DNS-validates the ACM cert (us-east-1), builds the site at
root (`SITE_BASE=/`), deploys `aws/cloudfront-site.yaml` (S3 + CloudFront/OAC + Route 53 alias
records + a URL-rewrite function for Astro's `/privacy` `/support` routes), syncs `dist/` to the
bucket, and invalidates the CDN. Result: **https://katabarwalabs.dev/**.

## 3. Flip the listing URLs

After the domain resolves, repoint the marketplace profiles/LISTINGs from the interim Pages URL to
`https://katabarwalabs.dev/`, `/privacy`, `/support`, and retire the GitHub Pages workflow.
