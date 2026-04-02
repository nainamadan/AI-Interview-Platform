// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-5c40f.firebaseapp.com",
  projectId: "interviewiq-5c40f",
  storageBucket: "interviewiq-5c40f.firebasestorage.app",
  messagingSenderId: "262870603493",
  appId: "1:262870603493:web:e518c344150f7c4436260c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// enable authentication
const auth=getAuth(app)
// provider google
// btn pe click krkke pop up ayega jisme email select krlege
const provider=new GoogleAuthProvider()
export {auth,provider}