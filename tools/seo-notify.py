#!/usr/bin/env python3
"""Post-deploy search-engine notifications for katabarwalabs.dev.

Run by .github/workflows/deploy.yml after the CloudFront invalidation.

1. IndexNow (Bing, Yandex, DuckDuckGo, Naver, Seznam): submits the URLs whose
   source changed in this push. A workflow_dispatch run, or a change to shared
   code (layouts, data, lib, config), submits every URL in the live sitemap.
   Key: the public/<key>.txt file committed in the repo. No secret needed.

2. Google Search Console (optional, needs GSC_ACCESS_TOKEN from the keyless
   google-github-actions/auth step: GitHub OIDC -> GCP workload identity pool
   -> service account gsc-ci, a user on the property): resubmits the sitemap,
   then runs URL Inspection on the changed URLs and writes their index state
   to the GitHub step summary. Google has no supported "index this
   page" call for ordinary pages (the Indexing API is job postings and live
   streams only) and the sitemap ping endpoint was retired in 2023, so this is
   the whole of what can be automated on the Google side.

Environment:
  SITE               https://katabarwalabs.dev
  BEFORE_SHA/AFTER_SHA   commit range of the push ("" on workflow_dispatch)
  EVENT_NAME         push | workflow_dispatch
  GSC_ACCESS_TOKEN   OAuth access token with the webmasters scope, optional
  GSC_SITE           Search Console property, default sc-domain:katabarwalabs.dev
  GITHUB_STEP_SUMMARY  written to when present
"""
import glob
import json
import os
import re
import subprocess
import sys
import urllib.request
import xml.etree.ElementTree as ET

SITE = os.environ.get("SITE", "https://katabarwalabs.dev").rstrip("/")
HOST = SITE.split("//", 1)[1]
GSC_SITE = os.environ.get("GSC_SITE", "sc-domain:" + HOST)
SUMMARY = os.environ.get("GITHUB_STEP_SUMMARY")


def log(msg):
    print(msg, flush=True)
    if SUMMARY:
        with open(SUMMARY, "a") as f:
            f.write(msg + "\n\n")


def sitemap_urls():
    with urllib.request.urlopen(SITE + "/sitemap.xml", timeout=30) as r:
        root = ET.fromstring(r.read())
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return [e.text.strip() for e in root.findall(".//s:loc", ns)]


def route_for(path):
    """src/pages/atlassian/foo.astro -> /atlassian/foo ; index.astro -> parent."""
    m = re.match(r"src/pages/(.*)\.(astro|md|mdx)$", path)
    if not m:
        return None
    r = m.group(1)
    if r.endswith("/index"):
        r = r[: -len("/index")]
    if r == "index":
        r = ""
    if "[" in r or r.startswith("_"):
        return None
    return SITE + "/" + r if r else SITE + "/"


def changed_urls():
    event = os.environ.get("EVENT_NAME", "push")
    before, after = os.environ.get("BEFORE_SHA", ""), os.environ.get("AFTER_SHA", "")
    if event != "push" or not before or set(before) == {"0"} or not after:
        return None  # None = everything
    files = subprocess.run(
        ["git", "diff", "--name-only", before, after], capture_output=True, text=True, check=True
    ).stdout.split()
    if any(f.startswith(("src/layouts/", "src/data/", "src/lib/", "src/components/", "src/styles/"))
           or f in ("astro.config.mjs", "package.json", "package-lock.json") for f in files):
        return None
    urls = {u for u in (route_for(f) for f in files) if u}
    return sorted(urls)


def indexnow(urls):
    keys = glob.glob("public/*.txt")
    keys = [k for k in keys if re.fullmatch(r"public/[0-9a-f]{32}\.txt", k)]
    if not keys:
        log("IndexNow: no key file in public/, skipped")
        return
    key = os.path.basename(keys[0])[:-4]
    body = json.dumps({"host": HOST, "key": key, "keyLocation": f"{SITE}/{key}.txt", "urlList": urls}).encode()
    req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body,
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            log(f"IndexNow: HTTP {r.status} for {len(urls)} URL(s)")
    except urllib.error.HTTPError as e:
        log(f"IndexNow: HTTP {e.code} {e.read().decode()[:200]}")


def gsc_call(token, method, url, data=None):
    req = urllib.request.Request(url, method=method, data=json.dumps(data).encode() if data else None,
                                 headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode()[:300]}


def search_console(urls, everything):
    token = os.environ.get("GSC_ACCESS_TOKEN")
    if not token:
        log("Search Console: no GSC_ACCESS_TOKEN (workload identity step failed or skipped)")
        return
    from urllib.parse import quote
    status, _ = gsc_call(token, "PUT",
                         f"https://www.googleapis.com/webmasters/v3/sites/{quote(GSC_SITE, safe='')}/sitemaps/{quote(SITE + '/sitemap.xml', safe='')}")
    log(f"Search Console: sitemap resubmitted (HTTP {status})")
    # URL Inspection: only the changed pages (quota 2,000/day); on a full run inspect the hubs.
    inspect = urls if not everything else [SITE + "/", SITE + "/atlassian", SITE + "/azure", SITE + "/blog"]
    rows = []
    for u in inspect[:50]:
        status, body = gsc_call(token, "POST", "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
                                {"inspectionUrl": u, "siteUrl": GSC_SITE})
        idx = body.get("inspectionResult", {}).get("indexStatusResult", {})
        rows.append(f"| {u} | {idx.get('verdict', body.get('error', status))} | {idx.get('coverageState', '')} | {idx.get('lastCrawlTime', '')[:10]} |")
    if rows:
        log("Search Console URL inspection:\n\n| URL | verdict | coverage | last crawl |\n|---|---|---|---|\n" + "\n".join(rows))


def main():
    urls = changed_urls()
    everything = urls is None
    if everything:
        urls = sitemap_urls()
        log(f"Submitting every sitemap URL ({len(urls)}): dispatch run or shared-code change")
    elif not urls:
        log("No page URLs changed in this push; nothing to notify")
        return
    else:
        log("Changed URLs:\n" + "\n".join("- " + u for u in urls))
    indexnow(urls)
    search_console(urls, everything)


if __name__ == "__main__":
    sys.exit(main())
