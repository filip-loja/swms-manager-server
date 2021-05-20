import sanitizer from 'string-sanitizer'

export type TypeGarbage = 'plastic' | 'paper' | 'glass' | 'metal' | 'mixed'
export type TypeBinStatus = 'disabled' | 'enabled'
export type TypeCosmosContainer = 'increment' | 'reports' | 'telemetry'
export type TypeBinReportStatus = 'new' | 'opened'

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
	location?: ViewBounds;
	pageSize?: number;
}

export interface BinFilterResult {
	items: BinDetail[];
	nextToken?: string;
	query: string;
	pageSize: number;
}

export interface ViewBounds {
	lonBottomLeft: number;
	latBottomLeft: number;
	lonTopRight: number;
	latTopRight: number;
}

export interface BinReport {
	id: string;
	binId: string;
	type: TypeGarbage;
	message: string;
	status: TypeBinReportStatus;
	[key: string]: any;
}
