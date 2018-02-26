const proxyquire = require('proxyquire');
const { expect } = require('chai');
const sinon = require('sinon');
const nock = require('nock');

const fixtureLists = require('../fixtures/list-found.json');
const fixtureContent = require('../fixtures/elastic-mget.json');

const sandbox = sinon.sandbox.create();

const stubs = {
	client: {
		mget: sinon.stub()
	}
};

const subject = proxyquire('../../lib/get', {
	'@financial-times/n-es-client': stubs.client
});

const LIST_ID = '520ddb76-e43d-11e4-9e89-00144feab7de';

describe('Get', () => {
	afterEach(() => {
		nock.isDone();
		nock.cleanAll();
		sandbox.reset();
	});

	context('Accepts options', () => {
		beforeEach(() => {
			nock('https://api.ft.com')
				.get(`/lists/${LIST_ID}`)
				.query(true)
				.reply(200, fixtureLists);

			stubs.client.mget.resolves(fixtureContent);
		});

		it('accepts a fields parameter', () => (
			subject(LIST_ID, { fields: ['id', 'title'] }).then(() => {
				sinon.assert.calledWith(
					stubs.client.mget,
					sinon.match.array,
					sinon.match.number
				);

				const options = stubs.client.mget.lastCall.args[0];

				options.forEach((option) => {
					expect(option._id).to.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
					expect(option._source).to.deep.equal([ 'id', 'title' ]);
				});
			})
		));
	});

	context('Response - list found', () => {
		beforeEach(() => {
			nock('https://api.ft.com')
				.get(`/lists/${LIST_ID}`)
				.query(true)
				.reply(200, fixtureLists);

			stubs.client.mget.resolves(fixtureContent);
		});

		it('returns an object', () => (
			subject(LIST_ID).then((result) => {
				expect(result).to.include.keys('id', 'title', 'items', 'layoutHint');
			})
		));

		it('appends content items', () => (
			subject(LIST_ID).then((result) => {
				result.items.forEach((item) => {
					expect(item).to.include.keys('id', 'url', 'title', 'publishedDate');
				});
			})
		));
	});

	context('Response - list not found', () => {
		beforeEach(() => {
			nock('https://api.ft.com')
				.get(`/lists/${LIST_ID}`)
				.query(true)
				.reply(404);

			stubs.client.mget.resolves(fixtureContent);
		});

		it('throws an HTTP error', () => (
			subject(LIST_ID)
				.then((result) => {
					expect(result).to.equal('This should never run');
				})
				.catch((error) => {
					expect(error).to.be.an('error');
					expect(error.name).to.equal('NotFoundError');
				})
		));
	});

	context('Response - fetch items failure', () => {
		beforeEach(() => {
			nock('https://api.ft.com')
				.get(`/lists/${LIST_ID}`)
				.query(true)
				.reply(200, fixtureLists);

			stubs.client.mget.rejects(new Error('Oh dear'));
		});

		it('returns the underlying error', () => (
			subject(LIST_ID)
				.then((result) => {
					expect(result).to.equal('This should never run');
				})
				.catch((error) => {
					expect(error).to.be.an('error');
					expect(error.message).to.equal('Oh dear');
				})
		));
	});
});
