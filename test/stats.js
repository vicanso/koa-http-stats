'use strict';
const Koa = require('koa');
const stats = require('..');
const request = require('supertest');
const assert = require('assert');

describe('http-stats', function() {


	it('should throw error when options stats value size is not equal desc size - 1', function(done) {
		try {
			stats({
				time: {
					v: [300, 500, 1000, 3000],
					desc: ['puma', 'tiger', 'deer', 'rabbit']
				}
			});
		} catch (err) {
			assert.equal(err.message, 'time stats value size is not equal desc size - 1');
			done();
		}
	});

	it('set stats array success', done => {
		const app = new Koa();
		app.use(stats({
			time: [300, 500, 1001, 3000]
		}, (performance, statsResult) => {
			assert.equal(statsResult.timeLevel, 2);
		}));

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

		request(app.listen())
			.get('/wait')
			.expect(200, 'Wait for 1000ms', done);
	});


	it('should send stats successful', function(done) {
		const app = new Koa();
		const incrementKeyList = 'http.processing http.processTotal http.status.20x http.timeLevel.rabbit http.sizeLevel.2KB'.split(' ');
		const sdc = {
			increment: function(key) {
				assert.equal(key, incrementKeyList.shift());
			},
			decrement: function(key) {
				assert.equal(key, 'http.processing');
			},
			timing: function(key) {
				assert.equal(key, 'http.use');
			}
		};
		app.use(stats({
			sdc: sdc
		}));
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

		request(app.listen())
			.get('/wait')
			.expect(200, 'Wait for 1000ms', done);
	});


	it('should set onStats successful', function(done) {
		this.timeout = 5000;
		const app = new Koa();
		const onStats = (performance) => {
			if (performance.total === 1) {
				assert.equal(performance.connecting, 0);
				assert.equal(performance.status['20x'], 1);
				assert.equal(performance.time.puma, 1);
				assert.equal(performance.size['2KB'], 1);
				done();
			};
		};
		app.use(stats({}, onStats));
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
				if (err) {
					done(err);
				}
			});

		setTimeout(function() {
			request(server)
				.get('/wait')
				.expect(200, 'Wait for 1000ms')
				.end(function(err, res) {
					if (err) {
						done(err);
					}
				});
		}, 100);

	});


	it('should send stats successful when throw an error', function(done) {
		const app = new Koa();
		const onStats = (performance, stats) => {
			assert.equal(stats.statusDesc, '50x');
			assert.equal(stats.status, 500);
			assert.equal(stats.timeLevel, 'puma');
			assert.equal(stats.sizeLevel, '2KB');
			assert(stats.use);
		};
		app.use(stats({}, onStats));
		app.use(ctx => {
			i.j = 0;
		});

		request(app.listen())
			.get('/wait')
			.expect(500, done);
	});
});