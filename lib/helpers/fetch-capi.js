const handleResponse = require('./handle-response');

module.exports = (endpoint, timeout) => (
	fetch('https://api.ft.com/' + endpoint, {
		headers: {
			'X-API-Key': process.env.API_KEY
		},
		timeout
	})
		.then(handleResponse)
);
