import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { v4 as uuid } from 'uuid'

const auth = admin.auth()

export const userCreated = functions.firestore
	.document('users/{uid}')
	.onCreate(async ({ ref }) => {
		try {
			await ref.update({ apiKey: uuid() })
		} catch (error) {
			console.error(error)
		}
	})

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
