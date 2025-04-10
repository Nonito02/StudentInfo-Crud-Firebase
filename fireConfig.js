// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfteJwqKQt0fHqSZKvYT4ThzJLw9OcywA",
  authDomain: "id-prod-datas.firebaseapp.com",
  projectId: "id-prod-datas",
  storageBucket: "id-prod-datas.firebasestorage.app",
  messagingSenderId: "1024880780017",
  appId: "1:1024880780017:web:d1da5692363156cbb8bf50",
  measurementId: "G-6K96PG4MZ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
