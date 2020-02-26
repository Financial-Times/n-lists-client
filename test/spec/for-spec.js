const proxyquire = require('proxyquire');
const { expect } = require('chai');
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();

const stubs = {
	fetchList: sandbox.stub()
};

const subject = proxyquire('../../lib/for', {
	'./helpers/fetch-list': stubs.fetchList
});

describe('lib/for', () => {
	beforeEach(() => {
		stubs.fetchList.resolves();
	});

	afterEach(() => {
		sandbox.reset();
	});

	it('rejects when an unknown list type is requested', () => (
		subject('FooBar', 123)
			.then(() => {
				throw new Error('This should not be called');
			})
			.catch((error) => {
				expect(error.message).to.match(/Unknown list type/);
			})
	));

	it('constructs the correct endpoint', () => (
		subject('TopStories', 123).then(() => {
			sinon.assert.calledWith(
				stubs.fetchList,
				'lists?listType=TopStories&conceptUUID=123'
			);
		})
	));
});
