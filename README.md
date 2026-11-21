# CSLL public assets

Photos and documents intentionally published for Central Springfield Little League communications. Originals stay outside this repository. Published filenames include a content hash; keep old files so sent emails continue to work.

## Cloudflare Pages setup

Connect this repository once from the CSLL Cloudflare account owned by webmaster@csll.org. The intended integration is Cloudflare Pages' native Git integration, which deploys repository pushes without a Cloudflare API key in GitHub Actions.

1. In Cloudflare, choose the CSLL account, then Workers & Pages, Create application, Pages, Import an existing Git repository.
2. Select `CentralSpringfieldLL/Public_Assets`. If needed, install and authorize the Cloudflare Workers & Pages GitHub app for this repository only.
3. Set production branch to `main`, framework preset to None, build command to `node scripts/validate.mjs`, and output directory to `public`.
4. Deploy and record the actual project URL. Optionally add `assets.csll.org` in the project's Custom domains screen, then follow the DNS instructions there. Do not change the main CSLL website's DNS record.
5. Verify the actual canonical URL using `node scripts/verify-public.mjs https://ACTUAL-HOST`. Then set `canonicalBaseUrl`, `cloudflareProject`, and `setupComplete` in `hosting.json`, and record canonical URLs in the manifest for subsequent uploads. Do not assume a proposed hostname is live.

No Pages Functions, R2 bucket, paid image service, or API-token deployment action is needed. The validation action checks files; Cloudflare handles deployment. A green validation job alone does not mean Cloudflare is connected or deployed.

Cloudflare's Free plan currently allows 500 builds per month, 20,000 files per site, and 25 MiB per file. Newsletter image copies here remain below 1,000,000 bytes. Static Pages requests and bandwidth are included. These limits were checked on November 20, 2026 and should be rechecked when changing the hosting design.

Until Cloudflare is connected, the manifest records public GitHub raw URLs separately, with `cloudflareUrl: null`. These are a temporary working source for newsletters, not evidence of a Cloudflare deployment.

## Add files

```text
node scripts/add-assets.mjs --group newsletters/YYYY-MM-DD --file PATH [--file PATH]
node scripts/validate.mjs
```

Review the new assets and manifest, commit only intended files, and push. After the Cloudflare deployment for that commit succeeds, run the public verifier against the canonical domain. It checks the current manifest and every asset's exact byte hash without authentication. To verify temporary GitHub raw hosting, use `node scripts/verify-public.mjs --github`.

The registry is `public/assets-manifest.json`. Do not add access tokens, private records, source originals with location metadata, or expiring/signed download links.

## References

- [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Static HTML deployment settings](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [Pages Free-plan limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
