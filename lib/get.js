const fetchList = require('./helpers/fetch-list');

module.exports = (uuid, options, timeout) => {
	return fetchList(`lists/${uuid}`, options, timeout);
};
