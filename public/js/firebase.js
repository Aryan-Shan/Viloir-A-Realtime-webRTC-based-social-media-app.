// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth ,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getDatabase, child, ref, set, onDisconnect, onValue ,remove,update,push,onChildAdded,get,runTransaction} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';

// Firebase configuration 
//replace with your config details
const firebaseConfig = {
  apiKey: "YOUR-API-KEY",
  authDomain: "YOUR-DOMAIN-NAME",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGEBUCKET",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database, ref, set, onDisconnect, onValue ,remove,update,push,onChildAdded,get,firebaseConfig,runTransaction,getAuth,getDatabase,onAuthStateChanged,child};
