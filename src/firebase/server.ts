import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// This is a singleton to avoid re-initializing on every call in dev mode.
let app: FirebaseApp;
let firestore: Firestore;

/**
 * Initializes and returns a Firebase app and Firestore instance for use on the server.
 * This should only be called from Server Components or Server Actions.
 */
function getFirebaseServer() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    firestore = getFirestore(app);
  } else {
    app = getApp();
    firestore = getFirestore(app);
  }
  return { app, firestore };
}

export { getFirebaseServer };
