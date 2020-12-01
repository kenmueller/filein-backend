import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp({
	storageBucket: 'file-in.appspot.com'
})

const { FieldValue } = admin.firestore
const firestore = admin.firestore()
const storage = admin.storage().bucket()

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
