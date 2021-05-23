
import config from './config'
import express from 'express'
import bodyParser from 'body-parser'
import AzureHub from './AzureHub'
import AzureStorage from './AzureStorage'
import { BinConfig, BinFilter } from './types'
import cors from 'cors'

const storage = new AzureStorage()
const hub = new AzureHub(storage)
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

app.use(cors())
app.use(checkCredentials)

const success = (res, data = undefined) => res.json({ success: true, data })
const error = (res, error = 'Bad Request!') => res.status(400).json({ error })

app.get('/', (req, res) => {
	res.send('SVMS Manager<br>Created by: Filip Loja')
})

app.get('/bin/:id', (req, res) => {
	const binId = req.params && req.params['id']
	hub.getBin(binId)
		.then(data => success(res, data))
		.catch(err => error(res, err))
})

app.get('/bin/:id/connection', (req, res) => {
	const binId = req.params && req.params['id']
	hub.getBinConnectionString(binId)
		.then(data => success(res, data))
		.catch(err => error(res, err))
})

app.post('/bin/list', jsonParser, (req, res) => {
	hub.listBins(req.body as BinFilter)
		.then(data => success(res, data))
		.catch(err => error(res, err))
})

app.post('/bin/create', jsonParser, (req, res) => {
	hub.createBin(req.body as BinConfig)
		.then(data => success(res, data))
		.catch(err => error(res, err))
})

app.delete('/bin/delete/:id', (req, res) => {
	const binId = req.params && req.params['id']
	hub.deleteBin(binId)
		.then(() => success(res))
		.catch(err => error(res, err))
})

app.put('/bin/status/:id', jsonParser, (req, res) => {
	const status = req.body && req.body['status']
	const binId = req.params && req.params['id']
	if (!['disabled', 'enabled'].includes(status)) {
		return error(res, 'Invalid status!')
	}
	hub.updateBinStatus(binId, status)
		.then(() => success(res))
		.catch(err => error(res, err))
})

app.put('/bin/detail/:id', jsonParser, (req, res) => {
	const binId = req.params && req.params['id']
	hub.updateBinTags(binId, req.body as BinConfig)
		.then(() => success(res))
		.catch(err => error(res, err))
})

app.get('/bin/fullness/:id', (req, res) => {
	const binId = req.params && req.params['id']
	storage.getBinFullness(binId)
		.then(data => success(res, data))
		.catch(err => error(res, err))
})

app.post('/bin/report', jsonParser, (req, res) => {
	const id = req.body && req.body['id']
	const message = req.body && req.body['message']
	const type = req.body && req.body['type']
	storage.saveReport(id, type, message)
		.then(() => success(res))
		.catch(err => error(res, err))
})

app.listen(port, () => {
	console.log(`Server is listening at http://localhost:${port}`)
})
