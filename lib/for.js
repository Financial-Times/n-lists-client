const fetchList = require('./helpers/fetch-list');

// These can be set to whatever editorial decide so...
// <https://github.com/Financial-Times/document-store-api>
// <https://sites.google.com/a/ft.com/dynamic-publishing-team/list-panic-guide-for-ops>
const ALLOWED = new Set([
	'Columnists',
	'OpinionAnalysis',
	'SpecialReports',
	'TopStories',
	'Recommended'
]);

module.exports = (listType, conceptID, options, timeout) => {
	if (ALLOWED.has(listType) === false) {
		return Promise.reject(new TypeError(`Unknown list type "${listType}"`));
	}

	return fetchList(`lists?listType=${listType}&conceptUUID=${conceptID}`, options, timeout);
};
