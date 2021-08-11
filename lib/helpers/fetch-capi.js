const fetch = require('node-fetch');
const logger = require('@financial-times/n-logger').default;

const handleResponse = require('./handle-response');

module.exports = (endpoint, timeout) => {
	const url = `https://api.ft.com/${endpoint}`;
	return (global.fetch || fetch)(url, {
		headers: {
			'X-API-Key': process.env.API_KEY
		},
		timeout
	}).then(handleResponse, (error) => {
		logger.warn({
			event: 'LISTS_FETCH_FAILED',
			error: error.name,
			url,
		});
		throw error;
	});
};
