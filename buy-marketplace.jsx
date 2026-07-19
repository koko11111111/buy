import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, X, MapPin, Phone, ShieldCheck, Loader2, LocateFixed,
  Lamp, Coffee, Watch, Backpack, Headphones, BookOpen, Package,
  ShoppingBag, Shirt, Smartphone, Gift, Globe, Check, ArrowLeft, Trash2,
  User, ChevronDown, PlayCircle, LogOut, Receipt
} from 'lucide-react';

/* ---------------------------------------------------------------
   ADMIN LIST — anyone who signs up / logs in with one of these
   emails gets the Admin ledger option in their account menu.
   You gave two so far — send the third whenever you have it.
----------------------------------------------------------------*/
const ADMIN_EMAILS = ['kokomina946@gmail.com', 'patrick.kimo2010@gmail.com'];

/* ---------------------------------------------------------------
   ICON LIBRARY — used as a fallback when a product has no image.
----------------------------------------------------------------*/
const ICONS = { lamp: Lamp, coffee: Coffee, watch: Watch, backpack: Backpack, headphones: Headphones, book: BookOpen, bag: ShoppingBag, shirt: Shirt, phone: Smartphone, gift: Gift, package: Package };
const ICON_OPTIONS = [
  { key: 'package', label: { en: 'Package', ar: 'صندوق' } },
  { key: 'lamp', label: { en: 'Lamp', ar: 'مصباح' } },
  { key: 'coffee', label: { en: 'Coffee', ar: 'قهوة' } },
  { key: 'watch', label: { en: 'Watch', ar: 'ساعة' } },
  { key: 'backpack', label: { en: 'Backpack', ar: 'حقيبة' } },
  { key: 'headphones', label: { en: 'Headphones', ar: 'سماعات' } },
  { key: 'book', label: { en: 'Book', ar: 'كتاب' } },
  { key: 'bag', label: { en: 'Bag', ar: 'شنطة' } },
  { key: 'shirt', label: { en: 'Clothing', ar: 'ملابس' } },
  { key: 'phone', label: { en: 'Electronics', ar: 'إلكترونيات' } },
  { key: 'gift', label: { en: 'Gift', ar: 'هدية' } },
];

/* ---------------------------------------------------------------
   DEFAULT PRODUCTS — seeded into storage the first time the app
   runs. After that, the admin's Products tab is the source of truth.
   Add imageUrl / videoUrl per product from the Products tab.
----------------------------------------------------------------*/
const DEFAULT_PRODUCTS = [
  { id: 'p1', icon: 'lamp', price: 1450, imageUrl: '', videoUrl: '', name: { en: 'Cedar desk lamp', ar: 'مصباح مكتب خشب الأرز' }, desc: { en: 'Warm brass fitting, adjustable arm.', ar: 'تركيب نحاسي دافئ، ذراع قابل للتعديل.' } },
  { id: 'p2', icon: 'coffee', price: 620, imageUrl: '', videoUrl: '', name: { en: 'Pour-over coffee set', ar: 'طقم قهوة مقطرة يدويًا' }, desc: { en: 'Ceramic dripper, glass carafe.', ar: 'مصفاة سيراميك، إبريق زجاجي.' } },
  { id: 'p3', icon: 'watch', price: 2300, imageUrl: '', videoUrl: '', name: { en: 'Field watch', ar: 'ساعة ميدانية' }, desc: { en: 'Stainless case, canvas strap.', ar: 'هيكل ستانلس، سوار قماشي.' } },
  { id: 'p4', icon: 'backpack', price: 980, imageUrl: '', videoUrl: '', name: { en: 'Canvas day pack', ar: 'حقيبة ظهر قماشية' }, desc: { en: 'Water-resistant, leather trims.', ar: 'مقاومة للماء، حواف جلدية.' } },
  { id: 'p5', icon: 'headphones', price: 1750, imageUrl: '', videoUrl: '', name: { en: 'Studio headphones', ar: 'سماعات استوديو' }, desc: { en: 'Over-ear, foldable frame.', ar: 'محيطة بالأذن، هيكل قابل للطي.' } },
  { id: 'p6', icon: 'book', price: 340, imageUrl: '', videoUrl: '', name: { en: 'Leather journal', ar: 'دفتر جلدي' }, desc: { en: '200 pages, dotted grid.', ar: '٢٠٠ صفحة، شبكة منقطة.' } },
];

