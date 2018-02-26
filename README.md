# n-lists-client

[![CircleCI](https://circleci.com/gh/Financial-Times/n-lists-client.svg?style=svg)](https://circleci.com/gh/Financial-Times/n-lists-client) [![Coverage Status](https://coveralls.io/repos/github/Financial-Times/n-lists-client/badge.svg?branch=master)](https://coveralls.io/github/Financial-Times/n-lists-client?branch=master)

A very thin wrapper around the [Content API][1] and [n-es-client][2] to search and retrieve content from lists in a simple, DRY manner.

```js
const lists = require('@financial-times/n-lists-client');

lists.get('520ddb76-e43d-11e4-9e89-00144feab7de').then((data) => { … });
```

## Installation

```sh
# install from NPM
$ npm i -S @financial-times/n-lists-client

# add Content API key
export API_KEY=123

# add Elasticsearch read AWS access key
export ES_AWS_ACCESS_KEY=456

# add Elasticsearch read AWS secret access key
export ES_AWS_SECRET_ACCESS_KEY=789
```

## Usage

All methods return a promise. If a request errors then it will be rejected with an appropriate HTTP error.

All methods have an optional `options` argument that accepts a hash of option properties. Current options are:

- `fields` - an array of fields to fetch from Elasticsearch.

All methods have an optional final `timeout` argument that defaults to 3 seconds.

### `.get(uuid[, options][, timeout])`

Get a list by UUID. Options are for the `.mget()` method of `n-es-client`.

#### Example

```js
es.get('520ddb76-e43d-11e4-9e89-00144feab7de', { fields: ['id', 'title'] })
```

[1]: https://developer.ft.com/
[2]: https://github.com/Financial-Times/n-es-client
