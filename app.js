/* =====================================================================
   BUY — a bilingual (EN/AR) product ordering site with accounts and an
   admin panel, built with plain HTML/CSS/JS + Firebase.

   DATA: Firebase Authentication (real, secure login) + Firestore
   (shared database — every device/browser sees the same products,
   orders, and accounts). See README.md for the security rules to
   paste into your Firebase console.
   ===================================================================== */

import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile,
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import {
  collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, orderBy,
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

/* ---------------------------------------------------------------------
   CONFIG — edit these two things for your real store.
--------------------------------------------------------------------- */
const ADMIN_EMAILS = ['kokomina946@gmail.com', 'patrick.kimo2010@gmail.com'];

const DEFAULT_PRODUCTS = [
  { id: 'p1', price: 1450, imageUrl: '', videoUrl: '', name: { en: 'Cedar desk lamp', ar: 'مصباح مكتب خشب الأرز' }, desc: { en: 'Warm brass fitting, adjustable arm.', ar: 'تركيب نحاسي دافئ، ذراع قابل للتعديل.' } },
  { id: 'p2', price: 620, imageUrl: '', videoUrl: '', name: { en: 'Pour-over coffee set', ar: 'طقم قهوة مقطرة يدويًا' }, desc: { en: 'Ceramic dripper, glass carafe.', ar: 'مصفاة سيراميك، إبريق زجاجي.' } },
  { id: 'p3', price: 2300, imageUrl: '', videoUrl: '', name: { en: 'Field watch', ar: 'ساعة ميدانية' }, desc: { en: 'Stainless case, canvas strap.', ar: 'هيكل ستانلس، سوار قماشي.' } },
  { id: 'p4', price: 980, imageUrl: '', videoUrl: '', name: { en: 'Canvas day pack', ar: 'حقيبة ظهر قماشية' }, desc: { en: 'Water-resistant, leather trims.', ar: 'مقاومة للماء، حواف جلدية.' } },
  { id: 'p5', price: 1750, imageUrl: '', videoUrl: '', name: { en: 'Studio headphones', ar: 'سماعات استوديو' }, desc: { en: 'Over-ear, foldable frame.', ar: 'محيطة بالأذن، هيكل قابل للطي.' } },
  { id: 'p6', price: 340, imageUrl: '', videoUrl: '', name: { en: 'Leather journal', ar: 'دفتر جلدي' }, desc: { en: '200 pages, dotted grid.', ar: '٢٠٠ صفحة، شبكة منقطة.' } },
];

/* ---------------------------------------------------------------------
   ICONS — small hand-rolled SVGs, no external icon library needed.
--------------------------------------------------------------------- */
const ICON_PATHS = {
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
  play: '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4Z"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/>',
  loader: '<path d="M12 2v4M12 18v4m7.07-15.07-2.83 2.83M7.76 16.24l-2.83 2.83M22 12h-4M6 12H2m15.07 7.07-2.83-2.83M7.76 7.76 4.93 4.93"/>',
  locate: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  package: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
};
function icon(name, size = 16, extraClass = '') {
  const p = ICON_PATHS[name] || '';
  return `<svg class="${extraClass}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
}

/* ---------------------------------------------------------------------
   STRINGS
--------------------------------------------------------------------- */
const STRINGS = {
  en: {
    brand: 'Buy', tagline: 'A stamped ticket for every order — simple and honest.',
    buy: 'Buy', modal_title: 'Fill your ticket',
    phone1: 'Phone number', phone2: 'Second phone (optional)',
    location: 'Delivery location', location_ph: 'Neighborhood, street, landmark…',
    use_location: 'Use my current location', locating: 'Locating…',
    location_denied: "Couldn't get your location. Type it in instead.",
    notes: 'Notes', add_note: 'Add a note', note_ph: 'e.g. Call before arriving',
    submit: 'Stamp my order', submitting: 'Stamping…', cancel: 'Cancel',
    required: 'Phone number and location are required.',
    success_title: 'Order stamped', success_body: 'Ticket number',
    success_sub: "We'll reach out on the number you gave us.", back_to_shop: 'Back to shop',
    admin_title: 'Ledger', admin_tab_orders: 'Orders', admin_tab_products: 'Products',
    admin_empty_title: 'No tickets yet', admin_empty_body: 'New orders will show up here the moment someone stamps one.',
    col_ticket: 'Ticket', col_product: 'Product', col_buyer: 'Buyer', col_phones: 'Phones', col_location: 'Location', col_notes: 'Notes', col_time: 'Time',
    guest_label: 'Guest', loading: 'Loading…',
    product_name_en: 'Name (English)', product_name_ar: 'Name (Arabic)',
    product_desc_en: 'Description (English)', product_desc_ar: 'Description (Arabic)',
    product_price: 'Price (EGP)', image_url_label: 'Image URL', video_url_label: 'Video URL (optional)',
    watch_video: 'Watch video',
    add_product: 'Add product', product_fields_required: 'Fill in both names and a price before adding.',
    no_products: 'No products yet. Add your first one below.',
    remove: 'Remove', yes_remove: 'Yes, remove', keep: 'Keep it', new_product_title: 'Add a product',
    sign_in: 'Sign in', tab_signup: 'Sign up', tab_login: 'Log in',
    name_label: 'Full name', email_label: 'Email', phone_field_optional: 'Phone (optional)', password_label: 'Password',
    create_account_btn: 'Create account', log_in_btn: 'Log in',
    switch_to_login: 'Already have an account? Log in', switch_to_signup: "Don't have an account? Sign up",
    signup_error_exists: 'An account with this email already exists.',
    login_error_missing: "We couldn't find an account with that email.",
    name_email_required: 'Name and email are required.', email_required: 'Email is required.',
    password_required: 'Password must be at least 6 characters.', wrong_password: 'Incorrect password.',
    my_orders_link: 'My orders', admin_ledger_link: 'Admin ledger', log_out_link: 'Log out',
    my_orders_title: 'My orders', my_orders_empty_title: 'No orders yet',
    my_orders_empty_body: 'Orders you place while signed in will show up here.',
  },
  ar: {
    brand: 'اشترِ', tagline: 'تذكرة مختومة لكل طلب — بسيطة وصادقة.',
    buy: 'اشترِ', modal_title: 'املأ تذكرتك',
    phone1: 'رقم الهاتف', phone2: 'رقم هاتف ثانٍ (اختياري)',
    location: 'موقع التوصيل', location_ph: 'الحي، الشارع، أقرب معلم…',
    use_location: 'استخدم موقعي الحالي', locating: 'جارٍ تحديد الموقع…',
    location_denied: 'تعذّر تحديد موقعك. اكتبه يدويًا.',
    notes: 'ملاحظات', add_note: 'إضافة ملاحظة', note_ph: 'مثال: اتصل قبل الوصول',
    submit: 'اختم طلبي', submitting: 'جارٍ الختم…', cancel: 'إلغاء',
    required: 'رقم الهاتف والموقع مطلوبان.',
    success_title: 'تم ختم الطلب', success_body: 'رقم التذكرة',
    success_sub: 'سنتواصل معك على الرقم الذي أدخلته.', back_to_shop: 'العودة للمتجر',
    admin_title: 'السجل', admin_tab_orders: 'الطلبات', admin_tab_products: 'المنتجات',
    admin_empty_title: 'لا توجد تذاكر بعد', admin_empty_body: 'ستظهر الطلبات الجديدة هنا فور ختمها.',
    col_ticket: 'التذكرة', col_product: 'المنتج', col_buyer: 'المشتري', col_phones: 'الهواتف', col_location: 'الموقع', col_notes: 'ملاحظات', col_time: 'الوقت',
    guest_label: 'زائر', loading: 'جارٍ التحميل…',
    product_name_en: 'الاسم (إنجليزي)', product_name_ar: 'الاسم (عربي)',
    product_desc_en: 'الوصف (إنجليزي)', product_desc_ar: 'الوصف (عربي)',
    product_price: 'السعر (جنيه)', image_url_label: 'رابط الصورة', video_url_label: 'رابط الفيديو (اختياري)',
    watch_video: 'مشاهدة الفيديو',
    add_product: 'إضافة منتج', product_fields_required: 'أدخل الاسمين والسعر قبل الإضافة.',
    no_products: 'لا توجد منتجات بعد. أضف أول منتج بالأسفل.',
    remove: 'إزالة', yes_remove: 'نعم، إزالة', keep: 'الاحتفاظ به', new_product_title: 'إضافة منتج',
    sign_in: 'تسجيل الدخول', tab_signup: 'إنشاء حساب', tab_login: 'تسجيل الدخول',
    name_label: 'الاسم الكامل', email_label: 'البريد الإلكتروني', phone_field_optional: 'رقم الهاتف (اختياري)', password_label: 'كلمة المرور',
    create_account_btn: 'إنشاء الحساب', log_in_btn: 'تسجيل الدخول',
    switch_to_login: 'لديك حساب بالفعل؟ سجّل الدخول', switch_to_signup: 'ليس لديك حساب؟ أنشئ حسابًا',
    signup_error_exists: 'يوجد حساب بهذا البريد الإلكتروني بالفعل.',
    login_error_missing: 'لم نعثر على حساب بهذا البريد الإلكتروني.',
    name_email_required: 'الاسم والبريد الإلكتروني مطلوبان.', email_required: 'البريد الإلكتروني مطلوب.',
    password_required: 'يجب ألا تقل كلمة المرور عن ٦ أحرف.', wrong_password: 'كلمة المرور غير صحيحة.',
    my_orders_link: 'طلباتي', admin_ledger_link: 'سجل الإدارة', log_out_link: 'تسجيل الخروج',
    my_orders_title: 'طلباتي', my_orders_empty_title: 'لا توجد طلبات بعد',
    my_orders_empty_body: 'ستظهر هنا الطلبات التي تقوم بها أثناء تسجيل الدخول.',
  },
};

/* ---------------------------------------------------------------------
   DATABASE (Firestore-backed)
   Each product/order is its own document — never one big blob — so two
   people writing at the same time can't clobber each other's data.
--------------------------------------------------------------------- */
const DB = {
  async getProducts() {
    const snap = await getDocs(collection(db, 'products'));
    if (snap.empty) {
      for (const p of DEFAULT_PRODUCTS) {
        const { id, ...data } = p;
        await setDoc(doc(db, 'products', id), data);
      }
      return DEFAULT_PRODUCTS;
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async addProduct(product) {
    const { id, ...data } = product;
    await setDoc(doc(db, 'products', id), data);
    return product;
  },
  async removeProduct(id) {
    await deleteDoc(doc(db, 'products', id));
  },
  async getAllOrders() {
    const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async getOrdersByBuyer(email) {
    const q = query(collection(db, 'orders'), where('buyerEmail', '==', email), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async addOrder(order) {
    const { id, ...data } = order;
    await setDoc(doc(db, 'orders', id), data);
    return order;
  },
  async getUserProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  },
  async setUserProfile(uid, profile) {
    await setDoc(doc(db, 'users', uid), profile);
  },
};

/* ---------------------------------------------------------------------
   STATE
--------------------------------------------------------------------- */
const state = {
  lang: 'en',
  view: 'shop', // shop | admin | myorders
  adminTab: 'orders',
  products: [],
  orders: [],
  currentUser: null,
};

function t(key) { return STRINGS[state.lang][key]; }
function isAdmin(user) {
  return !!user && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase());
}

/* ---------------------------------------------------------------------
   UTILITIES
--------------------------------------------------------------------- */
function formatPrice(n) {
  try {
    return new Intl.NumberFormat(state.lang === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency', currency: 'EGP', maximumFractionDigits: 0,
    }).format(n);
  } catch (e) { return `${n} EGP`; }
}
function makeTicketNo() {
  const tt = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.random().toString(36).toUpperCase().slice(2, 4);
  return `BUY-${tt}${r}`;
}
function makeId(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function formatTime(iso) {
  return new Date(iso).toLocaleString(state.lang === 'ar' ? 'ar-EG' : 'en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

/* ---------------------------------------------------------------------
   RENDER: HEADER
--------------------------------------------------------------------- */
function renderHeader() {
  const u = state.currentUser;
  const accountHtml = u
    ? `<div class="account-wrap">
        <button class="account-btn" data-action="toggle-account-menu">
          <div class="avatar">${escapeHtml(u.name.trim().charAt(0).toUpperCase())}</div>
          <span class="account-name">${escapeHtml(u.name)}</span>
          ${icon('chevronDown', 13)}
        </button>
        <div id="account-menu" class="account-menu" hidden>
          <button class="menu-item" data-action="nav-myorders">${icon('receipt', 14)} ${t('my_orders_link')}</button>
          ${isAdmin(u) ? `<button class="menu-item" data-action="nav-admin">${icon('shield', 14)} ${t('admin_ledger_link')}</button>` : ''}
          <button class="menu-item danger" data-action="logout">${icon('logout', 14)} ${t('log_out_link')}</button>
        </div>
      </div>`
    : `<button class="pill-btn" data-action="open-auth">${icon('user', 14)} ${t('sign_in')}</button>`;

  return `
    <header class="header">
      <div class="brand">
        ${stampLogoSvg(38)}
        <span class="brand-name">${escapeHtml(t('brand'))}</span>
      </div>
      <div class="header-actions">
        <button class="pill-btn" data-action="toggle-lang">${icon('globe', 14)} ${state.lang === 'en' ? 'العربية' : 'English'}</button>
        ${accountHtml}
      </div>
    </header>`;
}

function stampLogoSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="29" fill="none" stroke="var(--brass)" stroke-width="2.5"/>
    <circle cx="32" cy="32" r="23" fill="none" stroke="var(--brass)" stroke-width="1" stroke-dasharray="2 3"/>
    <text x="32" y="38" text-anchor="middle" font-family="Fraunces, serif" font-weight="700" font-size="19" fill="var(--brass)">B</text>
  </svg>`;
}

/* ---------------------------------------------------------------------
   RENDER: SHOP
--------------------------------------------------------------------- */
function renderShop() {
  const cards = state.products.map(p => `
    <div class="ticket-card">
      <div class="ticket-notch start"></div>
      <div class="ticket-notch end"></div>
      ${p.imageUrl ? `<img class="product-image" src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name[state.lang])}" onerror="this.style.display='none'"/>` : ''}
      <div class="product-body">
        ${!p.imageUrl ? `<div class="product-icon">${icon('package', 20)}</div>` : ''}
        <div class="product-name">${escapeHtml(p.name[state.lang])}</div>
        <div class="product-desc">${escapeHtml(p.desc[state.lang])}</div>
        ${p.videoUrl ? `<a class="video-link" href="${escapeHtml(p.videoUrl)}" target="_blank" rel="noopener noreferrer">${icon('play', 14)} ${t('watch_video')}</a>` : ''}
      </div>
      <div class="ticket-divider"></div>
      <div class="product-footer">
        <span class="mono price-tag">${formatPrice(p.price)}</span>
        <button class="brass-btn" data-action="select-product" data-id="${p.id}">${t('buy')}</button>
      </div>
    </div>`).join('');

  return `
    ${renderHeader()}
    <section class="hero"><h1 class="display">${escapeHtml(t('tagline'))}</h1></section>
    <section class="product-grid">${cards}</section>`;
}

/* ---------------------------------------------------------------------
   RENDER: MY ORDERS
--------------------------------------------------------------------- */
function renderMyOrders() {
  const mine = state.orders.filter(o => o.buyerEmail && o.buyerEmail.toLowerCase() === state.currentUser.email.toLowerCase());
  const body = mine.length === 0
    ? `<div class="empty-box"><div class="empty-title display">${t('my_orders_empty_title')}</div><div class="empty-body">${t('my_orders_empty_body')}</div></div>`
    : `<div class="my-orders-list">${mine.map(o => `
        <div class="ticket-card my-order-row">
          <div>
            <div class="product-name">${escapeHtml(o.productName)}</div>
            <div class="product-desc">${escapeHtml(o.location)}</div>
          </div>
          <div style="text-align:end">
            <div class="mono" style="font-size:12.5px;font-weight:500;color:var(--brass-dark)">${o.id}</div>
            <div class="sub-cell">${formatTime(o.timestamp)}</div>
          </div>
        </div>`).join('')}</div>`;

  return `
    <div class="page">
      <div class="page-head">
        <div class="row gap-md">${stampLogoSvg(30)}<div class="page-title display">${t('my_orders_title')}</div></div>
        <button class="outline-btn" data-action="back-to-shop">${t('back_to_shop')}</button>
      </div>
      ${body}
    </div>`;
}

/* ---------------------------------------------------------------------
   RENDER: ADMIN
--------------------------------------------------------------------- */
function renderAdmin() {
  return `
    <div class="page">
      <div class="page-head">
        <div class="row gap-md">${stampLogoSvg(30)}<div class="page-title display">${t('admin_title')}</div></div>
        <button class="outline-btn" data-action="back-to-shop">${t('back_to_shop')}</button>
      </div>
      <div class="tabs">
        <button class="tab-btn ${state.adminTab === 'orders' ? 'active' : ''}" data-action="admin-tab" data-tab="orders">${t('admin_tab_orders')}</button>
        <button class="tab-btn ${state.adminTab === 'products' ? 'active' : ''}" data-action="admin-tab" data-tab="products">${t('admin_tab_products')}</button>
      </div>
      <div id="admin-tab-content">${state.adminTab === 'orders' ? renderOrdersTab() : renderProductsTab()}</div>
    </div>`;
}

function renderOrdersTab() {
  if (state.orders.length === 0) {
    return `<div class="empty-box"><div class="empty-title display">${t('admin_empty_title')}</div><div class="empty-body">${t('admin_empty_body')}</div></div>`;
  }
  const rows = state.orders.map(o => `
    <tr>
      <td class="mono" style="font-weight:500;white-space:nowrap">${o.id}</td>
      <td>${escapeHtml(o.productName)}<div class="sub-cell mono">${formatPrice(o.price)}</div></td>
      <td style="max-width:160px">${o.buyerName ? `<div>${escapeHtml(o.buyerName)}</div><div class="sub-cell">${escapeHtml(o.buyerEmail)}</div>` : `<span style="color:var(--ink-soft)">${t('guest_label')}</span>`}</td>
      <td style="white-space:nowrap"><div>${escapeHtml(o.phone1)}</div>${o.phone2 ? `<div class="sub-cell">${escapeHtml(o.phone2)}</div>` : ''}</td>
      <td style="max-width:180px">${escapeHtml(o.location)}</td>
      <td style="max-width:200px;color:var(--ink-soft)">${o.notes && o.notes.length ? o.notes.map(escapeHtml).join(' · ') : '—'}</td>
      <td style="white-space:nowrap;color:var(--ink-soft);font-size:12px">${formatTime(o.timestamp)}</td>
    </tr>`).join('');

  return `
    <div class="table-wrap"><div class="table-scroll"><table>
      <thead><tr>
        <th>${t('col_ticket')}</th><th>${t('col_product')}</th><th>${t('col_buyer')}</th>
        <th>${t('col_phones')}</th><th>${t('col_location')}</th><th>${t('col_notes')}</th><th>${t('col_time')}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div></div>`;
}

function renderProductsTab() {
  const list = state.products.length === 0
    ? `<div style="font-size:13px;color:var(--ink-soft)">${t('no_products')}</div>`
    : `<div class="product-manage-grid">${state.products.map(p => `
        <div class="product-manage-card">
          ${p.imageUrl ? `<img class="product-manage-image" src="${escapeHtml(p.imageUrl)}" alt="" onerror="this.style.display='none'"/>` : ''}
          <div class="product-manage-body">
            <div class="row gap-md" style="margin-bottom:8px">
              ${!p.imageUrl ? `<div class="product-icon" style="width:32px;height:32px;margin:0">${icon('package', 16)}</div>` : ''}
              <div class="product-name" style="font-size:14px">${escapeHtml(p.name[state.lang])}</div>
            </div>
            <div class="mono" style="font-size:13px;margin-bottom:10px">${formatPrice(p.price)}</div>
            <div class="remove-zone" data-id="${p.id}">
              <button class="outline-btn row gap-sm" style="color:var(--rose)" data-action="ask-remove" data-id="${p.id}">${icon('trash', 13)} ${t('remove')}</button>
            </div>
          </div>
        </div>`).join('')}</div>`;

  return `
    <div class="form-card">
      <div class="form-title">${t('new_product_title')}</div>
      <div class="form-grid">
        <div class="field"><label>${t('product_name_en')}</label><input class="input" id="np-name-en"/></div>
        <div class="field"><label>${t('product_name_ar')}</label><input class="input" id="np-name-ar" dir="rtl"/></div>
        <div class="field"><label>${t('product_desc_en')}</label><input class="input" id="np-desc-en"/></div>
        <div class="field"><label>${t('product_desc_ar')}</label><input class="input" id="np-desc-ar" dir="rtl"/></div>
        <div class="field"><label>${t('product_price')}</label><input class="input" id="np-price" type="number" min="0"/></div>
        <div class="field"><label>${t('image_url_label')}</label><input class="input" id="np-image" placeholder="https://…"/></div>
        <div class="field" style="grid-column:1/-1"><label>${t('video_url_label')}</label><input class="input" id="np-video" placeholder="https://…"/></div>
      </div>
      <div id="np-error" class="error-text" hidden></div>
      <button class="brass-btn" data-action="add-product" style="margin-top:6px">${icon('plus', 14)} ${t('add_product')}</button>
    </div>
    ${list}`;
}

/* ---------------------------------------------------------------------
   MAIN RENDER
--------------------------------------------------------------------- */
function renderApp() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  const app = document.getElementById('app');
  if (state.view === 'admin' && isAdmin(state.currentUser)) app.innerHTML = renderAdmin();
  else if (state.view === 'myorders' && state.currentUser) app.innerHTML = renderMyOrders();
  else { state.view = 'shop'; app.innerHTML = renderShop(); }
}

/* ---------------------------------------------------------------------
   MODALS: BUY
--------------------------------------------------------------------- */
let noteCount = 0;
function openBuyModal(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;
  noteCount = 1;
  const prefillPhone = state.currentUser && state.currentUser.phone ? state.currentUser.phone : '';
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="overlay" id="buy-overlay">
      <div class="modal wide" onclick="event.stopPropagation()">
        <div class="modal-head">
          <div><div class="modal-title display">${t('modal_title')}</div><div class="modal-sub">${escapeHtml(product.name[state.lang])}</div></div>
          <button class="close-btn" data-action="close-buy">${icon('x', 20)}</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label>${t('phone1')} <span class="req">*</span></label>
            <div class="input-icon-wrap">${icon('phone', 15)}<input class="input" id="buy-phone1" type="tel" placeholder="+20 1xx xxx xxxx" value="${escapeHtml(prefillPhone)}"/></div>
          </div>
          <div class="field">
            <label>${t('phone2')}</label>
            <div class="input-icon-wrap">${icon('phone', 15)}<input class="input" id="buy-phone2" type="tel" placeholder="+20 1xx xxx xxxx"/></div>
          </div>
          <div class="field">
            <label>${t('location')} <span class="req">*</span></label>
            <div class="input-icon-wrap">${icon('pin', 15)}<input class="input" id="buy-location" placeholder="${t('location_ph')}"/></div>
            <button class="text-btn" id="buy-geolocate" style="margin-top:6px">${icon('locate', 13)}<span id="geolocate-label">${t('use_location')}</span></button>
            <div id="geolocate-error" class="error-text" hidden></div>
          </div>
          <div class="field">
            <label>${t('notes')}</label>
            <div class="notes-list" id="buy-notes-list">
              <div class="note-row" data-note-row="0"><input class="input" placeholder="${t('note_ph')}"/></div>
            </div>
            <button class="add-note-btn" id="buy-add-note" style="margin-top:8px">${icon('plus', 14)} ${t('add_note')}</button>
          </div>
          <div id="buy-error" class="error-text" hidden></div>
          <button class="brass-btn" id="buy-submit" style="width:100%;padding:13px">${t('submit')}</button>
        </div>
      </div>
    </div>`;

  document.getElementById('buy-overlay').addEventListener('click', closeBuyModal);
  document.querySelector('#buy-overlay .modal').addEventListener('click', (e) => e.stopPropagation());
  document.querySelector('[data-action="close-buy"]').addEventListener('click', closeBuyModal);
  document.getElementById('buy-geolocate').addEventListener('click', handleGeolocate);
  document.getElementById('buy-add-note').addEventListener('click', addNoteRow);
  document.getElementById('buy-submit').addEventListener('click', () => submitOrder(product));
}
function closeBuyModal() { document.getElementById('modal-root').innerHTML = ''; }