const STRINGS = {
  en: {
    brand: 'Buy', tagline: 'A stamped ticket for every order — simple and honest.',
    buy: 'Buy',
    modal_title: 'Fill your ticket',
    phone1: 'Phone number', phone2: 'Second phone (optional)',
    location: 'Delivery location', location_ph: 'Neighborhood, street, landmark…',
    use_location: 'Use my current location', locating: 'Locating…',
    location_denied: "Couldn't get your location. Type it in instead.",
    notes: 'Notes', add_note: 'Add a note', note_ph: 'e.g. Call before arriving',
    submit: 'Stamp my order', submitting: 'Stamping…', cancel: 'Cancel',
    required: 'Phone number and location are required.',
    success_title: 'Order stamped', success_body: 'Ticket number',
    success_sub: "We'll reach out on the number you gave us.",
    back_to_shop: 'Back to shop',
    admin_title: 'Ledger', admin_tab_orders: 'Orders', admin_tab_products: 'Products',
    admin_empty_title: 'No tickets yet', admin_empty_body: 'New orders will show up here the moment someone stamps one.',
    col_ticket: 'Ticket', col_product: 'Product', col_buyer: 'Buyer', col_phones: 'Phones', col_location: 'Location', col_notes: 'Notes', col_time: 'Time',
    guest_label: 'Guest', loading: 'Loading…',
    product_name_en: 'Name (English)', product_name_ar: 'Name (Arabic)',
    product_desc_en: 'Description (English)', product_desc_ar: 'Description (Arabic)',
    product_price: 'Price (EGP)', product_icon: 'Fallback icon',
    image_url_label: 'Image URL', video_url_label: 'Video URL (optional)',
    watch_video: 'Watch video',
    add_product: 'Add product', product_fields_required: 'Fill in both names and a price before adding.',
    no_products: 'No products yet. Add your first one below.',
    remove: 'Remove', yes_remove: 'Yes, remove', keep: 'Keep it',
    new_product_title: 'Add a product',
    sign_in: 'Sign in', account: 'Account',
    tab_signup: 'Sign up', tab_login: 'Log in',
    name_label: 'Full name', email_label: 'Email', phone_field_optional: 'Phone (optional)',
    create_account_btn: 'Create account', log_in_btn: 'Log in',
    switch_to_login: 'Already have an account? Log in', switch_to_signup: "Don't have an account? Sign up",
    signup_error_exists: 'An account with this email already exists.',
    login_error_missing: "We couldn't find an account with that email.",
    name_email_required: 'Name and email are required.', email_required: 'Email is required.',
    my_orders_link: 'My orders', admin_ledger_link: 'Admin ledger', log_out_link: 'Log out',
    my_orders_title: 'My orders', my_orders_empty_title: 'No orders yet',
    my_orders_empty_body: 'Orders you place while signed in will show up here.',
  },
  ar: {
    brand: 'اشترِ', tagline: 'تذكرة مختومة لكل طلب — بسيطة وصادقة.',
    buy: 'اشترِ',
    modal_title: 'املأ تذكرتك',
    phone1: 'رقم الهاتف', phone2: 'رقم هاتف ثانٍ (اختياري)',
    location: 'موقع التوصيل', location_ph: 'الحي، الشارع، أقرب معلم…',
    use_location: 'استخدم موقعي الحالي', locating: 'جارٍ تحديد الموقع…',
    location_denied: 'تعذّر تحديد موقعك. اكتبه يدويًا.',
    notes: 'ملاحظات', add_note: 'إضافة ملاحظة', note_ph: 'مثال: اتصل قبل الوصول',
    submit: 'اختم طلبي', submitting: 'جارٍ الختم…', cancel: 'إلغاء',
    required: 'رقم الهاتف والموقع مطلوبان.',
    success_title: 'تم ختم الطلب', success_body: 'رقم التذكرة',
    success_sub: 'سنتواصل معك على الرقم الذي أدخلته.',
    back_to_shop: 'العودة للمتجر',
    admin_title: 'السجل', admin_tab_orders: 'الطلبات', admin_tab_products: 'المنتجات',
    admin_empty_title: 'لا توجد تذاكر بعد', admin_empty_body: 'ستظهر الطلبات الجديدة هنا فور ختمها.',
    col_ticket: 'التذكرة', col_product: 'المنتج', col_buyer: 'المشتري', col_phones: 'الهواتف', col_location: 'الموقع', col_notes: 'ملاحظات', col_time: 'الوقت',
    guest_label: 'زائر', loading: 'جارٍ التحميل…',
    product_name_en: 'الاسم (إنجليزي)', product_name_ar: 'الاسم (عربي)',
    product_desc_en: 'الوصف (إنجليزي)', product_desc_ar: 'الوصف (عربي)',
    product_price: 'السعر (جنيه)', product_icon: 'أيقونة احتياطية',
    image_url_label: 'رابط الصورة', video_url_label: 'رابط الفيديو (اختياري)',
    watch_video: 'مشاهدة الفيديو',
    add_product: 'إضافة منتج', product_fields_required: 'أدخل الاسمين والسعر قبل الإضافة.',
    no_products: 'لا توجد منتجات بعد. أضف أول منتج بالأسفل.',
    remove: 'إزالة', yes_remove: 'نعم، إزالة', keep: 'الاحتفاظ به',
    new_product_title: 'إضافة منتج',
    sign_in: 'تسجيل الدخول', account: 'حسابي',
    tab_signup: 'إنشاء حساب', tab_login: 'تسجيل الدخول',
    name_label: 'الاسم الكامل', email_label: 'البريد الإلكتروني', phone_field_optional: 'رقم الهاتف (اختياري)',
    create_account_btn: 'إنشاء الحساب', log_in_btn: 'تسجيل الدخول',
    switch_to_login: 'لديك حساب بالفعل؟ سجّل الدخول', switch_to_signup: 'ليس لديك حساب؟ أنشئ حسابًا',
    signup_error_exists: 'يوجد حساب بهذا البريد الإلكتروني بالفعل.',
    login_error_missing: 'لم نعثر على حساب بهذا البريد الإلكتروني.',
    name_email_required: 'الاسم والبريد الإلكتروني مطلوبان.', email_required: 'البريد الإلكتروني مطلوب.',
    my_orders_link: 'طلباتي', admin_ledger_link: 'سجل الإدارة', log_out_link: 'تسجيل الخروج',
    my_orders_title: 'طلباتي', my_orders_empty_title: 'لا توجد طلبات بعد',
    my_orders_empty_body: 'ستظهر هنا الطلبات التي تقوم بها أثناء تسجيل الدخول.',
  },
};

