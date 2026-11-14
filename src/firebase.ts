import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const isBrowser = typeof window !== 'undefined';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth: Auth = isBrowser ? getAuth(app) : ({} as Auth);

if (isBrowser) {
  async function testConnection() {
    try {
      await getDocFromServer(doc(db, 'settings', 'exchangeRate'));
      console.log('Firestore connection successful');
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. The client is offline.");
      } else {
        console.error('Firestore connection test error:', error);
      }
    }
  }
  testConnection();
}