function addNoteRow() {
  noteCount += 1;
  const row = document.createElement('div');
  row.className = 'note-row';
  row.dataset.noteRow = String(noteCount);
  row.innerHTML = `<input class="input" placeholder="${t('note_ph')}"/><button class="note-remove" data-action="remove-note">${icon('x', 14)}</button>`;
  document.getElementById('buy-notes-list').appendChild(row);
  row.querySelector('[data-action="remove-note"]').addEventListener('click', () => row.remove());
}

function handleGeolocate() {
  const errEl = document.getElementById('geolocate-error');
  const labelEl = document.getElementById('geolocate-label');
  errEl.hidden = true;
  if (!navigator.geolocation) { errEl.textContent = t('location_denied'); errEl.hidden = false; return; }
  labelEl.textContent = t('locating');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      document.getElementById('buy-location').value = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      labelEl.textContent = t('use_location');
    },
    () => { errEl.textContent = t('location_denied'); errEl.hidden = false; labelEl.textContent = t('use_location'); },
    { timeout: 8000 }
  );
}

async function submitOrder(product) {
  const phone1 = document.getElementById('buy-phone1').value.trim();
  const phone2 = document.getElementById('buy-phone2').value.trim();
  const location = document.getElementById('buy-location').value.trim();
  const notes = Array.from(document.querySelectorAll('#buy-notes-list input')).map(i => i.value.trim()).filter(Boolean);
  const errEl = document.getElementById('buy-error');
  const submitBtn = document.getElementById('buy-submit');

  if (!phone1 || !location) {
    errEl.textContent = t('required');
    errEl.hidden = false;
    return;
  }

  const order = {
    id: makeTicketNo(), productId: product.id, productName: product.name[state.lang], price: product.price,
    phone1, phone2, location, notes,
    buyerName: state.currentUser ? state.currentUser.name : '',
    buyerEmail: state.currentUser ? state.currentUser.email : '',
    timestamp: new Date().toISOString(),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = t('submitting');
  try {
    await DB.addOrder(order);
    state.orders = [order, ...state.orders];
    closeBuyModal();
    openSuccessModal(order);
  } catch (e) {
    errEl.textContent = t('required');
    errEl.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = t('submit');
  }
}

/* ---------------------------------------------------------------------
   MODAL: SUCCESS
--------------------------------------------------------------------- */
function openSuccessModal(order) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="overlay" id="success-overlay">
      <div class="modal narrow" style="text-align:center" onclick="event.stopPropagation()">
        <div class="success-icon-wrap">${icon('check', 26)}</div>
        <div class="display" style="font-size:20px;font-weight:700">${t('success_title')}</div>
        <div style="font-size:13px;color:var(--ink-soft);margin-top:10px">${t('success_body')}</div>
        <div class="mono ticket-no">${order.id}</div>
        <div style="font-size:13px;color:var(--ink-soft);margin-top:14px">${t('success_sub')}</div>
        <button class="outline-btn" id="success-close" style="margin-top:20px">${t('back_to_shop')}</button>
      </div>
    </div>`;
  const close = () => { document.getElementById('modal-root').innerHTML = ''; };
  document.getElementById('success-overlay').addEventListener('click', close);
  document.getElementById('success-close').addEventListener('click', close);
}

/* ---------------------------------------------------------------------
   MODAL: AUTH (signup / login)
--------------------------------------------------------------------- */
function openAuthModal(mode = 'login') {
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="overlay" id="auth-overlay">
      <div class="modal narrow" onclick="event.stopPropagation()">
        <div class="tabs" style="margin-bottom:20px">
          <button class="tab-btn ${mode === 'login' ? 'active' : ''}" data-auth-mode="login">${t('tab_login')}</button>
          <button class="tab-btn ${mode === 'signup' ? 'active' : ''}" data-auth-mode="signup">${t('tab_signup')}</button>
        </div>
        <div id="auth-fields"></div>
        <div id="auth-error" class="error-text" hidden></div>
        <button class="brass-btn" id="auth-submit" style="width:100%;margin-top:6px">${mode === 'signup' ? t('create_account_btn') : t('log_in_btn')}</button>
        <button class="text-btn" id="auth-switch" style="margin-top:14px">${mode === 'signup' ? t('switch_to_login') : t('switch_to_signup')}</button>
      </div>
    </div>`;

  let currentMode = mode;
  renderAuthFields(currentMode);

  document.getElementById('auth-overlay').addEventListener('click', closeAuthModal);
  document.querySelectorAll('[data-auth-mode]').forEach(btn => {
    btn.addEventListener('click', () => setAuthMode(btn.dataset.authMode));
  });
  document.getElementById('auth-switch').addEventListener('click', () => setAuthMode(currentMode === 'signup' ? 'login' : 'signup'));
  document.getElementById('auth-submit').addEventListener('click', handleAuthSubmit);

  function setAuthMode(m) {
    currentMode = m;
    document.querySelectorAll('[data-auth-mode]').forEach(b => b.classList.toggle('active', b.dataset.authMode === m));
    document.getElementById('auth-submit').textContent = m === 'signup' ? t('create_account_btn') : t('log_in_btn');
    document.getElementById('auth-switch').textContent = m === 'signup' ? t('switch_to_login') : t('switch_to_signup');
    document.getElementById('auth-error').hidden = true;
    renderAuthFields(m);
  }

  function renderAuthFields(m) {
    const wrap = document.getElementById('auth-fields');
    wrap.innerHTML = `
      ${m === 'signup' ? `<div class="field"><label>${t('name_label')} <span class="req">*</span></label><input class="input" id="auth-name"/></div>` : ''}
      <div class="field"><label>${t('email_label')} <span class="req">*</span></label><input class="input" id="auth-email" type="email" placeholder="name@email.com"/></div>
      <div class="field"><label>${t('password_label')} <span class="req">*</span></label><input class="input" id="auth-password" type="password" placeholder="••••••••"/></div>
      ${m === 'signup' ? `<div class="field"><label>${t('phone_field_optional')}</label><input class="input" id="auth-phone" type="tel"/></div>` : ''}
    `;
  }

  async function handleAuthSubmit() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const errEl = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-submit');
    submitBtn.disabled = true;

    let result;
    if (currentMode === 'signup') {
      const name = document.getElementById('auth-name').value.trim();
      const phone = document.getElementById('auth-phone').value.trim();
      result = await signup({ name, email, password, phone });
    } else {
      result = await login({ email, password });
    }

    submitBtn.disabled = false;
    if (!result.ok) {
      errEl.textContent = result.error;
      errEl.hidden = false;
      return;
    }
    closeAuthModal();
  }
}
function closeAuthModal() { document.getElementById('modal-root').innerHTML = ''; }

