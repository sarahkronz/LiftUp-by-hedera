import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { Notification } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const firestore = firebase.firestore();
const fieldValue = firebase.firestore.FieldValue;

class FirestoreService {

  async createNotification(userId: string, message: string): Promise<void> {
    await firestore.collection('notifications').add({
      userId,
      message,
      isRead: false,
      createdAt: fieldValue.serverTimestamp(),
    });
  }

  getNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const notificationsRef = firestore.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(20);

    const unsubscribe = notificationsRef.onSnapshot(snapshot => {
      const notifications: Notification[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          message: data.message,
          isRead: data.isRead,
          createdAt: data.createdAt || new Date(),
        } as Notification;
      });
      callback(notifications);
    });

    return unsubscribe;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const snapshot = await firestore.collection('notifications')
      .where('userId', '==', userId)
      .where('isRead', '==', false)
      .get();

    if (snapshot.empty) return;

    const batch = firestore.batch();
    snapshot.docs.forEach(doc => batch.update(doc.ref, { isRead: true }));
    await batch.commit();
  }
}

export const firestoreService = new FirestoreService();
