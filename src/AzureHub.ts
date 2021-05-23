
import config from './config'
import AzureStorage from './AzureStorage'
import iotHub, { Registry } from 'azure-iothub'
import { BinConfig, BinDetail, BinFilter, BinFilterResult, TypeBinStatus } from './types'

export default class AzureHub {
	registry: Registry
	storage: AzureStorage

	constructor (storage: AzureStorage) {
		this.storage = storage
		this.registry = iotHub.Registry.fromConnectionString(config.IOT_KEY)
	}

	parseBinDetail (rawDetail: any): BinDetail {
		return {
			binId: rawDetail.deviceId,
			status: rawDetail.status,
			lat: rawDetail.tags.lat,
			lon: rawDetail.tags.lon,
			type: rawDetail.tags.type,
			district: rawDetail.tags.district
		}
	}

	buildConnectionString (rawData: any): string {
		const id = rawData.deviceId
		const key = rawData.authentication.SymmetricKey.primaryKey
		return `HostName=filipiothub.azure-devices.net;DeviceId=${id};SharedAccessKey=${key}`
	}

	parseError (err: any): Promise<any> {
		return Promise.reject(err.responseBody ? JSON.parse(err.responseBody) : err.message)
	}

	getBin (binId: string): Promise<any> {
		let resultObj
		return this.registry.getTwin(binId)
			.then(resp => {
				resultObj = this.parseBinDetail(resp.responseBody)
				return this.registry.get(binId)
			})
			.then(resp => {
				resultObj.connectionString = this.buildConnectionString(resp.responseBody)
				return resultObj
			})
			.catch(err => this.parseError(err))
	}

	getBinConnectionString (bindId: string): Promise<any> {
		return this.registry.get(bindId)
			.then(resp => this.buildConnectionString(resp.responseBody))
			.catch(err => this.parseError(err))
	}

	listBins (filterObj: BinFilter): Promise<BinFilterResult|any> {
		let queryStr = 'SELECT * FROM devices'
		let joint = ' WHERE '
		if (filterObj.status && Array.isArray(filterObj.status) && filterObj.status.length) {
			queryStr = queryStr + joint + "status IN ['" + filterObj.status.join("', '") + "']"
			joint = ' AND '
		}
		if (filterObj.type && Array.isArray(filterObj.type) && filterObj.type.length) {
			queryStr = queryStr + joint + "tags.type IN ['" + filterObj.type.join("', '") + "']"
			joint = ' AND '
		}
		if (filterObj.location) {
			const lonBottomLeftCheck = `tags.lon >= ${(filterObj.location.lonBottomLeft - 0.0001)}`
			const latBottomLeftCheck = `tags.lat >= ${(filterObj.location.latBottomLeft - 0.0001)}`
			const lonTopRightCheck = `tags.lon <= ${(filterObj.location.lonTopRight + 0.0001)}`
			const latTopRightCheck = `tags.lat <= ${(filterObj.location.latTopRight + 0.0001)}`
			queryStr = queryStr + joint + lonBottomLeftCheck + ' AND ' + latBottomLeftCheck + ' AND ' + lonTopRightCheck + ' AND ' + latTopRightCheck
		}
		const pageSize = (filterObj.pageSize && filterObj.pageSize > 0) ? Number(filterObj.pageSize) : 100
		const query = this.registry.createQuery(queryStr, pageSize)
		return query.next(filterObj.token)
			.then(resp => ({
				items: resp.result
					.map(bin => this.parseBinDetail(bin))
					.sort((a, b) => {
						const aNum = Number(a.binId.split('-').pop())
						const bNum = Number(b.binId.split('-').pop())
						return aNum - bNum
					}),
				nextToken: resp.message.headers['x-ms-continuation'],
				query: queryStr,
				pageSize,
			}))
			.catch(err => this.parseError(err))
	}

	async createBin (binConfig: BinConfig): Promise<string|any> {
		const deviceId = await this.storage.getNewId()
		const deviceDescription = [{
			deviceId,
			status: 'disabled',
			tags: {
				...binConfig
			}
		}]
		return this.registry.addDevices(deviceDescription)
			.then(() => deviceId)
			.catch(err => Promise.reject(JSON.parse(err.responseBody).errors[0].errorStatus))
	}

	deleteBin (binId: string): Promise<boolean|any> {
		return this.registry.delete(binId)
			.then(() => true)
			.catch(err => this.parseError(err))
	}

	updateBinStatus (binId: string, binStatus: TypeBinStatus): Promise<boolean|any> {
		const payload = {
			deviceId: binId,
			status: binStatus
		}
		return this.registry.update(payload)
			.then(() => true)
			.catch(err => this.parseError(err))
	}

	updateBinTags (binId: string, binConfig: BinConfig): Promise<boolean|any> {
		const patch = {
			tags: { ...binConfig }
		}
		return this.registry.updateTwin(binId, patch, '*')
			.then(() => true)
			.catch(err => this.parseError(err))
	}
}
