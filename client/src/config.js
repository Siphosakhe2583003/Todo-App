// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "whatever though",
  authDomain: "go-do-appl.firebaseapp.com",
  projectId: "go-do-appl",
  storageBucket: "go-do-appl.firebasestorage.app",
  messagingSenderId: "575510639431",
  appId: "1:575510639431:web:69813f171680f24f3fd262",
  measurementId: "G-MLLSVRQQBR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app
