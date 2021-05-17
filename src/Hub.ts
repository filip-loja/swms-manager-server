
import iotHub, { Registry } from 'azure-iothub'
import config from './config'
import {BinConfig, BinDetail, TypeBinStatus} from './types'

let nextId = 5

export default class Hub {
	registry: Registry

	constructor () {
		this.registry = iotHub.Registry.fromConnectionString(config.IOT_KEY)
	}

	generateId (): string {
		const id = 'bin-' + nextId.toString().padStart(3, '0')
		nextId++
		return id
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

	createBin (binConfig: BinConfig): Promise<string|any> {
		const deviceId = this.generateId()
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
