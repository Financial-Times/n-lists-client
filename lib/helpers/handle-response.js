const httpError = require('http-errors');
const logger = require('@financial-times/n-logger').default;

module.exports = (response) => {
	if (response.ok) {
		return response.json();
	} else {
		logger.warn({
			event: 'LISTS_CLIENT_FAILED',
			statusCode: response.status,
			statusText: response.statusText,
		});

		return response.text()
			.then((text) => {
				throw httpError(response.status, text);
			});
	}
};
