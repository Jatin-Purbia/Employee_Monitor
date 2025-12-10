// Firebase Client Configuration
// This file contains the Firebase config for the frontend
// Copy this to your frontend Firebase initialization

export const firebaseConfig = {
  apiKey: "AIzaSyCBKXGBemgEJMXQfufsA8Ckl0k_1yV4KKo",
  authDomain: "employee-818f9.firebaseapp.com",
  projectId: "employee-818f9",
  storageBucket: "employee-818f9.firebasestorage.app",
  messagingSenderId: "322780254022",
  appId: "1:322780254022:web:3b6f0e2245c5fc9a78df47",
  measurementId: "G-83JXESDZW2"
};

// Frontend usage example:
/*
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./config/firebaseClient.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
*/

