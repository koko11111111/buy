// Firebase project setup — this file just connects the app to your
// Firebase project. Nothing else in the app needs to change if you
// ever swap in a different project: just replace the config below.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDscfjRQyBNDhAKMBhCCmdj8OTFeb_L3Yo",
  authDomain: "sanatio-c4122.firebaseapp.com",
  projectId: "sanatio-c4122",
  storageBucket: "sanatio-c4122.firebasestorage.app",
  messagingSenderId: "580426949606",
  appId: "1:580426949606:web:4519fbccfb0e21db4cec27",
  measurementId: "G-CKG9HE5QXG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
