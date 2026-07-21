/* =====================================================================
   BUY â€” a bilingual (EN/AR) product ordering site with accounts and an
   admin panel, built with plain HTML/CSS/JS + Firebase.

   DATA: Firebase Authentication (real, secure login) + Firestore
   (shared database â€” every device/browser sees the same products,
   orders, and accounts). See README.md for the security rules to
   paste into your Firebase console.
   ===================================================================== */

import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup,
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import {
  collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, query, where,
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

/* ---------------------------------------------------------------------
   CONFIG â€” edit these two things for your real store.
--------------------------------------------------------------------- */
const ADMIN_EMAILS = ['kokomina946@gmail.com', 'patrick.kimo2010@gmail.com', 'yassaking687@gmail.com'];
const SUPPORT_PHONE = '01226754491';
const PHONE_PATTERN = /^01[0125]\d{8}$/; // Egyptian mobile: 01 + network digit + 8 digits, 11 total

const DEFAULT_PRODUCTS = [
  { id: 'p1', code: 'LMP-01', category: 'Home', price: 1450, imageUrl: '', videoUrl: '', name: { en: 'Cedar desk lamp', ar: 'Ù…ØµØ¨Ø§Ø­ Ù…ÙƒØªØ¨ Ø®Ø´Ø¨ Ø§Ù„Ø£Ø±Ø²' }, desc: { en: 'Warm brass fitting, adjustable arm.', ar: 'ØªØ±ÙƒÙŠØ¨ Ù†Ø­Ø§Ø³ÙŠ Ø¯Ø§ÙØ¦ØŒ Ø°Ø±Ø§Ø¹ Ù‚Ø§Ø¨Ù„ Ù„Ù„ØªØ¹Ø¯ÙŠÙ„.' } },
  { id: 'p2', code: 'CFF-01', category: 'Kitchen', price: 620, imageUrl: '', videoUrl: '', name: { en: 'Pour-over coffee set', ar: 'Ø·Ù‚Ù… Ù‚Ù‡ÙˆØ© Ù…Ù‚Ø·Ø±Ø© ÙŠØ¯ÙˆÙŠÙ‹Ø§' }, desc: { en: 'Ceramic dripper, glass carafe.', ar: 'Ù…ØµÙØ§Ø© Ø³ÙŠØ±Ø§Ù…ÙŠÙƒØŒ Ø¥Ø¨Ø±ÙŠÙ‚ Ø²Ø¬Ø§Ø¬ÙŠ.' } },
  { id: 'p3', code: 'WTC-01', category: 'Accessories', price: 2300, imageUrl: '', videoUrl: '', name: { en: 'Field watch', ar: 'Ø³Ø§Ø¹Ø© Ù…ÙŠØ¯Ø§Ù†ÙŠØ©' }, desc: { en: 'Stainless case, canvas strap.', ar: 'Ù‡ÙŠÙƒÙ„ Ø³ØªØ§Ù†Ù„Ø³ØŒ Ø³ÙˆØ§Ø± Ù‚Ù…Ø§Ø´ÙŠ.' } },
  { id: 'p4', code: 'BAG-01', category: 'Accessories', price: 980, imageUrl: '', videoUrl: '', name: { en: 'Canvas day pack', ar: 'Ø­Ù‚ÙŠØ¨Ø© Ø¸Ù‡Ø± Ù‚Ù…Ø§Ø´ÙŠØ©' }, desc: { en: 'Water-resistant, leather trims.', ar: 'Ù…Ù‚Ø§ÙˆÙ…Ø© Ù„Ù„Ù…Ø§Ø¡ØŒ Ø­ÙˆØ§Ù Ø¬Ù„Ø¯ÙŠØ©.' } },
  { id: 'p5', code: 'AUD-01', category: 'Electronics', price: 1750, imageUrl: '', videoUrl: '', name: { en: 'Studio headphones', ar: 'Ø³Ù…Ø§Ø¹Ø§Øª Ø§Ø³ØªÙˆØ¯ÙŠÙˆ' }, desc: { en: 'Over-ear, foldable frame.', ar: 'Ù…Ø­ÙŠØ·Ø© Ø¨Ø§Ù„Ø£Ø°Ù†ØŒ Ù‡ÙŠÙƒÙ„ Ù‚Ø§Ø¨Ù„ Ù„Ù„Ø·ÙŠ.' } },
  { id: 'p6', code: 'BOK-01', category: 'Stationery', price: 340, imageUrl: '', videoUrl: '', name: { en: 'Leather journal', ar: 'Ø¯ÙØªØ± Ø¬Ù„Ø¯ÙŠ' }, desc: { en: '200 pages, dotted grid.', ar: 'Ù¢Ù Ù  ØµÙØ­Ø©ØŒ Ø´Ø¨ÙƒØ© Ù…Ù†Ù‚Ø·Ø©.' } },
];

/* ---------------------------------------------------------------------
   ICONS â€” small hand-rolled SVGs, no external icon library needed.
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
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
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
    brand: 'Buy', tagline: 'A stamped ticket for every order â€” simple and honest.',
    buy: 'Buy', modal_title: 'Fill your ticket',
    search_ph: 'Search productsâ€¦', filter_all: 'All Categories',
    category_label: 'Category', code_label: 'Product Code',
    edit: 'Edit', save_changes: 'Save changes', edit_product_title: 'Edit Product',
    phone1: 'Phone number', phone2: 'Second phone (optional)',
    location: 'Delivery location', location_ph: 'Neighborhood, street, landmarkâ€¦',
    use_location: 'Use my current location', locating: 'Locatingâ€¦',
    location_denied: "Couldn't get your location. Type it in instead.",
    notes: 'Notes', add_note: 'Add a note', note_ph: 'e.g. Call before arriving',
    cod_note: 'Pay in cash when your order arrives.',
    submit: 'Stamp my order', submitting: 'Stampingâ€¦', cancel: 'Cancel',
    required: 'Phone number and location are required.',
    phone_invalid: 'Enter an 11-digit number like 01226754491.',
    success_title: 'Order stamped', success_body: 'Ticket number',
    success_sub: "We'll reach out on the number you gave us.", back_to_shop: 'Back to shop',
    admin_title: 'Ledger', admin_tab_orders: 'Orders', admin_tab_products: 'Products',
    admin_empty_title: 'No tickets yet', admin_empty_body: 'New orders will show up here the moment someone stamps one.',
    col_ticket: 'Ticket', col_product: 'Product', col_buyer: 'Buyer', col_phones: 'Phones', col_location: 'Location', col_notes: 'Notes', col_time: 'Time', col_status: 'Status',
    status_pending: 'Pending', status_done: 'Done', status_cancelled: 'Cancelled',
    mark_done: 'Mark as done', mark_pending: 'Mark as pending',
    undo_ticket: 'Cancel this order', undo_ask: 'Cancel this order?', undo_yes: 'Yes, cancel it', undo_keep: 'Never mind',
    support_label: 'Need help with this order?', call_support: 'Call support',
    guest_label: 'Guest', loading: 'Loadingâ€¦',
    product_name_en: 'Name (English)', product_name_ar: 'Name (Arabic)',
    product_desc_en: 'Description (English)', product_desc_ar: 'Description (Arabic)',
    product_price: 'Price (EGP)', image_url_label: 'Image URL', video_url_label: 'Video URL (optional)',
    watch_video: 'Watch video',
    add_product: 'Add product', product_fields_required: 'Fill in both names and a price before adding.',
    no_products: 'No products yet. Add your first one below.',
    remove: 'Remove', yes_remove: 'Yes, remove', keep: 'Keep it', new_product_title: 'Add a product',
    sign_in: 'Sign in', tab_signup: 'Sign up', tab_login: 'Log in',
    continue_with_google: 'Continue with Google', or_divider: 'or',
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
    brand: 'Ø§Ø´ØªØ±Ù', tagline: 'ØªØ°ÙƒØ±Ø© Ù…Ø®ØªÙˆÙ…Ø© Ù„ÙƒÙ„ Ø·Ù„Ø¨ â€” Ø¨Ø³ÙŠØ·Ø© ÙˆØµØ§Ø¯Ù‚Ø©.',
    buy: 'Ø§Ø´ØªØ±Ù', modal_title: 'Ø§Ù…Ù„Ø£ ØªØ°ÙƒØ±ØªÙƒ',
    search_ph: 'Ø§Ø¨Ø­Ø« Ø¹Ù† Ù…Ù†ØªØ¬â€¦', filter_all: 'ÙƒÙ„ Ø§Ù„ÙØ¦Ø§Øª',
    category_label: 'Ø§Ù„ÙØ¦Ø©', code_label: 'ÙƒÙˆØ¯ Ø§Ù„Ù…Ù†ØªØ¬',
    edit: 'ØªØ¹Ø¯ÙŠÙ„', save_changes: 'Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª', edit_product_title: 'ØªØ¹Ø¯ÙŠÙ„ Ù…Ù†ØªØ¬',
    phone1: 'Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ', phone2: 'Ø±Ù‚Ù… Ù‡Ø§ØªÙ Ø«Ø§Ù†Ù (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)',
    location: 'Ù…ÙˆÙ‚Ø¹ Ø§Ù„ØªÙˆØµÙŠÙ„', location_ph: 'Ø§Ù„Ø­ÙŠØŒ Ø§Ù„Ø´Ø§Ø±Ø¹ØŒ Ø£Ù‚Ø±Ø¨ Ù…Ø¹Ù„Ù…â€¦',
    use_location: 'Ø§Ø³ØªØ®Ø¯Ù… Ù…ÙˆÙ‚Ø¹ÙŠ Ø§Ù„Ø­Ø§Ù„ÙŠ', locating: 'Ø¬Ø§Ø±Ù ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ù…ÙˆÙ‚Ø¹â€¦',
    location_denied: 'ØªØ¹Ø°Ù‘Ø± ØªØ­Ø¯ÙŠØ¯ Ù…ÙˆÙ‚Ø¹Ùƒ. Ø§ÙƒØªØ¨Ù‡ ÙŠØ¯ÙˆÙŠÙ‹Ø§.',
    notes: 'Ù…Ù„Ø§Ø­Ø¸Ø§Øª', add_note: 'Ø¥Ø¶Ø§ÙØ© Ù…Ù„Ø§Ø­Ø¸Ø©', note_ph: 'Ù…Ø«Ø§Ù„: Ø§ØªØµÙ„ Ù‚Ø¨Ù„ Ø§Ù„ÙˆØµÙˆÙ„',
    cod_note: 'Ø§Ù„Ø¯ÙØ¹ Ù†Ù‚Ø¯Ù‹Ø§ Ø¹Ù†Ø¯ Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ø·Ù„Ø¨.',
    submit: 'Ø§Ø®ØªÙ… Ø·Ù„Ø¨ÙŠ', submitting: 'Ø¬Ø§Ø±Ù Ø§Ù„Ø®ØªÙ…â€¦', cancel: 'Ø¥Ù„ØºØ§Ø¡',
    required: 'Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ ÙˆØ§Ù„Ù…ÙˆÙ‚Ø¹ Ù…Ø·Ù„ÙˆØ¨Ø§Ù†.',
    phone_invalid: 'Ø£Ø¯Ø®Ù„ Ø±Ù‚Ù…Ù‹Ø§ Ù…ÙƒÙˆÙ†Ù‹Ø§ Ù…Ù† Ù¡Ù¡ Ø±Ù‚Ù…Ù‹Ø§ Ù…Ø«Ù„ 01226754491.',
    success_title: 'ØªÙ… Ø®ØªÙ… Ø§Ù„Ø·Ù„Ø¨', success_body: 'Ø±Ù‚Ù… Ø§Ù„ØªØ°ÙƒØ±Ø©',
    success_sub: 'Ø³Ù†ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ Ø¹Ù„Ù‰ Ø§Ù„Ø±Ù‚Ù… Ø§Ù„Ø°ÙŠ Ø£Ø¯Ø®Ù„ØªÙ‡.', back_to_shop: 'Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ù…ØªØ¬Ø±',
    admin_title: 'Ø§Ù„Ø³Ø¬Ù„', admin_tab_orders: 'Ø§Ù„Ø·Ù„Ø¨Ø§Øª', admin_tab_products: 'Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª',
    admin_empty_title: 'Ù„Ø§ ØªÙˆØ¬Ø¯ ØªØ°Ø§ÙƒØ± Ø¨Ø¹Ø¯', admin_empty_body: 'Ø³ØªØ¸Ù‡Ø± Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© Ù‡Ù†Ø§ ÙÙˆØ± Ø®ØªÙ…Ù‡Ø§.',
    col_ticket: 'Ø§Ù„ØªØ°ÙƒØ±Ø©', col_product: 'Ø§Ù„Ù…Ù†ØªØ¬', col_buyer: 'Ø§Ù„Ù…Ø´ØªØ±ÙŠ', col_phones: 'Ø§Ù„Ù‡ÙˆØ§ØªÙ', col_location: 'Ø§Ù„Ù…ÙˆÙ‚Ø¹', col_notes: 'Ù…Ù„Ø§Ø­Ø¸Ø§Øª', col_time: 'Ø§Ù„ÙˆÙ‚Øª', col_status: 'Ø§Ù„Ø­Ø§Ù„Ø©',
    status_pending: 'Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±', status_done: 'ØªÙ… Ø§Ù„ØªÙ†ÙÙŠØ°', status_cancelled: 'Ù…Ù„ØºÙŠ',
    mark_done: 'ØªØ­Ø¯ÙŠØ¯ ÙƒÙ…ÙƒØªÙ…Ù„', mark_pending: 'Ø¥Ø¹Ø§Ø¯Ø© Ø¥Ù„Ù‰ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±',
    undo_ticket: 'Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø·Ù„Ø¨', undo_ask: 'Ù‡Ù„ ØªØ±ÙŠØ¯ Ø¥Ù„ØºØ§Ø¡ Ù‡Ø°Ø§ Ø§Ù„Ø·Ù„Ø¨ØŸ', undo_yes: 'Ù†Ø¹Ù…ØŒ Ø£Ù„ØºÙ Ø§Ù„Ø·Ù„Ø¨', undo_keep: 'ØªØ±Ø§Ø¬Ø¹',
    support_label: 'ØªØ­ØªØ§Ø¬ Ù…Ø³Ø§Ø¹Ø¯Ø© Ø¨Ø®ØµÙˆØµ Ù‡Ø°Ø§ Ø§Ù„Ø·Ù„Ø¨ØŸ', call_support: 'Ø§ØªØµÙ„ Ø¨Ø§Ù„Ø¯Ø¹Ù…',
    guest_label: 'Ø²Ø§Ø¦Ø±', loading: 'Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù…ÙŠÙ„â€¦',
    product_name_en: 'Ø§Ù„Ø§Ø³Ù… (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)', product_name_ar: 'Ø§Ù„Ø§Ø³Ù… (Ø¹Ø±Ø¨ÙŠ)',
    product_desc_en: 'Ø§Ù„ÙˆØµÙ (Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠ)', product_desc_ar: 'Ø§Ù„ÙˆØµÙ (Ø¹Ø±Ø¨ÙŠ)',
    product_price: 'Ø§Ù„Ø³Ø¹Ø± (Ø¬Ù†ÙŠÙ‡)', image_url_label: 'Ø±Ø§Ø¨Ø· Ø§Ù„ØµÙˆØ±Ø©', video_url_label: 'Ø±Ø§Ø¨Ø· Ø§Ù„ÙÙŠØ¯ÙŠÙˆ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)',
    watch_video: 'Ù…Ø´Ø§Ù‡Ø¯Ø© Ø§Ù„ÙÙŠØ¯ÙŠÙˆ',
    add_product: 'Ø¥Ø¶Ø§ÙØ© Ù…Ù†ØªØ¬', product_fields_required: 'Ø£Ø¯Ø®Ù„ Ø§Ù„Ø§Ø³Ù…ÙŠÙ† ÙˆØ§Ù„Ø³Ø¹Ø± Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø¶Ø§ÙØ©.',
    no_products: 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù†ØªØ¬Ø§Øª Ø¨Ø¹Ø¯. Ø£Ø¶Ù Ø£ÙˆÙ„ Ù…Ù†ØªØ¬ Ø¨Ø§Ù„Ø£Ø³ÙÙ„.',
    remove: 'Ø¥Ø²Ø§Ù„Ø©', yes_remove: 'Ù†Ø¹Ù…ØŒ Ø¥Ø²Ø§Ù„Ø©', keep: 'Ø§Ù„Ø§Ø­ØªÙØ§Ø¸ Ø¨Ù‡', new_product_title: 'Ø¥Ø¶Ø§ÙØ© Ù…Ù†ØªØ¬',
    sign_in: 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„', tab_signup: 'Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨', tab_login: 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„',
    continue_with_google: 'Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ø¹Ø¨Ø± Ø¬ÙˆØ¬Ù„', or_divider: 'Ø£Ùˆ',
    name_label: 'Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„', email_label: 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ', phone_field_optional: 'Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)', password_label: 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±',
    create_account_btn: 'Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨', log_in_btn: 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„',
    switch_to_login: 'Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù„ÙØ¹Ù„ØŸ Ø³Ø¬Ù‘Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„', switch_to_signup: 'Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ØŸ Ø£Ù†Ø´Ø¦ Ø­Ø³Ø§Ø¨Ù‹Ø§',
    signup_error_exists: 'ÙŠÙˆØ¬Ø¯ Ø­Ø³Ø§Ø¨ Ø¨Ù‡Ø°Ø§ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø¨Ø§Ù„ÙØ¹Ù„.',
    login_error_missing: 'Ù„Ù… Ù†Ø¹Ø«Ø± Ø¹Ù„Ù‰ Ø­Ø³Ø§Ø¨ Ø¨Ù‡Ø°Ø§ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ.',
    name_email_required: 'Ø§Ù„Ø§Ø³Ù… ÙˆØ§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ù…Ø·Ù„ÙˆØ¨Ø§Ù†.', email_required: 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ù…Ø·Ù„ÙˆØ¨.',
    password_required: 'ÙŠØ¬Ø¨ Ø£Ù„Ø§ ØªÙ‚Ù„ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø¹Ù† Ù¦ Ø£Ø­Ø±Ù.', wrong_password: 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± ØµØ­ÙŠØ­Ø©.',
    my_orders_link: 'Ø·Ù„Ø¨Ø§ØªÙŠ', admin_ledger_link: 'Ø³Ø¬Ù„ Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©', log_out_link: 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬',
    my_orders_title: 'Ø·Ù„Ø¨Ø§ØªÙŠ', my_orders_empty_title: 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø¨Ø¹Ø¯',
    my_orders_empty_body: 'Ø³ØªØ¸Ù‡Ø± Ù‡Ù†Ø§ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„ØªÙŠ ØªÙ‚ÙˆÙ… Ø¨Ù‡Ø§ Ø£Ø«Ù†Ø§Ø¡ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„.',
  },
};

/* ---------------------------------------------------------------------
   DATABASE (Firestore-backed)
   Each product/order is its own document â€” never one big blob â€” so two
   people writing at the same time can't clobber each other's data.
--------------------------------------------------------------------- */
const DB = {
  async getProducts() {
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      try {
        for (const p of DEFAULT_PRODUCTS) {
          const { id, ...data } = p;
          await setDoc(doc(db, 'products', id), data);
        }
      } catch (seedErr) {
        console.warn('Could not seed starter products (needs an admin to load the site once):', seedErr);
      }
      return DEFAULT_PRODUCTS;
    } catch (readErr) {
      console.error('Could not load products from Firestore:', readErr);
      return DEFAULT_PRODUCTS;
    }
  },
  async addProduct(product) {
    const { id, ...data } = product;
    await setDoc(doc(db, 'products', id), data);
    return product;
  },
  async updateProduct(id, updates) {
    await updateDoc(doc(db, 'products', id), updates);
  },
  async removeProduct(id) {
    await deleteDoc(doc(db, 'products', id));
  },
  async getAllOrders() {
    const q = query(collection(db, 'orders'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },
  async getOrdersByBuyer(email) {
    const q = query(collection(db, 'orders'), where('buyerEmail', '==', email));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },
  async addOrder(order) {
    const { id, ...data } = order;
    await setDoc(doc(db, 'orders', id), data);
    return order;
  },
  async updateOrderStatus(id, status) {
    await updateDoc(doc(db, 'orders', id), { status });
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
  lang: 'ar',
  view: 'shop', // shop | admin | myorders
  adminTab: 'orders',
  products: [],
  orders: [],
  currentUser: null,
  searchQuery: '',
  selectedCategory: 'all'
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
        <button class="pill-btn" data-action="toggle-lang">${icon('globe', 14)} ${state.lang === 'en' ? 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©' : 'English'}</button>
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

function googleIconSvg() {
  return `<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>`;
}

/* ---------------------------------------------------------------------
   RENDER: SHOP
--------------------------------------------------------------------- */
function renderProductGridOnly() {
  const q = state.searchQuery.toLowerCase();
  const filteredProducts = state.products.filter(p => {
    const matchesSearch = p.name[state.lang].toLowerCase().includes(q) || 
                          p.desc[state.lang].toLowerCase().includes(q);
    const matchesCategory = state.selectedCategory === 'all' || p.category === state.selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cards = filteredProducts.map(p => `
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

  return cards.length ? cards : `<div class="empty-body" style="grid-column: 1/-1; text-align:center; padding:40px;">No products found.</div>`;
}

function renderShop() {
  const categories = ['all', ...new Set(state.products.map(p => p.category).filter(Boolean))];
  
  const filterHtml = `
    <div class="shop-filters">
      <div class="input-icon-wrap" style="flex:1;">
        ${icon('search', 15)}
        <input type="text" class="input" id="search-input" placeholder="${t('search_ph')}" value="${escapeHtml(state.searchQuery)}">
      </div>
      <select class="input" id="category-select" style="max-width:200px;">
        ${categories.map(c => `<option value="${escapeHtml(c)}" ${state.selectedCategory === c ? 'selected' : ''}>${c === 'all' ? t('filter_all') : escapeHtml(c)}</option>`).join('')}
      </select>
    </div>
  `;

  return `
    ${renderHeader()}
    <section class="hero"><h1 class="display">${escapeHtml(t('tagline'))}</h1></section>
    <section class="filter-section" style="padding: 0 24px 20px;">${filterHtml}</section>
    <section class="product-grid" id="main-product-grid">${renderProductGridOnly()}</section>`;
}

/* ---------------------------------------------------------------------
   RENDER: MY ORDERS
--------------------------------------------------------------------- */
function renderMyOrders() {
  const mine = state.orders;
  const body = mine.length === 0
    ? `<div class="empty-box"><div class="empty-title display">${t('my_orders_empty_title')}</div><div class="empty-body">${t('my_orders_empty_body')}</div></div>`
    : `<div class="my-orders-list">${mine.map(o => {
        const status = o.status || 'pending';
        return `
        <div class="ticket-card" data-order-card="${o.id}">
          <div class="my-order-row">
            <div>
              <div class="product-name">${escapeHtml(o.productName)}</div>
              <div class="product-desc">${escapeHtml(o.location)}</div>
            </div>
            <div style="text-align:end">
              <div class="mono" style="font-size:12.5px;font-weight:500;color:var(--brass-dark)">${o.id}</div>
              <div class="sub-cell">${formatTime(o.timestamp)}</div>
            </div>
          </div>
          <div class="ticket-divider"></div>
          <div style="padding:12px 18px 16px" data-order-footer="${o.id}">
            <span class="status-badge status-${status}">${t('status_' + status)}</span>
            ${status === 'pending' ? `<div style="margin-top:8px">
              <button class="outline-btn" style="color:var(--rose)" data-action="ask-undo" data-id="${o.id}">${t('undo_ticket')}</button>
            </div>` : ''}
            ${status === 'done' ? `<div class="support-note">
              ${t('support_label')}<br/>
              <a href="tel:${SUPPORT_PHONE}">${icon('phone', 12)} ${t('call_support')}: ${SUPPORT_PHONE}</a>
            </div>` : ''}
          </div>
        </div>`;
      }).join('')}</div>`;

  return `
    <div class="page">
      <div class="page-head">
        <div class="row gap-md">${stampLogoSvg(30)}<div class="page-title display">${t('my_orders_title')}</div></div>
        <button class="outline-btn" data-action="back-to-shop">${t('back_to_shop')}</button>
      </div>
      ${body}
    </div>`;
}

function askUndoOrder(id) {
  const zone = document.querySelector(`[data-order-footer="${id}"]`);
  if (!zone) return;
  const status = (state.orders.find(o => o.id === id) || {}).status || 'pending';
  zone.innerHTML = `
    <span class="status-badge status-${status}">${t('status_' + status)}</span>
    <div style="margin-top:8px">
      <div style="font-size:12.5px;color:var(--ink-soft);margin-bottom:6px">${t('undo_ask')}</div>
      <div class="confirm-row">
        <button class="danger-btn" data-action="confirm-undo" data-id="${id}">${t('undo_yes')}</button>
        <button class="outline-btn" data-action="cancel-undo" data-id="${id}">${t('undo_keep')}</button>
      </div>
    </div>`;
  zone.querySelector('[data-action="confirm-undo"]').addEventListener('click', () => confirmUndoOrder(id));
  zone.querySelector('[data-action="cancel-undo"]').addEventListener('click', () => {
    renderApp();
    wireMyOrdersEvents();
  });
}

async function confirmUndoOrder(id) {
  try {
    await DB.updateOrderStatus(id, 'cancelled');
    const o = state.orders.find(x => x.id === id);
    if (o) o.status = 'cancelled';
    renderApp();
    wireMyOrdersEvents();
  } catch (e) {
    console.error('Could not cancel order:', e);
  }
}

function wireMyOrdersEvents() {
  document.querySelectorAll('[data-action="ask-undo"]').forEach(btn => {
    btn.addEventListener('click', () => askUndoOrder(btn.dataset.id));
  });
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
  const rows = state.orders.map(o => {
    const status = o.status || 'pending';
    return `
    <tr>
      <td class="mono" style="font-weight:500;white-space:nowrap">${o.id}</td>
      <td>${escapeHtml(o.productName)}${o.productCode ? `<div class="sub-cell mono">${escapeHtml(o.productCode)}</div>` : ''}<div class="sub-cell mono">${formatPrice(o.price)}</div></td>
      <td style="max-width:160px">${o.buyerName ? `<div>${escapeHtml(o.buyerName)}</div><div class="sub-cell">${escapeHtml(o.buyerEmail)}</div>` : `<span style="color:var(--ink-soft)">${t('guest_label')}</span>`}</td>
      <td style="white-space:nowrap"><div>${escapeHtml(o.phone1)}</div>${o.phone2 ? `<div class="sub-cell">${escapeHtml(o.phone2)}</div>` : ''}</td>
      <td style="max-width:180px">${escapeHtml(o.location)}</td>
      <td style="max-width:200px;color:var(--ink-soft)">${o.notes && o.notes.length ? o.notes.map(escapeHtml).join(' Â· ') : 'â€”'}</td>
      <td style="white-space:nowrap;color:var(--ink-soft);font-size:12px">${formatTime(o.timestamp)}</td>
      <td style="white-space:nowrap">
        <span class="status-badge status-${status}">${t('status_' + status)}</span>
        ${status !== 'cancelled' ? `<div style="margin-top:6px">
          <button class="text-btn" data-action="toggle-status" data-id="${o.id}" data-next="${status === 'done' ? 'pending' : 'done'}">
            ${status === 'done' ? t('mark_pending') : t('mark_done')}
          </button>
        </div>` : ''}
      </td>
    </tr>`;
  }).join('');

  return `
    <div class="table-wrap"><div class="table-scroll"><table>
      <thead><tr>
        <th>${t('col_ticket')}</th><th>${t('col_product')}</th><th>${t('col_buyer')}</th>
        <th>${t('col_phones')}</th><th>${t('col_location')}</th><th>${t('col_notes')}</th><th>${t('col_time')}</th><th>${t('col_status')}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div></div>`;
}

async function toggleOrderStatus(id, nextStatus) {
  try {
    await DB.updateOrderStatus(id, nextStatus);
    const o = state.orders.find(x => x.id === id);
    if (o) o.status = nextStatus;
    document.getElementById('admin-tab-content').innerHTML = renderOrdersTab();
    wireOrdersTabEvents();
  } catch (e) {
    console.error('Could not update order status:', e);
  }
}

function wireOrdersTabEvents() {
  document.querySelectorAll('[data-action="toggle-status"]').forEach(btn => {
    btn.addEventListener('click', () => toggleOrderStatus(btn.dataset.id, btn.dataset.next));
  });
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
              <div>
                <div class="product-name" style="font-size:14px">${escapeHtml(p.name[state.lang])}</div>
                ${p.code ? `<div class="sub-cell mono">${escapeHtml(p.code)}</div>` : ''}
              </div>
            </div>
            <div class="mono" style="font-size:13px;margin-bottom:10px">${formatPrice(p.price)}</div>
            <div class="remove-zone" data-id="${p.id}" style="display:flex;gap:8px;">
              <button class="outline-btn row gap-sm" style="color:var(--ink);flex:1;" data-action="ask-edit" data-id="${p.id}">${icon('edit', 13)} ${t('edit')}</button>
              <button class="outline-btn row gap-sm" style="color:var(--rose);flex:1;" data-action="ask-remove" data-id="${p.id}">${icon('trash', 13)} ${t('remove')}</button>
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
        <div class="field"><label>${t('code_label')}</label><input class="input" id="np-code"/></div>
        <div class="field"><label>${t('category_label')}</label><input class="input" id="np-category"/></div>
        <div class="field"><label>${t('image_url_label')}</label><input class="input" id="np-image" placeholder="https://â€¦"/></div>
        <div class="field" style="grid-column:1/-1"><label>${t('video_url_label')}</label><input class="input" id="np-video" placeholder="https://â€¦"/></div>
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
   MODALS: BUY & EDIT
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
            <div class="input-icon-wrap">${icon('phone', 15)}<input class="input" id="buy-phone1" type="tel" inputmode="numeric" maxlength="11" placeholder="01226754491" value="${escapeHtml(prefillPhone)}"/></div>
          </div>
          <div class="field">
            <label>${t('phone2')}</label>
            <div class="input-icon-wrap">${icon('phone', 15)}<input class="input" id="buy-phone2" type="tel" inputmode="numeric" maxlength="11" placeholder="01226754491"/></div>
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
          <div class="cod-note">${icon('package', 14)} ${t('cod_note')}</div>
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
  if (!PHONE_PATTERN.test(phone1) || (phone2 && !PHONE_PATTERN.test(phone2))) {
    errEl.textContent = t('phone_invalid');
    errEl.hidden = false;
    return;
  }

  const order = {
    id: makeTicketNo(), productId: product.id, productCode: product.code || '', productName: product.name[state.lang], price: product.price,
    phone1, phone2, location, notes, status: 'pending',
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

function openEditProductModal(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="overlay" id="edit-overlay">
      <div class="modal wide" onclick="event.stopPropagation()">
        <div class="modal-head">
          <div class="modal-title display">${t('edit_product_title')}</div>
          <button class="close-btn" data-action="close-edit">${icon('x', 20)}</button>
        </div>
        <div class="modal-body form-grid">
          <div class="field"><label>${t('product_name_en')}</label><input class="input" id="ep-name-en" value="${escapeHtml(p.name.en)}"/></div>
          <div class="field"><label>${t('product_name_ar')}</label><input class="input" id="ep-name-ar" dir="rtl" value="${escapeHtml(p.name.ar)}"/></div>
          <div class="field"><label>${t('product_desc_en')}</label><input class="input" id="ep-desc-en" value="${escapeHtml(p.desc.en)}"/></div>
          <div class="field"><label>${t('product_desc_ar')}</label><input class="input" id="ep-desc-ar" dir="rtl" value="${escapeHtml(p.desc.ar)}"/></div>
          <div class="field"><label>${t('product_price')}</label><input class="input" id="ep-price" type="number" min="0" value="${p.price}"/></div>
          <div class="field"><label>${t('code_label')}</label><input class="input" id="ep-code" value="${escapeHtml(p.code || '')}"/></div>
          <div class="field"><label>${t('category_label')}</label><input class="input" id="ep-category" value="${escapeHtml(p.category || '')}"/></div>
          <div class="field"><label>${t('image_url_label')}</label><input class="input" id="ep-image" value="${escapeHtml(p.imageUrl || '')}"/></div>
          <div class="field" style="grid-column:1/-1"><label>${t('video_url_label')}</label><input class="input" id="ep-video" value="${escapeHtml(p.videoUrl || '')}"/></div>
          <div id="ep-error" class="error-text" style="grid-column:1/-1" hidden></div>
          <button class="brass-btn" id="ep-submit" style="grid-column:1/-1;margin-top:6px">${t('save_changes')}</button>
        </div>
      </div>
    </div>`;

  document.getElementById('edit-overlay').addEventListener('click', closeEditModal);
  document.querySelector('[data-action="close-edit"]').addEventListener('click', closeEditModal);
  document.getElementById('ep-submit').addEventListener('click', () => submitEditProduct(id));
}
function closeEditModal() { document.getElementById('modal-root').innerHTML = ''; }

async function submitEditProduct(id) {
  const nameEn = document.getElementById('ep-name-en').value.trim();
  const nameAr = document.getElementById('ep-name-ar').value.trim();
  const descEn = document.getElementById('ep-desc-en').value.trim();
  const descAr = document.getElementById('ep-desc-ar').value.trim();
  const price = Number(document.getElementById('ep-price').value);
  const code = document.getElementById('ep-code').value.trim();
  const category = document.getElementById('ep-category').value.trim();
  const imageUrl = document.getElementById('ep-image').value.trim();
  const videoUrl = document.getElementById('ep-video').value.trim();
  const errEl = document.getElementById('ep-error');
  const btn = document.getElementById('ep-submit');

  if (!nameEn || !nameAr || !price || price <= 0) {
    errEl.textContent = t('product_fields_required');
    errEl.hidden = false;
    return;
  }
  const updates = { code, category, price, imageUrl, videoUrl, name: { en: nameEn, ar: nameAr }, desc: { en: descEn, ar: descAr } };

  btn.disabled = true;
  try {
    await DB.updateProduct(id, updates);
    const idx = state.products.findIndex(x => x.id === id);
    if (idx !== -1) state.products[idx] = { ...state.products[idx], ...updates };
    closeEditModal();
    document.getElementById('admin-tab-content').innerHTML = renderProductsTab();
    wireProductsTabEvents();
  } catch (e) {
    errEl.textContent = t('product_fields_required');
    errEl.hidden = false;
    btn.disabled = false;
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
        <div class="auth-divider">${t('or_divider')}</div>
        <button class="google-btn" id="google-signin">${googleIconSvg()} ${t('continue_with_google')}</button>
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
  document.getElementById('google-signin').addEventListener('click', handleGoogleSignin);

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
      <div class="field"><label>${t('password_label')} <span class="req">*</span></label><input class="input" id="auth-password" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"/></div>
      ${m === 'signup' ? `<div class="field"><label>${t('phone_field_optional')}</label><input class="input" id="auth-phone" type="tel" inputmode="numeric" maxlength="11" placeholder="01226754491"/></div>` : ''}
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

  async function handleGoogleSignin() {
    const errEl = document.getElementById('auth-error');
    const googleBtn = document.getElementById('google-signin');
    googleBtn.disabled = true;
    const result = await loginWithGoogle();
    googleBtn.disabled = false;
    if (!result.ok) {
      if (result.error) { errEl.textContent = result.error; errEl.hidden = false; }
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

async function loginWithGoogle() {
  try {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    const existing = await DB.getUserProfile(cred.user.uid).catch(() => null);
    if (!existing) {
      await DB.setUserProfile(cred.user.uid, {
        name: cred.user.displayName || cred.user.email,
        email: cred.user.email,
        phone: '',
        createdAt: new Date().toISOString(),
      });
    }
    return { ok: true };
  } catch (e) {
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
      return { ok: false, error: '' }; // they just closed the popup â€” no need to alarm them
    }
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
    let profile = null;
    try { profile = await DB.getUserProfile(fbUser.uid); }
    catch (e) { console.warn('Could not load user profile:', e); }
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
  const code = document.getElementById('np-code').value.trim();
  const category = document.getElementById('np-category').value.trim();
  const imageUrl = document.getElementById('np-image').value.trim();
  const videoUrl = document.getElementById('np-video').value.trim();
  const errEl = document.getElementById('np-error');
  const addBtn = document.querySelector('[data-action="add-product"]');

  if (!nameEn || !nameAr || !price || price <= 0) {
    errEl.textContent = t('product_fields_required');
    errEl.hidden = false;
    return;
  }
  const product = { id: makeId('p'), code, category, price, imageUrl, videoUrl, name: { en: nameEn, ar: nameAr }, desc: { en: descEn, ar: descAr } };

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
    <div class="confirm-row" style="width:100%">
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
  document.querySelectorAll('[data-action="ask-edit"]').forEach(btn => {
    btn.addEventListener('click', () => openEditProductModal(btn.dataset.id));
  });
}

/* ---------------------------------------------------------------------
   GLOBAL EVENT DELEGATION
--------------------------------------------------------------------- */
document.addEventListener('input', (e) => {
  if (e.target.id === 'search-input') {
    state.searchQuery = e.target.value;
    const grid = document.getElementById('main-product-grid');
    if (grid) grid.innerHTML = renderProductGridOnly();
  }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'category-select') {
    state.selectedCategory = e.target.value;
    const grid = document.getElementById('main-product-grid');
    if (grid) grid.innerHTML = renderProductGridOnly();
  }
});

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
      try { state.orders = await DB.getOrdersByBuyer(state.currentUser.email); }
      catch (err) { console.error('Could not load your orders:', err); state.orders = []; }
      state.view = 'myorders';
      renderApp();
      wireMyOrdersEvents();
      break;
    case 'nav-admin':
      document.getElementById('account-menu').hidden = true;
      state.view = 'admin';
      state.adminTab = 'orders';
      try { state.orders = await DB.getAllOrders(); }
      catch (err) { console.error('Could not load orders:', err); state.orders = []; }
      renderApp();
      wireOrdersTabEvents();
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
      else wireOrdersTabEvents();
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
