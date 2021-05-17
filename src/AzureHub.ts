
import config from './config'
import iotHub, { Registry } from 'azure-iothub'
import { BinConfig, BinDetail, TypeBinStatus } from './types'
import AzureStorage from './AzureStorage'

export default class AzureHub {
	registry: Registry
	storage: AzureStorage

	constructor (storage: AzureStorage) {
		this.storage = storage
		this.registry = iotHub.Registry.fromConnectionString(config.IOT_KEY)
	}

	parseBinDetail (rawDetail: any): BinDetail {
		return {
			id: rawDetail.deviceId,
			status: rawDetail.status,
			lat: rawDetail.tags.lat,
			lon: rawDetail.tags.lon,
			type: rawDetail.tags.type,
			district: rawDetail.tags.district
		}
	}

	parseError (err: any): Promise<any> {
		return Promise.reject(err.responseBody ? JSON.parse(err.responseBody) : err.message)
	}

	getBin (binId: string): Promise<any> {
		return this.registry.getTwin(binId)
			.then(resp => this.parseBinDetail(resp.responseBody))
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
