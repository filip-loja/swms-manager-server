
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

app.get('/bin/:id', (req, res) => {
	const binId = req.params && req.params['id']
	hub.getBin(binId)
		.then(resp => res.json({ success: true, data: resp }))
		.catch(error => res.status(400).json({ error }))
})

app.post('/bin/create', jsonParser, (req, res) => {
	hub.createBin(req.body as BinConfig)
		.then(resp => res.json({ success: true, id: resp }))
		.catch(error => res.status(400).json({ error }))
})

app.delete('/bin/delete/:id', (req, res) => {
	const binId = req.params && req.params['id']
	hub.deleteBin(binId)
		.then(() => res.json({ success: true }))
		.catch(error => res.status(400).json({ error }))
})

app.put('/bin/status/:id', jsonParser, (req, res) => {
	const status = req.body && req.body['status']
	const binId = req.params && req.params['id']
	if (!['disabled', 'enabled'].includes(status)) {
		return res.status(400).json({ error: 'Invalid status!' })
	}
	hub.updateBinStatus(binId, status)
		.then(() => res.json({ success: true }))
		.catch(error => res.status(400).json({ error }))
})

app.listen(port, () => {
	console.log(`Server is listening at http://localhost:${port}`)
})
