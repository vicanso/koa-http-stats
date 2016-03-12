'use strict';
const Koa = require('koa');
const httpStats = require('..');
const request = require('supertest');
const assert = require('assert');

describe('http-stats', done => {

	it('should set onStats success', done => {
		const app = new Koa();
		const onStats = (performance, statsResult) => {
			assert.equal(performance.total, 1);
			assert.equal(performance.connecting, 0);
			assert.equal(performance.status.length, 6);
			assert.equal(performance.time.length, 6);
			assert.equal(performance.size.length, 6);
			assert.equal(performance.status[2], 1);
			assert.equal(performance.time[0], 1);
			assert.equal(performance.size[0], 1);
			assert.equal(performance.busy[0], 1);

			assert(statsResult.use > 0);
			assert.equal(statsResult.bytes, 11);
			assert.equal(statsResult.status, 2);
			assert.equal(statsResult.spdy, 0);
			assert.equal(statsResult.size, 0);
			assert.equal(statsResult.busy, 0);
		};
		app.use(httpStats(onStats));
		app.use(ctx => {
			if (ctx.url === '/wait') {
				return new Promise(function(resolve, reject) {
					ctx.body = 'Wait for 1000ms';
					setTimeout(resolve, 1000);
				});
			} else {
				ctx.body = 'Hello World';
			}
		});

		const server = app.listen();
		request(server)
			.get('/')
			.expect(200, 'Hello World')
			.end(function(err, res) {
				done(err);
			});

	});

	it('should get stats success when an error throw', done => {
		const app = new Koa();
		const onStats = (performance, statsResult) => {

			assert.equal(statsResult.code, 500);
			assert.equal(statsResult.status, 5);
			assert(statsResult.use > 1000);
			assert.equal(statsResult.spdy, 4);
		};
		app.use(httpStats(onStats));
		app.use(ctx => {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					reject(new Error('ERROR'));
				}, 1000);
			});
		});

		request(app.listen())
			.get('/')
			.expect(500, done);
	});

	it('should set options success', done => {
		const app = new Koa();
		const onStats = (performance, statsResult) => {
			assert.equal(statsResult.status, 3);
		};
		app.use(httpStats({
			status: [1, 2, 3]
		}, onStats));
		app.use(ctx => {
			ctx.body = 'Hello World';
		});

		request(app.listen())
			.get('/')
			.expect(200, done);
	});


	it('should get connecting count success', done => {
		let hasChecked = false;
		const app = new Koa();
		const onStats = (performance, statsResult) => {
			if (!hasChecked) {
				assert.equal(performance.connecting, 1);
				hasChecked = true;
			}
		};
		app.use(httpStats(onStats));
		app.use(ctx => {
			if (ctx.url === '/wait') {
				return new Promise(function(resolve, reject) {
					ctx.body = 'Wait for 1000ms';
					setTimeout(resolve, 1000);
				});
			} else {
				ctx.body = 'Hello World';
			}
		});

		const server = app.listen();

		request(server)
			.get('/wait')
			.expect(200, 'Wait for 1000ms')
			.end(done);
		request(server)
			.get('/')
			.expect(200, 'Hello World')
			.end((err) => {
			});
	});
});