import functions from 'firebase-functions'
import admin from 'firebase-admin'

const auth = admin.auth()

export const userUpdated = functions.firestore
	.document('users/{uid}')
	.onUpdate(async ({ before, after }) => {
		try {
			const name: string = after.get('name')
			
			if (before.get('name') === name)
				return
			
			await auth.updateUser(after.id, { displayName: name })
		} catch (error) {
			console.error(error)
		}
	})
