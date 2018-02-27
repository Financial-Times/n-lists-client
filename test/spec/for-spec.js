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
			sinon.assert.calledWithMatch(
				stubs.fetchList,
				'lists?curatedTopStoriesFor=123'
			);
		})
	));

	it('passes options through', () => (
		subject('OpinionAnalysis', 456, { option: 'value' }).then(() => {
			sinon.assert.calledWithMatch(
				stubs.fetchList,
				sinon.match.string,
				sinon.match({ option: 'value' })
			);
		})
	));

	it('passes timeout through', () => (
		subject('SpecialReports', 789, undefined, 5000).then(() => {
			sinon.assert.calledWithMatch(
				stubs.fetchList,
				sinon.match.string,
				sinon.match.undefined,
				5000
			);
		})
	));
});