/* ---------------------------------------------------------------------
   AUTH LOGIC (real Firebase Authentication)
--------------------------------------------------------------------- */
function authErrorMessage(e) {
  switch (e.code) {
    case 'auth/email-already-in-use': return t('signup_error_exists');
    case 'auth/weak-password': return t('password_required');
    case 'auth/invalid-email': return t('email_required');
    case 'auth/user-not-found': return t('login_error_missing');
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return t('wrong_password');
    default: return e.message || t('required');
  }
}

async function signup({ name, email, password, phone }) {
  if (!name || !email || !isValidEmail(email)) return { ok: false, error: t('name_email_required') };
  if (!password || password.length < 6) return { ok: false, error: t('password_required') };
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await DB.setUserProfile(cred.user.uid, { name, email, phone: phone || '', createdAt: new Date().toISOString() });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: authErrorMessage(e) };
  }
}

async function login({ email, password }) {
  if (!email || !isValidEmail(email)) return { ok: false, error: t('email_required') };
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: authErrorMessage(e) };
  }
}

function logout() {
  signOut(auth);
  state.view = 'shop';
}

// Fires on page load (restoring a session) and on every sign-in/out.
onAuthStateChanged(auth, async (fbUser) => {
  if (fbUser) {
    const profile = await DB.getUserProfile(fbUser.uid);
    state.currentUser = {
      uid: fbUser.uid,
      name: (profile && profile.name) || fbUser.displayName || fbUser.email,
      email: fbUser.email,
      phone: (profile && profile.phone) || '',
    };
  } else {
    state.currentUser = null;
  }
  renderApp();
});

