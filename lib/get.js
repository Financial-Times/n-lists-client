const fetchList = require('./helpers/fetch-list');

const UUID = /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/;

module.exports = (listID, options, timeout) => {
	if (UUID.test(listID) === false) {
		return Promise.reject(new Error(`Invalid list ID "${listID}"`));
	}

	return fetchList(`lists/${listID}`, options, timeout);
};
