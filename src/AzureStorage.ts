
import config from './config'
import sanitizer from 'string-sanitizer'
import { BinReport, TypeCosmosContainer, TypeGarbage } from './types'
import { Container, CosmosClient, Database } from '@azure/cosmos'
import { v4 as uuid4 } from 'uuid'

export default class AzureStorage {
	db: Database
	containers: Record<TypeCosmosContainer, Container>
	currentId = 4

	constructor () {
		const client = new CosmosClient({ endpoint: config.COSMOS_ENDPOINT, key: config.COSMOS_KEY })
		this.db = client.database(config.COSMOS_DB_ID)
		this.containers = {
			increment: this.db.container('swms-increment'),
			reports: this.db.container('swms-reports'),
			telemetry: this.db.container('swms-increment')
		}
	}

	getNewId (): Promise<string> {
		// TODO implement
		// premysliet nejaky rollback mechanizmus ak vytvaranie zlyha!
		this.currentId++
		return Promise.resolve('bin-' + this.currentId.toString().padStart(3, '0'))
	}

	getBinFullness (binId: string): Promise<number> {
		// TODO implement
		return Promise.resolve(Math.random() * 100)
	}

	getReports () {
		// TODO
	}

	saveReport (binId: string, type: TypeGarbage, message: string): Promise<boolean|string> {
		const payload: BinReport = {
			id: uuid4(),
			binId,
			type,
			message: sanitizer.sanitize.keepSpace(message),
			status: 'new'
		}

		return this.containers.reports.items.create(payload)
			.then(() => Promise.resolve(true))
			.catch(err => Promise.reject(err.body.message))
	}

	updateReport () {
		// TODO
	}
}
