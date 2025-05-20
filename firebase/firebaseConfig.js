import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFKPaT4qKq9RIVh_qva3WASVY8mxJ8ZnQ",
  authDomain: "pokeapi2-ea696.firebaseapp.com",
  projectId: "pokeapi2-ea696",
  storageBucket: "pokeapi2-ea696.firebasestorage.app",
  messagingSenderId: "47412692126",
  appId: "1:47412692126:web:c6b21b67d9a74d4da1a78f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // ✅ ¡Esto es necesario!

export { auth, db };
