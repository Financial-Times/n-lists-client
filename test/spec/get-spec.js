const proxyquire = require('proxyquire');
const { expect } = require('chai');
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();

const stubs = {
	fetchList: sandbox.stub()
};

const subject = proxyquire('../../lib/get', {
	'./helpers/fetch-list': stubs.fetchList
});

const LIST_ID = '520ddb76-e43d-11e4-9e89-00144feab7de';

describe('lib/get', () => {
	beforeEach(() => {
		stubs.fetchList.resolves();
	});

	afterEach(() => {
		sandbox.reset();
	});

	it('rejects when the given list ID is not a valid UUID', () => (
		subject('123')
			.then(() => {
				throw new Error('This should not be called');
			})
			.catch((error) => {
				expect(error.message).to.match(/Invalid list ID/);
			})
	));

	it('constructs the correct endpoint', () => (
		subject(LIST_ID).then(() => {
			sinon.assert.calledWithMatch(
				stubs.fetchList,
				`lists/${LIST_ID}`
			);
		})
	));
});
