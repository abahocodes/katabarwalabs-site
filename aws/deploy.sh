#!/usr/bin/env bash
# Deploy the Katabarwa Labs site to AWS (S3 + CloudFront + Route 53).
# Idempotent: safe to re-run. Assumes the domain is already registered in
# Route 53 (which creates the hosted zone). Run from the repo root.
#
#   AWS_PROFILE=default ./aws/deploy.sh
#
set -euo pipefail

PROFILE="${AWS_PROFILE:-default}"
DOMAIN="${DOMAIN:-katabarwalabs.dev}"
STACK="${STACK:-katabarwalabs-site}"
REGION="us-east-1"                 # ACM for CloudFront + the stack live in us-east-1
AWS=(aws --profile "$PROFILE" --region "$REGION")

echo "▶ Hosted zone for $DOMAIN"
HZID=$("${AWS[@]}" route53 list-hosted-zones-by-name --dns-name "$DOMAIN" \
        --query "HostedZones[?Name=='${DOMAIN}.'].Id | [0]" --output text | cut -d/ -f3)
[ -n "$HZID" ] && [ "$HZID" != "None" ] || { echo "No hosted zone for $DOMAIN — register the domain first."; exit 1; }
echo "  $HZID"

echo "▶ ACM certificate (us-east-1) for $DOMAIN + www"
ARN=$("${AWS[@]}" acm list-certificates --query \
      "CertificateSummaryList[?DomainName=='${DOMAIN}'].CertificateArn | [0]" --output text)
if [ -z "$ARN" ] || [ "$ARN" = "None" ]; then
  ARN=$("${AWS[@]}" acm request-certificate --domain-name "$DOMAIN" \
        --subject-alternative-names "www.${DOMAIN}" --validation-method DNS \
        --query CertificateArn --output text)
  echo "  requested $ARN — creating DNS validation records"
  sleep 8
  "${AWS[@]}" acm describe-certificate --certificate-arn "$ARN" \
    --query 'Certificate.DomainValidationOptions[].ResourceRecord' --output json \
   | python3 -c '
import json,sys,subprocess,os
recs={r["Name"]:r for r in json.load(sys.stdin)}.values()
changes=[{"Action":"UPSERT","ResourceRecordSet":{"Name":r["Name"],"Type":r["Type"],"TTL":300,"ResourceRecords":[{"Value":r["Value"]}]}} for r in recs]
batch=json.dumps({"Changes":changes})
subprocess.run(["aws","--profile",os.environ["PROFILE"],"route53","change-resource-record-sets","--hosted-zone-id",os.environ["HZID"],"--change-batch",batch],check=True)
' 2>/dev/null || PROFILE="$PROFILE" HZID="$HZID" python3 - "$ARN" <<PY
import json,subprocess,sys,os
arn=sys.argv[1]
out=subprocess.check_output(["aws","--profile",os.environ["PROFILE"],"--region","us-east-1","acm","describe-certificate","--certificate-arn",arn,"--query","Certificate.DomainValidationOptions[].ResourceRecord","--output","json"])
recs=list({r["Name"]:r for r in json.loads(out)}.values())
changes=[{"Action":"UPSERT","ResourceRecordSet":{"Name":r["Name"],"Type":r["Type"],"TTL":300,"ResourceRecords":[{"Value":r["Value"]}]}} for r in recs]
subprocess.run(["aws","--profile",os.environ["PROFILE"],"route53","change-resource-record-sets","--hosted-zone-id",os.environ["HZID"],"--change-batch",json.dumps({"Changes":changes})],check=True)
PY
  echo "  waiting for certificate to validate (a few minutes)…"
  "${AWS[@]}" acm wait certificate-validated --certificate-arn "$ARN"
fi
echo "  $ARN"

echo "▶ Building site (root base) → dist/"
SITE_BASE=/ npm run build

echo "▶ Deploying CloudFormation stack $STACK"
"${AWS[@]}" cloudformation deploy --stack-name "$STACK" \
  --template-file aws/cloudfront-site.yaml \
  --parameter-overrides DomainName="$DOMAIN" HostedZoneId="$HZID" CertificateArn="$ARN" \
  --no-fail-on-empty-changeset

BUCKET=$("${AWS[@]}" cloudformation describe-stacks --stack-name "$STACK" \
         --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue | [0]" --output text)
DIST=$("${AWS[@]}" cloudformation describe-stacks --stack-name "$STACK" \
       --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue | [0]" --output text)

echo "▶ Sync dist/ → s3://$BUCKET"
"${AWS[@]}" s3 sync dist/ "s3://$BUCKET/" --delete

echo "▶ Invalidating CloudFront $DIST"
"${AWS[@]}" cloudfront create-invalidation --distribution-id "$DIST" --paths '/*' >/dev/null

echo "✓ Done — https://$DOMAIN/"