/* ---------------------------------------------------------------------
   ADMIN ACTIONS
--------------------------------------------------------------------- */
async function addProductFromForm() {
  const nameEn = document.getElementById('np-name-en').value.trim();
  const nameAr = document.getElementById('np-name-ar').value.trim();
  const descEn = document.getElementById('np-desc-en').value.trim();
  const descAr = document.getElementById('np-desc-ar').value.trim();
  const price = Number(document.getElementById('np-price').value);
  const imageUrl = document.getElementById('np-image').value.trim();
  const videoUrl = document.getElementById('np-video').value.trim();
  const errEl = document.getElementById('np-error');
  const addBtn = document.querySelector('[data-action="add-product"]');

  if (!nameEn || !nameAr || !price || price <= 0) {
    errEl.textContent = t('product_fields_required');
    errEl.hidden = false;
    return;
  }
  const product = { id: makeId('p'), price, imageUrl, videoUrl, name: { en: nameEn, ar: nameAr }, desc: { en: descEn, ar: descAr } };

  if (addBtn) addBtn.disabled = true;
  try {
    await DB.addProduct(product);
    state.products = [...state.products, product];
    document.getElementById('admin-tab-content').innerHTML = renderProductsTab();
    wireProductsTabEvents();
  } catch (e) {
    errEl.textContent = t('product_fields_required');
    errEl.hidden = false;
    if (addBtn) addBtn.disabled = false;
  }
}

