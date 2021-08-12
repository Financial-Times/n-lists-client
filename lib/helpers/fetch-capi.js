const fetch = require('node-fetch');
const logger = require('@financial-times/n-logger').default;
const httpError = require('http-errors');
const formatID = require('./format-id');

async function fetchCAPI (endpoint, timeout) {
	const url = `https://api.ft.com/${endpoint}`;

	try {
		const response = await (global.fetch || fetch)(url, {
			headers: {
				'X-API-Key': process.env.API_KEY,
			},
			timeout
		});

		if (response.ok) {
			return response.json();
		}

		throw httpError(response.status);
	} catch (error) {

		let level = 'warn';
		const logData = {
			event: 'LISTS_CLIENT_FAILED',
			url,
			uuid: formatID(url),
			name: error.name,
			message: error.message,
		};

		if (error.statusCode) {
			logData.statusCode = error.statusCode;
			if (error.statusCode === 404) {
				level = 'info';
			}
		} else {
			logData.error = error;
		}

		logger[level](logData);
		throw error;

	}
}

module.exports = fetchCAPI;