const COLORS = {
  ink: '#1E2A32', inkSoft: '#5B6B73', paper: '#EFE8D8', card: '#FBF8F1',
  brass: '#B98B3E', brassDark: '#8F6A2C', teal: '#2F6E68', rose: '#B5473B', line: '#DED0A8',
};

function formatPrice(n, lang) {
  try {
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency', currency: 'EGP', maximumFractionDigits: 0,
    }).format(n);
  } catch (e) {
    return `${n} EGP`;
  }
}

function makeTicketNo() {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.random().toString(36).toUpperCase().slice(2, 4);
  return `BUY-${t}${r}`;
}
function makeProductId() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function makeUserId() { return 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function StampLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="none" stroke={COLORS.brass} strokeWidth="2.5" />
      <circle cx="32" cy="32" r="23" fill="none" stroke={COLORS.brass} strokeWidth="1" strokeDasharray="2 3" />
      <text x="32" y="38" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="700"
        fontSize="19" fill={COLORS.brass}>B</text>
    </svg>
  );
}

export default function BuyApp() {
  const [lang, setLang] = useState('en');
  const [view, setView] = useState('shop');
  const [selected, setSelected] = useState(null);
  const [success, setSuccess] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');

  const t = STRINGS[lang];
  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const isAdmin = currentUser && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(currentUser.email.toLowerCase());

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await window.storage.get('orders', true);
      setOrders(res ? JSON.parse(res.value) : []);
    } catch (e) { setOrders([]); }
    setOrdersLoading(false);
  }, []);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await window.storage.get('products', true);
      if (res && res.value) {
        setProducts(JSON.parse(res.value));
      } else {
        await window.storage.set('products', JSON.stringify(DEFAULT_PRODUCTS), true);
        setProducts(DEFAULT_PRODUCTS);
      }
    } catch (e) {
      try { await window.storage.set('products', JSON.stringify(DEFAULT_PRODUCTS), true); } catch (e2) {}
      setProducts(DEFAULT_PRODUCTS);
    }
    setProductsLoading(false);
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await window.storage.get('users', true);
      setUsers(res ? JSON.parse(res.value) : []);
      return res ? JSON.parse(res.value) : [];
    } catch (e) { setUsers([]); return []; }
  }, []);

  useEffect(() => { loadProducts(); loadUsers(); }, [loadProducts, loadUsers]);
  useEffect(() => {
    if ((view === 'admin' && isAdmin) || view === 'myorders') loadOrders();
  }, [view, isAdmin, loadOrders]);

  async function saveOrder(order) {
    try {
      let current = [];
      try {
        const res = await window.storage.get('orders', true);
        current = res ? JSON.parse(res.value) : [];
      } catch (e) { current = []; }
      const updated = [order, ...current];
      const res2 = await window.storage.set('orders', JSON.stringify(updated), true);
      return !!res2;
    } catch (e) { return false; }
  }

  async function addProduct(newProduct) {
    const updated = [...products, newProduct];
    try {
      const res = await window.storage.set('products', JSON.stringify(updated), true);
      if (res) setProducts(updated);
      return !!res;
    } catch (e) { return false; }
  }

  async function removeProduct(id) {
    const updated = products.filter(p => p.id !== id);
    try {
      const res = await window.storage.set('products', JSON.stringify(updated), true);
      if (res) setProducts(updated);
      return !!res;
    } catch (e) { return false; }
  }

  async function handleSignup({ name, email, phone }) {
    if (!name.trim() || !email.trim() || !isValidEmail(email.trim())) {
      setAuthError(t.name_email_required);
      return false;
    }
    const fresh = await loadUsers();
    if (fresh.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setAuthError(t.signup_error_exists);
      return false;
    }
    const user = { id: makeUserId(), name: name.trim(), email: email.trim(), phone: phone.trim(), createdAt: new Date().toISOString() };
    const updated = [...fresh, user];
    try {
      const res = await window.storage.set('users', JSON.stringify(updated), true);
      if (!res) { setAuthError(t.signup_error_exists); return false; }
      setUsers(updated);
      setCurrentUser(user);
      setAuthError('');
      setAuthOpen(false);
      return true;
    } catch (e) { setAuthError(t.signup_error_exists); return false; }
  }

  async function handleLogin({ email }) {
    if (!email.trim() || !isValidEmail(email.trim())) {
      setAuthError(t.email_required);
      return false;
    }
    const fresh = await loadUsers();
    const match = fresh.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!match) { setAuthError(t.login_error_missing); return false; }
    setCurrentUser(match);
    setAuthError('');
    setAuthOpen(false);
    return true;
  }

  function handleLogout() {
    setCurrentUser(null);
    setView('shop');
  }

  return (
    <div dir={dir} lang={lang} style={{
      fontFamily: "'Cairo', 'Segoe UI', sans-serif",
      background: COLORS.paper, color: COLORS.ink, minHeight: '100%',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,500;0,600;0,700;1,500&family=JetBrains+Mono:wght@400;500&display=swap');
        .buy-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .buy-display { font-family: 'Fraunces', Georgia, serif; }
        .buy-btn { cursor: pointer; border: none; transition: transform .12s ease, background .15s ease; }
        .buy-btn:active { transform: scale(0.97); }
        .buy-input {
          width: 100%; border: 1.5px solid ${COLORS.line}; background: ${COLORS.card};
          border-radius: 6px; padding: 10px 12px; font-family: inherit; font-size: 14px;
          color: ${COLORS.ink}; outline: none; box-sizing: border-box;
        }
        .buy-input:focus { border-color: ${COLORS.brass}; }
        .ticket-card { position: relative; background: ${COLORS.card}; border-radius: 8px;
          box-shadow: 0 1px 3px rgba(30,42,50,0.12); overflow: hidden; }
        .ticket-notch { position: absolute; width: 16px; height: 16px; border-radius: 50%;
          background: ${COLORS.paper}; top: 128px; }
        .ticket-divider { border-top: 2px dashed ${COLORS.line}; margin: 0 16px; }
        .stamp-btn:hover { background: ${COLORS.brassDark}; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {view === 'shop' && (
        <ShopView
          t={t} lang={lang} setLang={setLang} isRTL={isRTL}
          products={products} productsLoading={productsLoading}
          onSelect={setSelected}
          currentUser={currentUser} isAdmin={isAdmin}
          onOpenAuth={() => { setAuthError(''); setAuthOpen(true); }}
          onMyOrders={() => setView('myorders')}
          onAdminLedger={() => setView('admin')}
          onLogout={handleLogout}
        />
      )}

      {view === 'admin' && isAdmin && (
        <AdminPanel
          t={t} lang={lang} isRTL={isRTL}
          orders={orders} ordersLoading={ordersLoading}
          products={products} productsLoading={productsLoading}
          onAddProduct={addProduct} onRemoveProduct={removeProduct}
          onBack={() => setView('shop')}
        />
      )}

      {view === 'myorders' && currentUser && (
        <MyOrdersView
          t={t} lang={lang} isRTL={isRTL} currentUser={currentUser}
          orders={orders.filter(o => o.buyerEmail && o.buyerEmail.toLowerCase() === currentUser.email.toLowerCase())}
          loading={ordersLoading} onBack={() => setView('shop')}
        />
      )}

      {selected && (
        <BuyModal
          t={t} lang={lang} isRTL={isRTL} product={selected} currentUser={currentUser}
          onClose={() => setSelected(null)}
          onSubmit={async (form) => {
            const order = {
              id: makeTicketNo(),
              productId: selected.id,
              productName: selected.name[lang],
              price: selected.price,
              phone1: form.phone1, phone2: form.phone2 || '',
              location: form.location, notes: form.notes.filter(n => n.trim()),
              buyerName: currentUser ? currentUser.name : '',
              buyerEmail: currentUser ? currentUser.email : '',
              timestamp: new Date().toISOString(),
            };
            const ok = await saveOrder(order);
            if (ok) { setSelected(null); setSuccess(order); }
            return ok;
          }}
        />
      )}

      {success && (
        <SuccessScreen t={t} lang={lang} isRTL={isRTL} order={success} onClose={() => setSuccess(null)} />
      )}

      {authOpen && (
        <AuthModal
          t={t} isRTL={isRTL} error={authError} setError={setAuthError}
          onClose={() => setAuthOpen(false)}
          onSignup={handleSignup} onLogin={handleLogin}
        />
      )}
    </div>
  );
}

function AccountControl({ t, isRTL, currentUser, isAdmin, onOpenAuth, onMyOrders, onAdminLedger, onLogout }) {
  const [open, setOpen] = useState(false);

  if (!currentUser) {
    return (
      <button onClick={onOpenAuth} className="buy-btn" style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'transparent',
        border: `1.5px solid ${COLORS.line}`, borderRadius: 999, padding: '6px 12px',
        fontSize: 13, fontWeight: 600, color: COLORS.inkSoft,
      }}>
        <User size={14} color={COLORS.teal} />
        {t.sign_in}
      </button>
    );
  }

  const initial = currentUser.name.trim().charAt(0).toUpperCase();

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} className="buy-btn" style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'transparent',
        border: `1.5px solid ${COLORS.line}`, borderRadius: 999, padding: '5px 10px 5px 5px',
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%', background: COLORS.brass, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
        }}>{initial}</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.inkSoft, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentUser.name}
        </span>
        <ChevronDown size={13} color={COLORS.inkSoft} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', [isRTL ? 'left' : 'right']: 0, zIndex: 40,
          background: COLORS.card, border: `1.5px solid ${COLORS.line}`, borderRadius: 8,
          minWidth: 170, boxShadow: '0 4px 14px rgba(30,42,50,0.15)', overflow: 'hidden',
        }}>
          <MenuItem icon={Receipt} label={t.my_orders_link} onClick={() => { setOpen(false); onMyOrders(); }} isRTL={isRTL} />
          {isAdmin && <MenuItem icon={ShieldCheck} label={t.admin_ledger_link} onClick={() => { setOpen(false); onAdminLedger(); }} isRTL={isRTL} />}
          <MenuItem icon={LogOut} label={t.log_out_link} onClick={() => { setOpen(false); onLogout(); }} isRTL={isRTL} danger />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, isRTL, danger }) {
  return (
    <button onClick={onClick} className="buy-btn" style={{
      display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent',
      padding: '10px 14px', fontSize: 13, fontWeight: 600, textAlign: isRTL ? 'right' : 'left',
      color: danger ? COLORS.rose : COLORS.ink,
    }}>
      <Icon size={14} />
      {label}
    </button>
  );
}