function askRemoveProduct(id) {
  const zone = document.querySelector(`.remove-zone[data-id="${id}"]`);
  if (!zone) return;
  zone.innerHTML = `
    <div class="confirm-row">
      <button class="danger-btn" data-action="confirm-remove" data-id="${id}">${t('yes_remove')}</button>
      <button class="outline-btn" data-action="cancel-remove" data-id="${id}">${t('keep')}</button>
    </div>`;
  zone.querySelector('[data-action="confirm-remove"]').addEventListener('click', () => removeProduct(id));
  zone.querySelector('[data-action="cancel-remove"]').addEventListener('click', () => {
    document.getElementById('admin-tab-content').innerHTML = renderProductsTab();
    wireProductsTabEvents();
  });
}

async function removeProduct(id) {
  await DB.removeProduct(id);
  state.products = state.products.filter(p => p.id !== id);
  document.getElementById('admin-tab-content').innerHTML = renderProductsTab();
  wireProductsTabEvents();
}

function wireProductsTabEvents() {
  const addBtn = document.querySelector('[data-action="add-product"]');
  if (addBtn) addBtn.addEventListener('click', addProductFromForm);
  document.querySelectorAll('[data-action="ask-remove"]').forEach(btn => {
    btn.addEventListener('click', () => askRemoveProduct(btn.dataset.id));
  });
}

