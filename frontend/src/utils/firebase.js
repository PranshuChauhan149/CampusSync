import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "campussync-24129.firebaseapp.com",
  projectId: "campussync-24129",
  storageBucket: "campussync-24129.firebasestorage.app",
  messagingSenderId: "302271905609",
  appId: "1:302271905609:web:795830cd011e7d1883a498"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { app, auth, provider }