import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDZE-4PVyli5YftxNGSB9yweTmo32AFU4g",
  authDomain: "kamdhanda-1906.firebaseapp.com",
  projectId: "kamdhanda-1906",
  storageBucket: "kamdhanda-1906.firebasestorage.app",
  messagingSenderId: "1087812898708",
  appId: "1:1087812898708:web:4f571a54444f4e97ed0981"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
