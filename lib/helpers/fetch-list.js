const client = require('@financial-times/n-es-client');
const fetchCAPI = require('./fetch-capi');
const formatID = require('./format-id');

const DEFAULTS = {
	fields: [ 'id', 'url', 'title', 'publishedDate' ]
};

module.exports = (endpoint, options = {}, timeout = 3000) => {
	const params = Object.assign({}, DEFAULTS, options);

	return fetchCAPI(endpoint, timeout).then((listData) => {
		const items = listData.items.map(({ id }) => (
			{
				_id: formatID(id),
				_source: options.fields
			}
		));

		return client.mget(items, timeout).then((contentItems) => {
			// n-es-client will filter out any items not found.
			return Object.assign(listData, { items: contentItems });
		});
	});
};
