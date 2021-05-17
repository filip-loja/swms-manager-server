
export type TypeGarbage = 'plastic' | 'paper' | 'glass' | 'metal' | 'mixed'
export type TypeBinStatus = 'disabled' | 'enabled'

export interface BinConfig {
	lon: number;
	lat: number;
	type: TypeGarbage;
	district?: string[];
}
