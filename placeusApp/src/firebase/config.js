import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC069wc2mYm0P24IE286UOZIL0nUHpdpHw",
  authDomain: "startupstill.firebaseapp.com",
  projectId: "startupstill",
  storageBucket: "startupstill.appspot.com",
  messagingSenderId: "726636682595",
  appId: "1:726636682595:web:6fb7949d1f1d2aba034756"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);