function Header({ t, lang, setLang, isRTL, currentUser, isAdmin, onOpenAuth, onMyOrders, onAdminLedger, onLogout }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 24px', borderBottom: `1.5px solid ${COLORS.line}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <StampLogo size={38} />
        <span className="buy-display" style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink }}>
          {t.brand}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="buy-btn" style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'transparent',
          border: `1.5px solid ${COLORS.line}`, borderRadius: 999, padding: '6px 12px',
          fontSize: 13, fontWeight: 600, color: COLORS.inkSoft,
        }}>
          <Globe size={14} color={COLORS.teal} />
          {lang === 'en' ? 'العربية' : 'English'}
        </button>
        <AccountControl t={t} isRTL={isRTL} currentUser={currentUser} isAdmin={isAdmin}
          onOpenAuth={onOpenAuth} onMyOrders={onMyOrders} onAdminLedger={onAdminLedger} onLogout={onLogout} />
      </div>
    </header>
  );
}

function ShopView({ t, lang, setLang, isRTL, products, productsLoading, onSelect, currentUser, isAdmin, onOpenAuth, onMyOrders, onAdminLedger, onLogout }) {
  return (
    <div>
      <Header t={t} lang={lang} setLang={setLang} isRTL={isRTL}
        currentUser={currentUser} isAdmin={isAdmin}
        onOpenAuth={onOpenAuth} onMyOrders={onMyOrders} onAdminLedger={onAdminLedger} onLogout={onLogout} />

      <section style={{ padding: '40px 24px 24px', textAlign: isRTL ? 'right' : 'left' }}>
        <h1 className="buy-display" style={{
          fontSize: 30, fontWeight: 700, margin: 0, maxWidth: 560,
          fontStyle: lang === 'ar' ? 'normal' : 'italic',
        }}>
          {t.tagline}
        </h1>
      </section>

      {productsLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.inkSoft, fontSize: 13, padding: '0 24px 24px' }}>
          <Loader2 size={14} className="spin" /> {t.loading}
        </div>
      )}

      {!productsLoading && (
        <section style={{
          padding: '8px 24px 48px', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 20,
        }}>
          {products.map(p => {
            const Icon = ICONS[p.icon] || Package;
            return (
              <div key={p.id} className="ticket-card">
                <div className="ticket-notch" style={{ left: -8 }} />
                <div className="ticket-notch" style={{ right: -8 }} />

                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name[lang]} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                ) : null}

                <div style={{ padding: '22px 18px 16px', textAlign: isRTL ? 'right' : 'left' }}>
                  {!p.imageUrl && (
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', background: COLORS.paper,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                    }}>
                      <Icon size={20} color={COLORS.teal} />
                    </div>
                  )}
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name[lang]}</div>
                  <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 4, lineHeight: 1.5 }}>
                    {p.desc[lang]}
                  </div>
                  {p.videoUrl && (
                    <a href={p.videoUrl} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
                      fontSize: 12.5, fontWeight: 600, color: COLORS.teal, textDecoration: 'none',
                    }}>
                      <PlayCircle size={14} /> {t.watch_video}
                    </a>
                  )}
                </div>
                <div className="ticket-divider" />
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px 18px',
                }}>
                  <span className="buy-mono" style={{ fontSize: 14, fontWeight: 500 }}>
                    {formatPrice(p.price, lang)}
                  </span>
                  <button onClick={() => onSelect(p)} className="buy-btn stamp-btn" style={{
                    background: COLORS.brass, color: '#fff', borderRadius: 6,
                    padding: '8px 16px', fontSize: 13, fontWeight: 700,
                  }}>
                    {t.buy}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

