import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const { FieldValue } = admin.firestore
const firestore = admin.firestore()

export const commentCreated = functions.firestore
	.document('files/{fileId}/comments/{commentId}')
	.onCreate(async (snapshot, { params: { fileId } }) => {
		try {
			await Promise.all([
				firestore.doc(`users/${snapshot.get('from')}`).update({
					comments: FieldValue.increment(1)
				}),
				firestore.doc(`files/${fileId}`).update({
					comments: FieldValue.increment(1)
				})
			])
		} catch (error) {
			console.error(error)
		}
	})

export const commentDeleted = functions.firestore
	.document('files/{fileId}/comments/{commentId}')
	.onDelete(async (snapshot, { params: { fileId } }) => {
		try {
			await Promise.all([
				firestore.doc(`users/${snapshot.get('from')}`).update({
					comments: FieldValue.increment(-1)
				}),
				firestore.doc(`files/${fileId}`).update({
					comments: FieldValue.increment(-1)
				})
			])
		} catch (error) {
			console.error(error)
		}
	})
