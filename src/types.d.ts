
export type TypeGarbage = 'plastic' | 'paper' | 'glass' | 'metal' | 'mixed'
export type TypeBinStatus = 'disabled' | 'enabled'

export interface BinConfig {
	lon: number;
	lat: number;
	type: TypeGarbage;
	district?: string[];
}

export interface BinDetail {
	id: string;
	status: TypeBinStatus;
	lon: number;
	lat: number;
	type: TypeGarbage;
	district?: string[];
}

export interface BinFilter {
	status?: TypeBinStatus;
	type?: TypeGarbage;
	location?: any;
	pageSize?: number;
}

export interface BinFilterResult {
	items: BinDetail[];
	nextToken?: string;
}
