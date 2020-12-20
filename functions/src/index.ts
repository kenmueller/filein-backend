import { initializeApp } from 'firebase-admin'

initializeApp({
	storageBucket: 'u.filein.io'
})

export * from './functions'
