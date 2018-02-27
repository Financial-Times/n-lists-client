declare module '@financial-times/n-lists-client' {
	interface Options {
		fields: string[]
	}

	interface Response {
		id: string,
		title: string,
		apiUrl: string,
		concept?: {
			id: string,
			apiUrl: string,
			prefLabel: string
		},
		listType?: string,
		items: Array<{ id: string, apiUrl: string }>
	}

	export interface Static {
		get(
			listID: string,
			options: Options,
			timeout: number
		): Promise<Response>;

		for(
			listType: string,
			conceptID: string,
			options: Options,
			timeout: number
		): Promise<Response>;
	}
}
