const proxyquire = require('proxyquire');
const { expect } = require('chai');
const sinon = require('sinon');

const stubs = {
	nodeFetch: sinon.stub(),
	globalFetch: sinon.stub(),
	nLogger: {
		warn: sinon.stub(),
		info: sinon.stub(),
	}
};

const fakeAPIKey = 'FAKE_KEY';
const listUUID = '00000000-0000-0000-0000-000000000000';

const response = (value) => ({
	ok: true,
	json: () => Promise.resolve(value),
	url: `https://api.ft.com/${value}`,
});

const subject = proxyquire('../../../lib/helpers/fetch-capi', {
	'node-fetch': stubs.nodeFetch,
	'@financial-times/n-logger': {
		default: stubs.nLogger,
	},
});

describe('lib/helpers/fetch-capi', () => {

	beforeEach(() => {
		stubs.nodeFetch.reset();
		stubs.globalFetch.reset();
		stubs.nLogger.warn.reset();
		stubs.nLogger.info.reset();
		global.fetch = undefined;
		process.env.API_KEY = fakeAPIKey;
		stubs.nodeFetch.resolves(response({}));
		stubs.globalFetch.resolves(response({}));
	});

	afterEach(() => {
		process.env.API_KEY = undefined;
	});

	it('It builds a CAPI URL', () => {
		const url = `/path/${listUUID}`;
		return subject(url).then(() => {
			expect(stubs.nodeFetch.getCall(0).args[0]).to.equal(`https://api.ft.com/${url}`);
		});
	});

	it('It sets the "X-API-Key" request header', () => {
		return subject('test-url').then(() => {
			expect(stubs.nodeFetch.getCall(0).args[1]).to.deep.include({headers: {'X-API-Key': fakeAPIKey}});
		});
	});

	it('It uses the specified timeout value', () => {
		const timeout = 1000;
		return subject('test-url', timeout).then(() => {
			expect(stubs.nodeFetch.getCall(0).args[1]).to.deep.include({timeout});
		});
	});

	it('use node-fetch when global fetch is not defined', () => {
		return subject('test-url').then(() => {
			sinon.assert.calledOnce(stubs.nodeFetch);
			sinon.assert.notCalled(stubs.globalFetch);
			expect(stubs.nodeFetch.getCall(0).args[0]).to.include('test-url');
		});
	});

	it('use global.fetch when it is defined', () => {
		global.fetch = stubs.globalFetch;
		return subject('test-url').then(() => {
			sinon.assert.calledOnce(stubs.globalFetch);
			sinon.assert.notCalled(stubs.nodeFetch);
			expect(stubs.globalFetch.getCall(0).args[0]).to.include('test-url');
		});
	});

	context('when error fetching', () => {

		const status = 500;
		const statusText = 'Status text';
		const responseText = 'Response text';
		const url = `/path/${listUUID}`;

		beforeEach(() => {
			stubs.nodeFetch.resolves({
				ok: false,
				status,
				statusText,
				text: () => Promise.resolve(responseText),
				url: `https://api.ft.com/${url}`,
			});
		});

		it('rejects with an error', () => {
			return subject(url).catch(error => {
				expect(error).to.be.an('error');
			});
		});

		it('the error has the statusCode of the original response', () => {
			return subject(url).catch(error => {
				expect(error.statusCode).to.equal(status);
			});
		});

		it('logs the error with WARN level', () => {
			return subject(url).catch(() => {
				sinon.assert.calledOnce(stubs.nodeFetch);
				sinon.assert.calledOnce(stubs.nLogger.warn);
				expect(stubs.nLogger.warn.getCall(0).args[0]).to.deep.include({
					statusCode: status,
					url: `https://api.ft.com/${url}`,
					uuid: listUUID,
				});
			});
		});

	});

	context('when list is not found', () => {

		const status = 404;
		const statusText = 'Not Found';
		const responseText = 'Response text';
		const url = `/path/${listUUID}`;

		beforeEach(() => {
			stubs.nodeFetch.resolves({
				ok: false,
				status,
				statusText,
				text: () => Promise.resolve(responseText),
				url: `https://api.ft.com/${url}`,
			});
		});

		it('rejects with an error', () => {
			return subject(url).catch(error => {
				expect(error).to.be.an('error');
			});
		});

		it('the error has the statusCode of the original response', () => {
			return subject(url).catch(error => {
				expect(error.statusCode).to.equal(status);
			});
		});

		it('logs the error with INFO level', () => {
			return subject(url).catch(() => {
				sinon.assert.calledOnce(stubs.nodeFetch);
				sinon.assert.calledOnce(stubs.nLogger.info);
				expect(stubs.nLogger.info.getCall(0).args[0]).to.deep.include({
					url: `https://api.ft.com/${url}`,
					uuid: listUUID,
				});
			});
		});

	});
});
