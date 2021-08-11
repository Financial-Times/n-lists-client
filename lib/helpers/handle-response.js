const httpError = require('http-errors');
const logger = require('@financial-times/n-logger').default;

module.exports = (response) => {
	if (response.ok) {
		return response.json();
	} else {
		if (response.status === 404) {
			logger.info({
				event: 'LIST_NOT_FOUND',
				url: response.url,
				uuid: response.url.toString().split('/').pop(),
			});
		} else {
			logger.warn({
				event: 'LISTS_CLIENT_FAILED',
				url: response.url,
				uuid: response.url.toString().split('/').pop(),
				statusCode: response.status,
				statusText: response.statusText,
			});
		}

		return response.text()
			.then((text) => {
				throw httpError(response.status, text);
			});
	}
};
