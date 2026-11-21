# CSLL public assets

Photos and documents intentionally published for Central Springfield Little League communications. Originals stay outside this repository. Published filenames include a content hash; keep old files so sent emails continue to work.

## Current Cloudflare Workers setup

The application is `csll-assets`, serving `https://assets.csll.org`. The repository is connected through Workers Builds, whose fields differ from Pages:

| Setting | Value |
| --- | --- |
| Repository | `CentralSpringfieldLL/Public_Assets` |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `node scripts/validate.mjs` |
| Deploy command | `npx wrangler deploy --name csll-assets --assets ./public` |

The assets argument identifies the folder to publish; Workers has no separate Pages-style output-directory field. `wrangler.jsonc` also supplies the application name, asset directory, and required compatibility date. The date is pinned to `2026-11-19`, as recommended by the build runtime; do not replace it with an unsupported future date. Keep the existing custom domain attached to this application. Cloudflare manages the native build authentication; no deployment secret is stored in GitHub Actions.

On November 21, all three newsletter photos passed anonymous downloads, image decoding, and exact SHA-256 checks through Cloudflare. Automatic deployment was verified for commit `26e46bf`: the Cloudflare Workers build succeeded and the newly pushed `deployment-check.txt` was served at the canonical hostname with exact matching contents. Root and JSON manifest requests still received managed browser challenges, so their anonymous access is not claimed.

Reference: [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [Wrangler deployment options](https://developers.cloudflare.com/workers/wrangler/commands/workers/#deploy).

## Alternative Cloudflare Pages setup

These instructions describe the original Pages proposal. The current application uses Workers Builds as described above. Do not create a second application or move the hostname just to match the original proposal.

1. In Cloudflare, choose the CSLL account, then Workers & Pages, Create application, Pages, Import an existing Git repository.
2. Select `CentralSpringfieldLL/Public_Assets`. If needed, install and authorize the Cloudflare Workers & Pages GitHub app for this repository only.
3. Set production branch to `main`, framework preset to None, build command to `node scripts/validate.mjs`, and output directory to `public`.
4. Deploy and record the actual project URL. Optionally add `assets.csll.org` in the project's Custom domains screen, then follow the DNS instructions there. Do not change the main CSLL website's DNS record.
5. Verify the actual canonical URL using `node scripts/verify-public.mjs https://ACTUAL-HOST`. Then set `canonicalBaseUrl`, `cloudflareProject`, and `setupComplete` in `hosting.json`, and record canonical URLs in the manifest for subsequent uploads. Do not assume a proposed hostname is live.

No Pages Functions, R2 bucket, paid image service, or API-token deployment action is needed. The validation action checks files; Cloudflare handles deployment. A green validation job alone does not mean Cloudflare is connected or deployed.

Cloudflare's Free plan currently allows 500 builds per month, 20,000 files per site, and 25 MiB per file. Newsletter image copies here remain below 1,000,000 bytes. Static Pages requests and bandwidth are included. These limits were checked on November 20, 2026 and should be rechecked when changing the hosting design.

The manifest records the verified Cloudflare URLs and retains the original public GitHub raw URLs separately for historical reference. Current newsletter exports use Cloudflare photo URLs.

## Add files

```text
node scripts/add-assets.mjs --group newsletters/YYYY-MM-DD --file PATH [--file PATH]
node scripts/validate.mjs
```

Review the new assets and manifest, commit only intended files, and push. After the Cloudflare deployment for that commit succeeds, run `node scripts/verify-public.mjs https://assets.csll.org --assets-only`. This explicitly checks every asset's exact byte hash and image MIME type without claiming remote-manifest access. The strict mode without that option additionally checks the production JSON manifest and currently fails at its browser challenge. Preserve that failure distinction. To verify historical GitHub raw hosting, use `node scripts/verify-public.mjs --github`.

The registry is `public/assets-manifest.json`. Do not add access tokens, private records, source originals with location metadata, or expiring/signed download links.

## References

- [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Static HTML deployment settings](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [Pages Free-plan limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
