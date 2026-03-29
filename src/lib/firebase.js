// Firebase init (optional). App should still work if Firebase/Firestore isn't available.
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCM7PfEM_PaVXxAoqm62x_Nv2y6Na9hebU',
  authDomain: 'arnarflow.firebaseapp.com',
  projectId: 'arnarflow',
  storageBucket: 'arnarflow.firebasestorage.app',
  messagingSenderId: '493943035698',
  appId: '1:493943035698:web:af909cce141eefba50e92b',
  measurementId: 'G-D4DYPLH2J4'
}

let app = null
let db = null
let blaerSync = null
let firebaseEnabled = false

try {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  db = getFirestore(app)
  blaerSync = collection(db, 'blaer-sync')
  firebaseEnabled = true
} catch (e) {
  // Firebase unavailable (e.g. build/env issue). We'll gracefully fall back to JSON sync.
  firebaseEnabled = false
}

export { app, db, blaerSync, firebaseEnabled }
