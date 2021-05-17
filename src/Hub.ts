
import iotHub, { Registry } from 'azure-iothub'
import config from './config'
import {BinConfig, TypeBinStatus} from './types'

let nextId = 6

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

	updateBinStatus (binId: string, binStatus: TypeBinStatus): Promise<boolean|any> {
		const payload = {
			deviceId: binId,
			status: binStatus
		}
		return this.registry.update(payload)
			.then(() => true)
			.catch(err => Promise.reject(err.message))
	}
}
