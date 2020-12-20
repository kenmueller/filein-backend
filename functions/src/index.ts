import admin from 'firebase-admin'

admin.initializeApp({
	storageBucket: 'u.filein.io'
})

export * from './functions'
