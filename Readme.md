# koa-http-stats

[![Build Status](https://travis-ci.org/vicanso/koa-http-stats.svg?style=flat-square)](https://travis-ci.org/vicanso/koa-http-stats)
[![Coverage Status](https://img.shields.io/coveralls/vicanso/koa-http-stats/master.svg?style=flat)](https://coveralls.io/r/vicanso/koa-http-stats?branch=master)
[![npm](http://img.shields.io/npm/v/koa-http-stats.svg?style=flat-square)](https://www.npmjs.org/package/koa-http-stats)
[![Github Releases](https://img.shields.io/npm/dm/koa-http-stats.svg?style=flat-square)](https://github.com/vicanso/koa-http-stats)

HTTP Stats middleware for Koa2. This is an useful simple stats, include: request total, request connecting total, request handle time and so on.

## Installation

```js
$ npm install koa-http-stats
```

## Examples

  View the [./examples](examples) directory for working examples.


### API

```js
const httpStats = require('koa-http-stats');
const Koa = require('koa');
const app = new Koa();


app.use(httpStats(function(performance, stats, ctx) {
	// {"total":1,"connecting":0,"status":[0,0,1,0,0,0],"time":[1,0,0,0,0,0],"size":[1,0,0,0,0,0],"busy":[1,0,0,0,0]}
	console.info(JSON.stringify(performance));
	// {"connecting":0,"total":1,"use":4,"bytes":11,"code":200,"status":2,"spdy":0,"size":0,"busy":0}
	console.info(JSON.stringify(stats));
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

```

#### options

- `time` time stats config, default: `[30, 100, 500, 1000, 3000]`

- `size` size stats config, default: `[1024 * 2, 10 * 1024, 50 * 1024, 100 * 1024, 300 * 1024]`

- `status` status stats config, default: `[99, 199, 299, 399, 499]`

- `busy` connecting stats config, default: `busy: [50, 200, 500, 1000]`

#### onStats

When a request is done, the function will be trigger.

- `performance` application performance

- `stats` current http stats

- `ctx` koa.js context


## License

MIT
