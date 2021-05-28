
import config from './config'
import sanitizer from 'string-sanitizer'
import { BinReport, TypeCosmosContainer, TypeGarbage } from './types'
import { Container, CosmosClient, Database } from '@azure/cosmos'
import { v4 as uuid4 } from 'uuid'

export default class AzureStorage {
	db: Database
	containers: Record<TypeCosmosContainer, Container>

	constructor () {
		const client = new CosmosClient({ endpoint: config.COSMOS_ENDPOINT, key: config.COSMOS_KEY })
		this.db = client.database(config.COSMOS_DB_ID)
		this.containers = {
			increment: this.db.container('swms-increment'),
			reports: this.db.container('swms-reports'),
			telemetry: this.db.container('swms-telemetry')
		}
	}

	getNewId (): Promise<any> {
		let id: string = null
		return this.containers.increment.item('swms-increment', 'main')
			.read()
			.then(({ resource }) => {
				let increment = Number(resource.value)
				id = 'bin-' + increment.toString().padStart(3, '0')
				resource.value = ++increment
				return resource
			})
			.then((increment) => this.containers.increment.item('swms-increment', 'main').replace(increment))
			.then(() => id)
	}

	getBinFullness (binId: string): Promise<any> {
		const querySpec = {
			query: `SELECT top 1 * FROM c WHERE c.binId = "${binId}" ORDER BY c._ts DESC`
		}
		return this.containers.telemetry.items.query(querySpec).fetchAll()
			.then(resp => resp.resources[0].fullness)
			.catch(() => -1)
	}

	getReports () {
		const querySpec = {
			query: 'SELECT * from c'
		}
		return this.containers.reports.items.query(querySpec).fetchAll()
			.then(resp => resp.resources)
			.catch(err => Promise.reject(err.body.message))
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

	deleteReport (reportId: string, key: string) {
		return this.containers.reports.item(reportId, key).delete()
			.then(() => Promise.resolve(true))
			.catch(err => Promise.reject(err.body.message))
	}
}
