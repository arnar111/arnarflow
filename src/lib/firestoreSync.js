import {
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'

import { db, blaerSync, firebaseEnabled } from './firebase'

/**
 * Subscribe to all blaer-sync items in real time.
 * callback(items) receives array of: { id, ...docData }
 */
export function subscribeToBlaerSync(callback) {
  if (!firebaseEnabled || !db || !blaerSync) {
    throw new Error('Firebase/Firestore not available')
  }

  const q = query(blaerSync, orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      callback(items)
    },
    (err) => {
      console.error('Firestore subscribe error:', err)
      // surface error to caller by throwing inside async boundary
      callback(null, err)
    }
  )
}

/**
 * Write a new sync item (for Blær / external writers).
 * Expected shape:
 * { type: 'task'|'recipe'|'idea', data: {...}, status?: 'pending'|'imported' }
 */
export async function writeBlaerSync(item) {
  if (!firebaseEnabled || !db || !blaerSync) {
    throw new Error('Firebase/Firestore not available')
  }

  const payload = {
    type: item?.type,
    status: item?.status || 'pending',
    createdAt: serverTimestamp(),
    data: item?.data || {}
  }

  return addDoc(blaerSync, payload)
}

export async function markSyncItemImported(docId) {
  if (!firebaseEnabled || !db) {
    throw new Error('Firebase/Firestore not available')
  }
  if (!docId) throw new Error('docId required')

  const ref = doc(db, 'blaer-sync', docId)
  return updateDoc(ref, {
    status: 'imported',
    importedAt: serverTimestamp()
  })
}

export async function deleteSyncItem(docId) {
  if (!firebaseEnabled || !db) {
    throw new Error('Firebase/Firestore not available')
  }
  if (!docId) throw new Error('docId required')

  const ref = doc(db, 'blaer-sync', docId)
  return deleteDoc(ref)
}
