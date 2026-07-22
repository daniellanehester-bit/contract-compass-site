# Deploying Contract Compass site (GitHub Pages + Cloudflare)

Four placeholders to fill in before you deploy — search `index.html` for these:

1. `REPLACE_WITH_STRIPE_PAYMENT_LINK` (two spots) — your $399/mo Stripe Payment Link.
2. `REPLACE_WITH_EMAIL` (two spots, inside `mailto:` links) — the inbox multi-state quote requests should land in.
3. `REPLACE_WITH_LINKEDIN_URL` and `REPLACE_WITH_INSTAGRAM_URL` — your actual page URLs.

## 1. Create the Stripe Payment Link (5 minutes)

1. In Stripe Dashboard: **Product catalog → Add product**. Name: "Contract Compass Subscription". Price: $399/month, recurring.
2. Once the price exists: **Payment links → Create payment link**, select that price.
3. Configure the link: after payment, set a redirect URL if you have a "you're in" / onboarding page ready — otherwise Stripe's default confirmation page is fine for launch.
4. Copy the link (looks like `https://buy.stripe.com/xxxxxxx`) and paste it into `index.html` in both spots marked `REPLACE_WITH_STRIPE_PAYMENT_LINK`.

## 2. Push to GitHub

```bash
cd contract-compass-site
git init
git add .
git commit -m "Launch site"
git branch -M main
git remote add origin https://github.com/<your-username>/contract-compass-site.git
git push -u origin main
```

(Create the empty repo on GitHub first if it doesn't exist yet — github.com → New repository → don't initialize with a README, since this folder already has one.)

## 3. Turn on GitHub Pages

1. In the repo: **Settings → Pages**.
2. Source: **Deploy from a branch**. Branch: **main**, folder: **/ (root)**.
3. Save. GitHub gives you a temporary URL like `https://<your-username>.github.io/contract-compass-site/` — good for checking the site works before DNS is live.

## 4. Point contractcompass.org (Cloudflare) at GitHub Pages

1. In Cloudflare DNS for `contractcompass.org`:
   - Add a **CNAME** record: `www` → `<your-username>.github.io` (Proxy status: DNS only / grey cloud, not orange — GitHub Pages needs to see the real request to issue its SSL cert).
   - Add four **A** records for the root domain (`@`) pointing to GitHub Pages' IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Same grey-cloud/DNS-only setting.
2. Back in the GitHub repo **Settings → Pages → Custom domain**, enter `contractcompass.org` and save. This creates a `CNAME` file in your repo root automatically — don't remove it.
3. Wait for the "DNS check successful" green checkmark (can take a few minutes to a few hours), then enable **Enforce HTTPS**.
4. Once HTTPS is confirmed working, you can switch the Cloudflare records to orange-cloud (proxied) if you want Cloudflare's CDN/caching — not required for launch.

## 5. Sanity check before sharing the link

- Load `https://contractcompass.org/` and click the Subscribe button — confirm it lands on the real Stripe checkout with $399/mo showing.
- Click the "Email us for a custom quote" links — confirm they open a compose window addressed correctly.
- Check the blog pages load from the nav and that LinkedIn/Instagram icons go to real pages (or remove them if not ready).

That's it — site, blog, animations, and the $399 Stripe checkout are live on your own domain.
