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
	.onUpdate(({ before, after }, { params: { uid } }) => {
		const name = after.get('name')
		
		return before.get('name') === name
			? Promise.resolve()
			: auth.updateUser(uid, { displayName: name })
	})

export const fileDeleted = functions.firestore
	.document('files/{fileId}')
	.onDelete((_snapshot, { params: { fileId } }) =>
		storage.file(fileId).delete()
	)

export const commentCreated = functions.firestore
	.document('files/{fileId}/comments/{commentId}')
	.onCreate((_snapshot, { params: { fileId } }) =>
		firestore.doc(`files/${fileId}`).update({
			comments: FieldValue.increment(1)
		})
	)
