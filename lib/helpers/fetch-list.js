const client = require('@financial-times/n-es-client');
const fetchCAPI = require('./fetch-capi');
const formatID = require('./format-id');
const logger = require('@dotcom-reliability-kit/logger').default;

const DEFAULTS = {
	fields: [ 'id', 'url', 'title', 'publishedDate' ]
};

const fetchESMget = async (endpoint, docs, timeout) => {
	try {
		return 	await client.mget({ docs }, timeout);
	} catch (error) {
		logger.warn({
			event: 'LISTS_CLIENT_FAILED',
			url: endpoint,
			uuid: formatID(endpoint),
			name: error.name,
			message: error.message,
		});
		throw error;
	}
}

async function fetchList (endpoint, options = {}, timeout = 3000) {
	const params = Object.assign({}, DEFAULTS, options);
	const listData = await fetchCAPI(endpoint, timeout);

	if(!listData.items) {
		return listData;
	}

	const docs = listData.items.map(({ id }) => ({
		_id: formatID(id),
		_source: params.fields
	}));

	const contentItems = await fetchESMget(endpoint, docs, timeout);
	// n-es-client will filter out any items not found.
	return Object.assign(listData, { items: contentItems });
}

module.exports = fetchList;
