const client = require('@financial-times/n-es-client');
const fetchCAPI = require('./fetch-capi');
const formatID = require('./format-id');

const DEFAULTS = {
	fields: [ 'id', 'url', 'title', 'publishedDate' ]
};

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

	const contentItems = await client.mget({ docs }, timeout);

	// n-es-client will filter out any items not found.
	return Object.assign(listData, { items: contentItems });
}

module.exports = fetchList;
