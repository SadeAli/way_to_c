# Deploying The C Path (zero-build)

The site is plain static files — any static host works. GitHub Pages is the
fastest free path:

## 1. Create the repo & push (one time)

Create a **public** repo at github.com/new (suggested name: `the-c-path`), then:

```sh
git remote add origin https://github.com/<YOUR-USER>/the-c-path.git
git checkout main
git merge growth-round-2        # bring in the current work branch
git push -u origin main
```

## 2. Enable Pages

GitHub → repo → **Settings → Pages** → Source: *Deploy from a branch* →
Branch: `main`, folder `/ (root)` → Save. The site appears at
`https://<YOUR-USER>.github.io/the-c-path/` within a minute or two.

## 3. Point the SEO machinery at the live URL

```sh
node gen_static.js https://<YOUR-USER>.github.io/the-c-path
git add -A && git commit -m "Generate sitemap for live URL" && git push
```

Then submit `sitemap.xml` in [Google Search Console](https://search.google.com/search-console)
(verify the site with the HTML-tag method — paste the tag into `index.html`).

## Custom domain (recommended before the Show HN launch)

A ~$10/yr domain (e.g. from Cloudflare Registrar or Porkbun) matters for two
reasons: `robots.txt` only works at a domain root (it's ignored under
`github.io/<repo>/`), and a memorable domain is what people type and share.
Point it in repo Settings → Pages → Custom domain, then re-run step 3 with the
real domain.

## Notes

- Every path in the site is relative — it works at any root or subpath, and
  still works from `file://`.
- Nothing needs a build step. Deploy = push.
- The compile API (godbolt.org) is called from the visitor's browser; no keys,
  no server config.
