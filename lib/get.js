const client = require('@financial-times/n-es-client');
const fetchCAPI = require('./helpers/fetch-capi');
const formatID = require('./helpers/format-id');

const DEFAULTS = {
	fields: true
};

module.exports = (uuid, options = {}, timeout = 3000) => {
	const params = Object.assign({}, DEFAULTS, options);

	return fetchCAPI(`lists/${uuid}`, timeout).then((listData) => {
		const items = listData.items.map(({ id }) => (
			{
				_id: formatID(id),
				_source: params.fields
			}
		));

		return client.mget(items, timeout).then((contentItems) => {
			// n-es-client will filter out any items not found.
			return Object.assign(listData, { items: contentItems });
		});
	});
};