/* ---------------------------------------------------------------------
   GLOBAL EVENT DELEGATION (for the main #app view)
--------------------------------------------------------------------- */
document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) {
    const menu = document.getElementById('account-menu');
    if (menu && !menu.hidden && !e.target.closest('.account-wrap')) menu.hidden = true;
    return;
  }
  const action = el.dataset.action;

  switch (action) {
    case 'toggle-lang':
      state.lang = state.lang === 'en' ? 'ar' : 'en';
      renderApp();
      break;
    case 'select-product':
      openBuyModal(el.dataset.id);
      break;
    case 'open-auth':
      openAuthModal('login');
      break;
    case 'toggle-account-menu': {
      const menu = document.getElementById('account-menu');
      if (menu) menu.hidden = !menu.hidden;
      break;
    }
    case 'nav-myorders':
      document.getElementById('account-menu').hidden = true;
      state.orders = await DB.getOrdersByBuyer(state.currentUser.email);
      state.view = 'myorders';
      renderApp();
      break;
    case 'nav-admin':
      document.getElementById('account-menu').hidden = true;
      state.view = 'admin';
      state.adminTab = 'orders';
      state.orders = await DB.getAllOrders();
      renderApp();
      break;
    case 'logout':
      logout();
      break;
    case 'back-to-shop':
      state.view = 'shop';
      renderApp();
      break;
    case 'admin-tab':
      state.adminTab = el.dataset.tab;
      if (state.adminTab === 'products') state.products = await DB.getProducts();
      document.getElementById('admin-tab-content').innerHTML = state.adminTab === 'orders' ? renderOrdersTab() : renderProductsTab();
      if (state.adminTab === 'products') wireProductsTabEvents();
      document.querySelectorAll('.tab-btn[data-action="admin-tab"]').forEach(b => b.classList.toggle('active', b.dataset.tab === state.adminTab));
      break;
    default:
      break;
  }
});

/* ---------------------------------------------------------------------
   INIT
--------------------------------------------------------------------- */
async function init() {
  renderApp(); // paint immediately so the page isn't blank while Firestore loads
  state.products = await DB.getProducts();
  renderApp();
}
init();
