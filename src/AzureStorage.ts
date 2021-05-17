
// TODO implement with some AZURE storage
export default class AzureStorage {
	currentId = 4

	getNewId (): Promise<string> {
		// TODO implement
		this.currentId++
		return Promise.resolve('bin-' + this.currentId.toString().padStart(3, '0'))
	}

	getBinFullness (binId: string): Promise<number> {
		// TODO implement
		return Promise.resolve(Math.random() * 100)
	}

	saveReport (binId: string, message: string): Promise<boolean> {
		// TODO implement
		return Promise.resolve(true)
	}
}
