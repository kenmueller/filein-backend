import functions from 'firebase-functions'
import admin from 'firebase-admin'

const { FieldValue } = admin.firestore

const firestore = admin.firestore()
const storage = admin.storage().bucket()

export const fileCreated = functions.firestore
	.document('files/{fileId}')
	.onCreate(async snapshot => {
		try {
			const uid: string | null = snapshot.get('owner')
			
			if (!uid)
				return
			
			await firestore.doc(`users/${uid}`).update({
				files: FieldValue.increment(1)
			})
		} catch (error) {
			console.error(error)
		}
	})

export const fileUpdated = functions.firestore
	.document('files/{fileId}')
	.onUpdate(async ({ before, after }) => {
		try {
			const name: string = after.get('name')
			
			if (before.get('name') === name)
				return
			
			await storage.file(after.id).setMetadata({
				contentDisposition: `inline; filename=${JSON.stringify(name)}`
			})
		} catch (error) {
			console.error(error)
		}
	})

export const fileDeleted = functions.firestore
	.document('files/{fileId}')
	.onDelete(async snapshot => {
		try {
			const uid: string | null = snapshot.get('owner')
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
			
			await Promise.all(promises)
		} catch (error) {
			console.error(error)
		}
	})
