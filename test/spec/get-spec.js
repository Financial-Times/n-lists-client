const proxyquire = require('proxyquire');
const sinon = require('sinon');

const sandbox = sinon.sandbox.create();

const stubs = {
	fetchList: sandbox.stub()
};

const subject = proxyquire('../../lib/get', {
	'./helpers/fetch-list': stubs.fetchList
});

describe('lib/get', () => {
	beforeEach(() => {
		stubs.fetchList.resolves();
	});

	afterEach(() => {
		sandbox.reset();
	});

	it('constructs the correct endpoint', () => (
		subject(123).then(() => {
			sinon.assert.calledWithMatch(
				stubs.fetchList,
				'lists/123'
			);
		})
	));

	it('passes options through', () => (
		subject(123, { option: 'value' }).then(() => {
			sinon.assert.calledWithMatch(
				stubs.fetchList,
				sinon.match.string,
				sinon.match({ option: 'value' })
			);
		})
	));

	it('passes timeout through', () => (
		subject(123, undefined, 5000).then(() => {
			sinon.assert.calledWithMatch(
				stubs.fetchList,
				sinon.match.string,
				sinon.match.undefined,
				5000
			);
		})
	));
});