function BuyModal({ t, lang, isRTL, product, currentUser, onClose, onSubmit }) {
  const [phone1, setPhone1] = useState(currentUser && currentUser.phone ? currentUser.phone : '');
  const [phone2, setPhone2] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState(['']);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateNote(i, val) { const next = [...notes]; next[i] = val; setNotes(next); }
  function removeNote(i) { setNotes(notes.filter((_, idx) => idx !== i)); }

  function useMyLocation() {
    setLocError('');
    if (!navigator.geolocation) { setLocError(t.location_denied); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setLocating(false);
      },
      () => { setLocError(t.location_denied); setLocating(false); },
      { timeout: 8000 }
    );
  }

  async function handleSubmit() {
    if (!phone1.trim() || !location.trim()) { setError(t.required); return; }
    setError(''); setSubmitting(true);
    const ok = await onSubmit({ phone1: phone1.trim(), phone2: phone2.trim(), location: location.trim(), notes });
    setSubmitting(false);
    if (!ok) setError(t.required);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(30,42,50,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50,
    }} onClick={onClose}>
      <div dir={isRTL ? 'rtl' : 'ltr'} onClick={(e) => e.stopPropagation()} style={{
        background: COLORS.card, borderRadius: 10, width: '100%', maxWidth: 440,
        maxHeight: '88vh', overflowY: 'auto', textAlign: isRTL ? 'right' : 'left',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: `2px dashed ${COLORS.line}`,
        }}>
          <div>
            <div className="buy-display" style={{ fontWeight: 700, fontSize: 18 }}>{t.modal_title}</div>
            <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 2 }}>{product.name[lang]}</div>
          </div>
          <button onClick={onClose} className="buy-btn" style={{ background: 'transparent' }} aria-label={t.cancel}>
            <X size={20} color={COLORS.inkSoft} />
          </button>
        </div>

        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label={t.phone1} required>
            <div style={{ position: 'relative' }}>
              <Phone size={15} color={COLORS.inkSoft} style={{ position: 'absolute', top: 12, [isRTL ? 'right' : 'left']: 10 }} />
              <input className="buy-input" style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: 32 }}
                value={phone1} onChange={(e) => setPhone1(e.target.value)} type="tel" placeholder="+20 1xx xxx xxxx" />
            </div>
          </Field>

          <Field label={t.phone2}>
            <div style={{ position: 'relative' }}>
              <Phone size={15} color={COLORS.inkSoft} style={{ position: 'absolute', top: 12, [isRTL ? 'right' : 'left']: 10 }} />
              <input className="buy-input" style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: 32 }}
                value={phone2} onChange={(e) => setPhone2(e.target.value)} type="tel" placeholder="+20 1xx xxx xxxx" />
            </div>
          </Field>

          <Field label={t.location} required>
            <div style={{ position: 'relative' }}>
              <MapPin size={15} color={COLORS.inkSoft} style={{ position: 'absolute', top: 12, [isRTL ? 'right' : 'left']: 10 }} />
              <input className="buy-input" style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: 32 }}
                value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t.location_ph} />
            </div>
            <button onClick={useMyLocation} className="buy-btn" disabled={locating} style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'transparent',
              border: 'none', color: COLORS.teal, fontSize: 12.5, fontWeight: 600, marginTop: 6, padding: 0,
            }}>
              {locating ? <Loader2 size={13} className="spin" /> : <LocateFixed size={13} />}
              {locating ? t.locating : t.use_location}
            </button>
            {locError && <div style={{ fontSize: 12, color: COLORS.rose, marginTop: 4 }}>{locError}</div>}
          </Field>

          <Field label={t.notes}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notes.map((n, i) => (
                <div key={i} style={{ display: 'flex', gap: 6 }}>
                  <input className="buy-input" value={n} placeholder={t.note_ph} onChange={(e) => updateNote(i, e.target.value)} />
                  {notes.length > 1 && (
                    <button onClick={() => removeNote(i)} className="buy-btn" style={{
                      background: 'transparent', border: `1.5px solid ${COLORS.line}`, borderRadius: 6, width: 36,
                    }} aria-label={t.cancel}>
                      <X size={14} color={COLORS.inkSoft} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setNotes([...notes, ''])} className="buy-btn" style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'transparent',
                border: `1.5px dashed ${COLORS.line}`, borderRadius: 6, padding: '8px 10px',
                color: COLORS.teal, fontSize: 13, fontWeight: 600, justifyContent: 'center',
              }}>
                <Plus size={14} /> {t.add_note}
              </button>
            </div>
          </Field>

          {error && <div style={{ fontSize: 13, color: COLORS.rose, fontWeight: 500 }}>{error}</div>}

          <button onClick={handleSubmit} disabled={submitting} className="buy-btn stamp-btn" style={{
            background: COLORS.brass, color: '#fff', borderRadius: 6, padding: '13px',
            fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8, opacity: submitting ? 0.7 : 1,
          }}>
            {submitting && <Loader2 size={15} className="spin" />}
            {submitting ? t.submitting : t.submit}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: COLORS.inkSoft, marginBottom: 6 }}>
        {label}{required && <span style={{ color: COLORS.rose }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function SuccessScreen({ t, lang, isRTL, order, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(30,42,50,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50,
    }} onClick={onClose}>
      <div dir={isRTL ? 'rtl' : 'ltr'} onClick={(e) => e.stopPropagation()} style={{
        background: COLORS.card, borderRadius: 10, width: '100%', maxWidth: 380,
        padding: '32px 24px', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: COLORS.paper,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <Check size={26} color={COLORS.teal} />
        </div>
        <div className="buy-display" style={{ fontSize: 20, fontWeight: 700 }}>{t.success_title}</div>
        <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 10 }}>{t.success_body}</div>
        <div className="buy-mono" style={{
          fontSize: 18, fontWeight: 500, color: COLORS.brassDark,
          border: `2px dashed ${COLORS.line}`, borderRadius: 6, padding: '10px 0', marginTop: 10,
        }}>
          {order.id}
        </div>
        <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 14 }}>{t.success_sub}</div>
        <button onClick={onClose} className="buy-btn" style={{
          marginTop: 20, background: 'transparent', border: `1.5px solid ${COLORS.line}`,
          borderRadius: 6, padding: '10px 18px', fontSize: 13, fontWeight: 600, color: COLORS.ink,
        }}>
          {t.back_to_shop}
        </button>
      </div>
    </div>
  );
}

