# Buy

A bilingual (English/Arabic) product ordering site: browse products, "stamp"
an order with phone numbers + location + notes, and manage everything from
an admin ledger. Plain HTML/CSS/JS, backed by Firebase (Authentication +
Firestore) so every device sees the same data.

## Files
- `index.html` — page shell
- `styles.css` — all styling
- `app.js` — all app logic (products, orders, buy flow, admin panel)
- `firebase-config.js` — your Firebase project connection (the only file with your keys in it)

## Try it locally
Because this now uses Firebase via JavaScript modules, browsers won't run
it from a double-clicked file — it needs to be served over `http://` or
`https://`. From this folder, run:
```
python3 -m http.server 8000
```
then open `http://localhost:8000`. (Any local server works — this is just
the one every OS already has built in via Python.)

## Deploy it for real (GitHub Pages)
1. Push these four files to a GitHub repository.
2. Repo **Settings → Pages → Source** → pick the branch/folder → save.
3. You'll get a live URL in a minute or two.
4. To use your `.com`: buy it from any registrar, then **Settings → Pages
   → Custom domain**, enter it, and add the DNS records GitHub shows you.
   Full walkthrough: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

Netlify and Vercel work the same way if you'd rather use those.

## Secure your Firestore database — do this before real customers use it
Your project's Firestore rules were probably left in "test mode," which
either allows anyone to read/write everything, or (if it's an older
project) has already expired and blocks everything. Either way, replace
them with real rules:

1. Firebase console → your project → **Build → Firestore Database → Rules**
2. Replace everything there with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null &&
        request.auth.token.email in ['kokomina946@gmail.com', 'patrick.kimo2010@gmail.com', 'yassaking687@gmail.com'];
    }

    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /orders/{orderId} {
      allow create: if request.resource.data.phone1 is string &&
        request.resource.data.phone1.size() > 0 &&
        request.resource.data.location is string &&
        request.resource.data.location.size() > 0 &&
        request.resource.data.status == 'pending';
      allow read: if isAdmin() ||
        (request.auth != null && request.auth.token.email == resource.data.buyerEmail);
      allow update: if isAdmin() ||
        (request.auth != null &&
         request.auth.token.email == resource.data.buyerEmail &&
         resource.data.status == 'pending' &&
         request.resource.data.status == 'cancelled' &&
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']));
      allow delete: if isAdmin();
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if isAdmin();
    }
  }
}
```
3. Click **Publish**.

What this does: anyone can browse products and place an order (no login
needed to buy, matching how the site works); only your two admin emails
can add/remove products or see every order; a logged-in customer can only
ever read their own past orders, never anyone else's.

One thing you might see the first time a logged-in customer opens **My
orders** after these rules are live: Firestore may show a one-time console
message about needing an index for that lookup, with a link to create it
automatically. Just click the link, wait about a minute, done — this only
happens once per project.

Also update the email list in **two places** if it ever changes — the
`isAdmin()` function above, and `ADMIN_EMAILS` near the top of `app.js` —
they need to match.

## Admin access
Log in (or sign up first) with one of the emails in `ADMIN_EMAILS` at the
top of `app.js`. Once logged in with one of those, an **Admin ledger**
option appears in the account menu (click your name, top right).

## Adding products
Admin ledger → Products tab → fill in the English/Arabic name, description,
price, and (optional) an **Image URL** and **Video URL**. Since this is a
static site, it can't accept uploaded files directly — host the photo or
video somewhere first (imgur.com, a public Google Drive link, YouTube,
etc.) and paste that link in.

## If you ever need to see your data directly
Firebase console → your project → **Build → Firestore Database → Data**
tab shows every product, order, and user profile as plain rows — useful
for a quick look without opening the site.

