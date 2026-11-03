# 🚀 Tasty Nest - Production Server Deployment Guide

This guide explains how to upload and deploy the **Tasty Nest** website to any web hosting server (cPanel, Hostinger, Namecheap, Netlify, Vercel, Firebase, etc.).

---

## 📦 What Files to Upload?

All production-ready files have already been packaged into a single ready-to-upload ZIP file:
📁 **`tasty-nest-production.zip`** (located in your project root folder)

### Included in the package (100% Flat Structure — No Subfolders Required):
* `index.html` — The main website application & Executive Admin CMS
* `style.css` — Luxury Editorial Culinary Styling tokens & micro-animations
* `app.js`, `db.js`, `firebase-config.js`, `image-compressor.js` — Core application logic
* `404.html` — Custom branded editorial 404 error page
* `.htaccess` — Production web server configuration (Gzip compression, browser caching, HTTPS, security headers)
* `robots.txt` & `sitemap.xml` — Search engine crawler directives & SEO sitemap
* `_headers` — Netlify / Cloudflare Pages security & caching headers
* `Code.gs` — Google Apps Script for Google Drive media uploads
* All 22 logos, favicons, touch icons, and food photography (all located directly in root)

*(Note: Internal docs like `README.md` and `testynestinstructions.md` are excluded from the zip so your server stays clean and lightweight).*

---

## 🌐 Option 1: Uploading to cPanel / Shared Hosting (Hostinger, Namecheap, GoDaddy, etc.)

1. Log into your **cPanel** (or Hostinger hPanel).
2. Open **File Manager**.
3. Navigate into the **`public_html`** directory (or your domain's root folder).
4. Click **Upload** in the top toolbar.
5. Select and upload **`tasty-nest-production.zip`**.
6. Once uploaded (100% green bar), return to File Manager.
7. Right-click on `tasty-nest-production.zip` and select **Extract** (Extract to `/public_html`).
8. *(Optional)* Delete `tasty-nest-production.zip` after extraction to save disk space.
9. Visit your website domain in your browser! 🎉

---

## ⚡ Option 2: 100% Free Instant Hosting with Netlify (Easiest)

1. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)** (Sign up / log in for free).
2. Drag and drop the **`tasty-nest-production.zip`** or your project folder onto the page.
3. Netlify will deploy it in under **10 seconds** with free automatic HTTPS/SSL and a live link!
4. You can connect your custom domain anytime under Site settings -> Domain management.

---

## 🔥 Option 3: Firebase Hosting

If you already use Firebase for the app:
1. Open terminal in the project directory:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   ```
2. When asked for your public directory, type `.` (current directory).
3. Run:
   ```bash
   firebase deploy --only hosting
   ```

---

## 🛡️ Pre-Configured Server Optimizations:

1. **Gzip Compression:** Enabled in `.htaccess` — reduces page transfer size by up to 75%.
2. **Browser Caching:** Images & fonts cached for 1 month/1 year for instantaneous repeat visits.
3. **Security Headers:** Protected against clickjacking (`X-Frame-Options`) and MIME sniffing.
4. **Offline Capability:** Dexie IndexedDB saves recipes and images locally for instant loading even on slow connections.