function AuthModal({ t, isRTL, error, setError, onClose, onSignup, onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    if (mode === 'signup') await onSignup({ name, email, phone });
    else await onLogin({ email });
    setSubmitting(false);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(30,42,50,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50,
    }} onClick={onClose}>
      <div dir={isRTL ? 'rtl' : 'ltr'} onClick={(e) => e.stopPropagation()} style={{
        background: COLORS.card, borderRadius: 10, width: '100%', maxWidth: 380,
        padding: '28px 24px', textAlign: isRTL ? 'right' : 'left',
      }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: `1.5px solid ${COLORS.line}` }}>
          {[['login', t.tab_login], ['signup', t.tab_signup]].map(([key, label]) => (
            <button key={key} onClick={() => { setMode(key); setError(''); }} className="buy-btn" style={{
              background: 'transparent', border: 'none', padding: '8px 4px', marginInlineEnd: 18,
              fontSize: 14, fontWeight: 600,
              color: mode === key ? COLORS.brassDark : COLORS.inkSoft,
              borderBottom: mode === key ? `2.5px solid ${COLORS.brass}` : '2.5px solid transparent',
              marginBottom: -2,
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <Field label={t.name_label} required>
              <input className="buy-input" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
          )}
          <Field label={t.email_label} required>
            <input className="buy-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com" onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
          </Field>
          {mode === 'signup' && (
            <Field label={t.phone_field_optional}>
              <input className="buy-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
          )}

          {error && <div style={{ fontSize: 12.5, color: COLORS.rose }}>{error}</div>}

          <button onClick={handleSubmit} disabled={submitting} className="buy-btn stamp-btn" style={{
            background: COLORS.brass, color: '#fff', borderRadius: 6, padding: '11px',
            fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {submitting && <Loader2 size={14} className="spin" />}
            {mode === 'signup' ? t.create_account_btn : t.log_in_btn}
          </button>

          <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }} className="buy-btn" style={{
            background: 'transparent', border: 'none', color: COLORS.teal, fontSize: 12.5, fontWeight: 600, padding: 0,
          }}>
            {mode === 'signup' ? t.switch_to_login : t.switch_to_signup}
          </button>
        </div>
      </div>
    </div>
  );
}

function MyOrdersView({ t, lang, isRTL, currentUser, orders, loading, onBack }) {
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ padding: '24px', textAlign: isRTL ? 'right' : 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StampLogo size={30} />
          <div className="buy-display" style={{ fontSize: 20, fontWeight: 700 }}>{t.my_orders_title}</div>
        </div>
        <button onClick={onBack} className="buy-btn" style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'transparent',
          border: `1.5px solid ${COLORS.line}`, borderRadius: 6, padding: '8px 14px',
          fontSize: 12.5, fontWeight: 600, color: COLORS.inkSoft,
        }}>
          <ArrowLeft size={13} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
          {t.back_to_shop}
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.inkSoft, fontSize: 13 }}>
          <Loader2 size={14} className="spin" /> {t.loading}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div style={{ background: COLORS.card, borderRadius: 10, padding: '36px 24px', textAlign: 'center' }}>
          <div className="buy-display" style={{ fontSize: 17, fontWeight: 700 }}>{t.my_orders_empty_title}</div>
          <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 6 }}>{t.my_orders_empty_body}</div>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div style={{ display: 'grid', gap: 12 }}>
          {orders.map(o => (
            <div key={o.id} className="ticket-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{o.productName}</div>
                <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 3 }}>{o.location}</div>
              </div>
              <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                <div className="buy-mono" style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.brassDark }}>{o.id}</div>
                <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 3 }}>
                  {new Date(o.timestamp).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPanel({ t, lang, isRTL, orders, ordersLoading, products, productsLoading, onAddProduct, onRemoveProduct, onBack }) {
  const [tab, setTab] = useState('orders');

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ padding: '24px', textAlign: isRTL ? 'right' : 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StampLogo size={30} />
          <div className="buy-display" style={{ fontSize: 20, fontWeight: 700 }}>{t.admin_title}</div>
        </div>
        <button onClick={onBack} className="buy-btn" style={{
          background: 'transparent', border: `1.5px solid ${COLORS.line}`, borderRadius: 6,
          padding: '8px 14px', fontSize: 12.5, fontWeight: 600, color: COLORS.inkSoft,
        }}>
          {t.back_to_shop}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: `1.5px solid ${COLORS.line}` }}>
        {[['orders', t.admin_tab_orders], ['products', t.admin_tab_products]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className="buy-btn" style={{
            background: 'transparent', border: 'none', padding: '10px 6px', marginInlineEnd: 18,
            fontSize: 13.5, fontWeight: 600,
            color: tab === key ? COLORS.brassDark : COLORS.inkSoft,
            borderBottom: tab === key ? `2.5px solid ${COLORS.brass}` : '2.5px solid transparent',
            marginBottom: -2,
          }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'orders' && <OrdersTab t={t} lang={lang} isRTL={isRTL} orders={orders} loading={ordersLoading} />}
      {tab === 'products' && (
        <ProductsTab t={t} lang={lang} isRTL={isRTL} products={products} loading={productsLoading}
          onAddProduct={onAddProduct} onRemoveProduct={onRemoveProduct} />
      )}
    </div>
  );
}

