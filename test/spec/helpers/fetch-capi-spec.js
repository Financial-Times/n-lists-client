const proxyquire = require('proxyquire');
const { expect } = require('chai');
const sinon = require('sinon');

const stubs = {
	nodeFetch: sinon.stub(),
	globalFetch: sinon.stub(),
};

const fakeAPIKey = 'FAKE_KEY';

const response = (value) => ({
	ok: true,
	json: () => Promise.resolve(value)
});

const subject = proxyquire('../../../lib/helpers/fetch-capi', {
	'node-fetch': stubs.nodeFetch
});

describe('lib/helpers/fetch-list', () => {

	beforeEach(() => {
		stubs.nodeFetch.reset();
		stubs.globalFetch.reset();
		global.fetch = undefined;
		process.env.API_KEY = fakeAPIKey;
		stubs.nodeFetch.resolves(response({}));
		stubs.globalFetch.resolves(response({}));
	});

	afterEach(() => {
		process.env.API_KEY = undefined;
	});

	it('It builds a CAPI URL', () => {
		const url = 'test-url';
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
});
