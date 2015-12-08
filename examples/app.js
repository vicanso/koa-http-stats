'use strict';
const Koa = require('koa');
const httpStats = require('..')

const app = new Koa();
app.use(httpStats(function(performance) {
	// {"total":2,"connecting":1,"status":{"20x":1},"time":{"puma":1},"size":{"2KB":1}}
	console.info(JSON.stringify(performance));
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

app.listen(3000);