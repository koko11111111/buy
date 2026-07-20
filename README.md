# Buy

A bilingual (English/Arabic) product ordering site: browse products, "stamp"
an order with phone numbers + location + notes, and manage everything from
an admin ledger. Plain HTML/CSS/JS — no build step, no framework, no
npm install. Open `index.html` and it runs.

## Files
- `index.html` — page shell
- `styles.css` — all styling
- `app.js` — all logic (products, orders, accounts, admin panel)

## Try it locally
Just double-click `index.html`, or in this folder run:
```
python3 -m http.server 8000
```
then open `http://localhost:8000`.

## Put it on GitHub Pages (free, works with a .com domain)
1. Create a new GitHub repository and push these three files to it (root of the repo, or a `docs/` folder — your choice).
2. In the repo: **Settings → Pages → Source**, pick the branch/folder these files are in, save.
3. GitHub gives you a URL like `https://yourname.github.io/reponame` within a minute or two — that's your live site.
4. To use your own `.com`: buy the domain from any registrar (Namecheap, GoDaddy, etc.), then in **Settings → Pages → Custom domain** enter it, and add the DNS records GitHub shows you at your registrar. GitHub's own docs walk through this: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

Netlify or Vercel work the same way and are just as free — drag the folder into their dashboard, or connect the GitHub repo, and they'll host it and let you attach the domain.

## Admin access
Log in (or sign up first) with one of the emails in `app.js` at the top:
```js
const ADMIN_EMAILS = ['kokomina946@gmail.com', 'patrick.kimo2010@gmail.com'];
```
Once logged in with one of those, an **Admin ledger** option appears in the account menu (click your name, top right). Add a third email to that array whenever you're ready.

## Adding products
Admin ledger → Products tab → fill in the English/Arabic name, description,
price, and (optional) an **Image URL** and **Video URL**. Since this is a
plain static site, it can't accept uploaded files directly — host the photo
or video somewhere first (e.g. imgur.com, a public Google Drive link, or
YouTube) and paste that link in.

## Important: where the data lives right now
Everything (products, orders, accounts) is saved in the browser's own
storage on whichever device it's opened on. That means:
- It works immediately, for free, with zero setup.
- But it's **not shared** — an order placed by a customer on their phone
  won't show up in the admin ledger if you're checking from your laptop,
  because each browser/device has its own separate copy.

For a real launch where all three of you need to see every order from any
device, you'll want a small shared backend. The easiest free option is
**Firebase** (Google's platform — free tier, no server to manage):
1. Create a project at https://console.firebase.google.com
2. Turn on **Authentication** (Email/Password) and **Firestore Database**
3. Copy your project's config object (safe to put in frontend code — these
   keys are public by design)
4. Send it to me, or swap the `DB` object in `app.js` yourself — it's a
   deliberately small, self-contained set of functions
   (`getProducts/setProducts`, `getOrders/setOrders`, etc.) so this is a
   contained change, not a rewrite.

Everything else in the app — the UI, the bilingual text, the ticket
styling — stays exactly the same either way.
