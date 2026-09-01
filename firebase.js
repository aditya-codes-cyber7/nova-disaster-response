// Firebase SDK imports

import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Firebase configuration

const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain: "nova-disaster-response.firebaseapp.com",

  projectId: "nova-disaster-response",

  storageBucket: "nova-disaster-response.firebasestorage.app",

  messagingSenderId: "275029136991",

  appId: "YOUR_APP_ID",

  measurementId: "G-VXLCYGF00T"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);


// Initialize Firestore

const db = getFirestore(app);


// Export everything we need

export {
  db,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
};