function OrdersTab({ t, lang, isRTL, orders, loading }) {
  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.inkSoft, fontSize: 13 }}>
      <Loader2 size={14} className="spin" /> {t.loading}
    </div>;
  }
  if (orders.length === 0) {
    return (
      <div style={{ background: COLORS.card, borderRadius: 10, padding: '36px 24px', textAlign: 'center' }}>
        <div className="buy-display" style={{ fontSize: 17, fontWeight: 700 }}>{t.admin_empty_title}</div>
        <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 6 }}>{t.admin_empty_body}</div>
      </div>
    );
  }
  return (
    <div style={{ background: COLORS.card, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px dashed ${COLORS.line}` }}>
              {[t.col_ticket, t.col_product, t.col_buyer, t.col_phones, t.col_location, t.col_notes, t.col_time].map((h, i) => (
                <th key={i} style={{
                  textAlign: isRTL ? 'right' : 'left', padding: '12px 14px',
                  color: COLORS.inkSoft, fontWeight: 600, fontSize: 11.5,
                  textTransform: 'uppercase', letterSpacing: 0.4, whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                <td className="buy-mono" style={{ padding: '12px 14px', fontWeight: 500, whiteSpace: 'nowrap' }}>{o.id}</td>
                <td style={{ padding: '12px 14px' }}>
                  {o.productName}
                  <div className="buy-mono" style={{ fontSize: 11.5, color: COLORS.inkSoft }}>{formatPrice(o.price, lang)}</div>
                </td>
                <td style={{ padding: '12px 14px', maxWidth: 160 }}>
                  {o.buyerName ? (
                    <>
                      <div>{o.buyerName}</div>
                      <div style={{ fontSize: 11.5, color: COLORS.inkSoft }}>{o.buyerEmail}</div>
                    </>
                  ) : (
                    <span style={{ color: COLORS.inkSoft }}>{t.guest_label}</span>
                  )}
                </td>
                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                  <div>{o.phone1}</div>
                  {o.phone2 && <div style={{ color: COLORS.inkSoft, fontSize: 12 }}>{o.phone2}</div>}
                </td>
                <td style={{ padding: '12px 14px', maxWidth: 180 }}>{o.location}</td>
                <td style={{ padding: '12px 14px', maxWidth: 200, color: COLORS.inkSoft }}>
                  {o.notes && o.notes.length > 0 ? o.notes.join(' · ') : '—'}
                </td>
                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: COLORS.inkSoft, fontSize: 12 }}>
                  {new Date(o.timestamp).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductsTab({ t, lang, isRTL, products, loading, onAddProduct, onRemoveProduct }) {
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [price, setPrice] = useState('');
  const [icon, setIcon] = useState('package');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  async function handleAdd() {
    if (!nameEn.trim() || !nameAr.trim() || !price || Number(price) <= 0) {
      setError(t.product_fields_required);
      return;
    }
    setError(''); setAdding(true);
    const newProduct = {
      id: makeProductId(), icon, price: Number(price),
      imageUrl: imageUrl.trim(), videoUrl: videoUrl.trim(),
      name: { en: nameEn.trim(), ar: nameAr.trim() },
      desc: { en: descEn.trim(), ar: descAr.trim() },
    };
    const ok = await onAddProduct(newProduct);
    setAdding(false);
    if (ok) {
      setNameEn(''); setNameAr(''); setDescEn(''); setDescAr(''); setPrice(''); setIcon('package'); setImageUrl(''); setVideoUrl('');
    } else {
      setError(t.product_fields_required);
    }
  }

  async function handleRemove(id) {
    setRemoving(true);
    await onRemoveProduct(id);
    setRemoving(false);
    setConfirmingRemove(null);
  }

  return (
    <div>
      <div style={{ background: COLORS.card, borderRadius: 10, padding: '20px', marginBottom: 24 }}>
        <div className="buy-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>{t.new_product_title}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label={t.product_name_en}><input className="buy-input" value={nameEn} onChange={(e) => setNameEn(e.target.value)} /></Field>
          <Field label={t.product_name_ar}><input className="buy-input" dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} /></Field>
          <Field label={t.product_desc_en}><input className="buy-input" value={descEn} onChange={(e) => setDescEn(e.target.value)} /></Field>
          <Field label={t.product_desc_ar}><input className="buy-input" dir="rtl" value={descAr} onChange={(e) => setDescAr(e.target.value)} /></Field>
          <Field label={t.product_price}><input className="buy-input" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
          <Field label={t.product_icon}>
            <select className="buy-input" value={icon} onChange={(e) => setIcon(e.target.value)}>
              {ICON_OPTIONS.map(opt => <option key={opt.key} value={opt.key}>{opt.label[lang]}</option>)}
            </select>
          </Field>
          <Field label={t.image_url_label}><input className="buy-input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" /></Field>
          <Field label={t.video_url_label}><input className="buy-input" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…" /></Field>
        </div>
        {error && <div style={{ fontSize: 12.5, color: COLORS.rose, marginTop: 10 }}>{error}</div>}
        <button onClick={handleAdd} disabled={adding} className="buy-btn stamp-btn" style={{
          background: COLORS.brass, color: '#fff', borderRadius: 6, padding: '10px 18px',
          fontSize: 13.5, fontWeight: 700, marginTop: 14, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {adding ? <Loader2 size={14} className="spin" /> : <Plus size={14} />}
          {t.add_product}
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.inkSoft, fontSize: 13 }}>
          <Loader2 size={14} className="spin" /> {t.loading}
        </div>
      )}
      {!loading && products.length === 0 && <div style={{ fontSize: 13, color: COLORS.inkSoft }}>{t.no_products}</div>}

      {!loading && products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {products.map(p => {
            const Icon = ICONS[p.icon] || Package;
            return (
              <div key={p.id} style={{ background: COLORS.card, borderRadius: 8, overflow: 'hidden' }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name[lang]} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                ) : null}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    {!p.imageUrl && (
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: COLORS.paper,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Icon size={16} color={COLORS.teal} />
                      </div>
                    )}
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name[lang]}</div>
                  </div>
                  <div className="buy-mono" style={{ fontSize: 13, marginBottom: 10 }}>{formatPrice(p.price, lang)}</div>

                  {confirmingRemove === p.id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleRemove(p.id)} disabled={removing} className="buy-btn" style={{
                        background: COLORS.rose, color: '#fff', borderRadius: 6, padding: '7px 10px', fontSize: 12, fontWeight: 700, flex: 1,
                      }}>{t.yes_remove}</button>
                      <button onClick={() => setConfirmingRemove(null)} className="buy-btn" style={{
                        background: 'transparent', border: `1.5px solid ${COLORS.line}`, borderRadius: 6,
                        padding: '7px 10px', fontSize: 12, fontWeight: 600, color: COLORS.inkSoft, flex: 1,
                      }}>{t.keep}</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmingRemove(p.id)} className="buy-btn" style={{
                      display: 'flex', alignItems: 'center', gap: 6, background: 'transparent',
                      border: `1.5px solid ${COLORS.line}`, borderRadius: 6, padding: '7px 10px',
                      fontSize: 12, fontWeight: 600, color: COLORS.rose,
                    }}>
                      <Trash2 size={13} /> {t.remove}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
