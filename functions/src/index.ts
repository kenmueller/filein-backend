import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp({
	storageBucket: 'u.filein.io'
})

const { FieldValue } = admin.firestore

const auth = admin.auth()
const firestore = admin.firestore()
const storage = admin.storage().bucket()

export const userUpdated = functions.firestore
	.document('users/{uid}')
	.onUpdate(({ before, after }) => {
		const name = after.get('name')
		
		return before.get('name') === name
			? Promise.resolve()
			: auth.updateUser(after.id, { displayName: name })
	})

export const fileCreated = functions.firestore
	.document('files/{fileId}')
	.onCreate(snapshot => {
		const uid = snapshot.get('owner')
		
		return uid
			? firestore.doc(`users/${uid}`).update({
				files: FieldValue.increment(1)
			})
			: Promise.resolve()
	})

export const fileDeleted = functions.firestore
	.document('files/{fileId}')
	.onDelete(snapshot => {
		const uid = snapshot.get('owner')
		const promises: Promise<any>[] = [
			storage.file(snapshot.id).delete(),
			snapshot.ref.collection('comments').get().then(({ docs }) =>
				Promise.all(docs.map(({ ref }) => ref.delete()))
			)
		]
		
		if (uid)
			promises.push(firestore.doc(`users/${uid}`).update({
				files: FieldValue.increment(-1)
			}))
		
		return Promise.all(promises)
	})

export const commentCreated = functions.firestore
	.document('files/{fileId}/comments/{commentId}')
	.onCreate((snapshot, { params: { fileId } }) =>
		Promise.all([
			firestore.doc(`users/${snapshot.get('from')}`).update({
				comments: FieldValue.increment(1)
			}),
			firestore.doc(`files/${fileId}`).update({
				comments: FieldValue.increment(1)
			})
		])
	)

export const commentDeleted = functions.firestore
	.document('files/{fileId}/comments/{commentId}')
	.onDelete((snapshot, { params: { fileId } }) =>
		Promise.all([
			firestore.doc(`users/${snapshot.get('from')}`).update({
				comments: FieldValue.increment(-1)
			}),
			firestore.doc(`files/${fileId}`).update({
				comments: FieldValue.increment(-1)
			})
		])
	)
