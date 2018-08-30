const proxyquire = require('proxyquire');
const { expect } = require('chai');
const sinon = require('sinon');
const nock = require('nock');

const fixtureLists = require('../../fixtures/list-found.json');
const fixtureContent = require('../../fixtures/elastic-mget.json');

const sandbox = sinon.sandbox.create();

const stubs = {
	client: {
		mget: sandbox.stub()
	}
};

const subject = proxyquire('../../../lib/helpers/fetch-list', {
	'@financial-times/n-es-client': stubs.client
});

const LIST_ID = '520ddb76-e43d-11e4-9e89-00144feab7de';

const ENDPOINT = `lists/${LIST_ID}`;

describe('lib/helpers/fetch-list', () => {
	afterEach(() => {
		nock.isDone();
		nock.cleanAll();
		sandbox.reset();
	});

	context('Accepts options', () => {
		beforeEach(() => {
			nock('https://api.ft.com/')
				.get('/' + ENDPOINT)
				.reply(200, fixtureLists);

			stubs.client.mget.resolves(fixtureContent);
		});

		it('accepts a fields parameter', () => (
			subject(ENDPOINT, { fields: ['id', 'title'] }).then(() => {
				sinon.assert.calledWith(
					stubs.client.mget,
					sinon.match.object,
					sinon.match.number
				);

				sinon.assert.calledWith(
					stubs.client.mget,
					sinon.match({
						docs: [
							{
								_id: '44558030-1ae8-11e8-aaca-4574d7dabfb6',
								_source: [ 'id', 'title' ]
							},
							{
								_id: '90c0f8e8-17fd-11e8-9e9c-25c814761640',
								_source: [ 'id', 'title' ]
							},
							{
								_id: 'fbc63376-1ab2-11e8-aaca-4574d7dabfb6',
								_source: [ 'id', 'title' ]
							},
							{
								_id: '56dbd2d8-1a2d-11e8-aaca-4574d7dabfb6',
								_source: [ 'id', 'title' ]
							}
						]
					})
				);
			})
		));
	});

	context('Response - list found', () => {
		beforeEach(() => {
			nock('https://api.ft.com')
				.get('/' + ENDPOINT)
				.reply(200, fixtureLists);

			stubs.client.mget.resolves(fixtureContent);
		});

		it('returns an object', () => (
			subject(ENDPOINT).then((result) => {
				expect(result).to.include.keys('id', 'title', 'items', 'layoutHint');
			})
		));

		it('appends content items', () => (
			subject(ENDPOINT).then((result) => {
				result.items.forEach((item) => {
					expect(item).to.include.keys('id', 'url', 'title', 'publishedDate');
				});
			})
		));
	});

	context('Response - list not found', () => {
		beforeEach(() => {
			nock('https://api.ft.com')
				.get('/' + ENDPOINT)
				.reply(404);

			stubs.client.mget.resolves(fixtureContent);
		});

		it('throws an HTTP error', () => (
			subject(ENDPOINT)
				.then((result) => {
					expect(result).to.equal('This should never run');
				})
				.catch((error) => {
					expect(error).to.be.an('error');
					expect(error.name).to.equal('NotFoundError');
				})
		));
	});

	context('Response - list without items', () => {
		beforeEach(() => {
			const fixtureWithoutItems = { ...fixtureLists };
			delete fixtureWithoutItems.items;
			nock('https://api.ft.com')
				.get('/' + ENDPOINT)
				.reply(200, fixtureWithoutItems);
		});

		it('returns an object without items', () => (
			subject(ENDPOINT).then((result) => {
				expect(result).to.include.keys('id', 'title', 'layoutHint');
			})
		));
	});

	context('Response - fetch items failure', () => {
		beforeEach(() => {
			nock('https://api.ft.com')
				.get('/' + ENDPOINT)
				.reply(200, fixtureLists);

			stubs.client.mget.rejects(new Error('Oh dear'));
		});

		it('returns the underlying error', () => (
			subject(ENDPOINT)
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
