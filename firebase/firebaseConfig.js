import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDcG_FtIese7kaCb2WPk1ExbfAo312elws",
  authDomain: "pokeapi2-5dfab.firebaseapp.com",
  projectId: "pokeapi2-5dfab",
  storageBucket: "pokeapi2-5dfab.firebasestorage.app",
  messagingSenderId: "736525502",
  appId: "1:736525502:web:f0985fa6f2f701591a72ef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // ✅ ¡Esto es necesario!

export { auth, db };
