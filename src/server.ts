
import config from './config'
import express from 'express'
import bodyParser from 'body-parser'
import Hub from './Hub'
import { BinConfig } from './types'

const hub = new Hub()
const app = express()
const jsonParser = bodyParser.json()
const port = 3000

const checkCredentials = (req, res, next) => {
	if (req.originalUrl === '/') {
		return next()
	}
	if (!req.headers.authorization) {
		return res.status(403).json({ error: 'No credentials sent!' })
	}
	if (req.headers.authorization !== config.AUTH_KEY) {
		return res.status(403).json({ error: 'Invalid credentials sent!' })
	}
	return next()
}

app.use(checkCredentials)

app.get('/', (req, res) => {
	res.send('SVMS Manager<br>Created by: Filip Loja')
})

app.post('/device/create', jsonParser, (req, res) => {
	hub.createBin(req.body as BinConfig)
		.then(resp => res.json({ success: true, id: resp }))
		.catch(error => res.status(403).json({ error }))
})

app.listen(port, () => {
	console.log(`Server is listening at http://localhost:${port}`)
})
