'use strict';
const Koa = require('koa');
const httpStats = require('..')

const app = new Koa();
app.use(httpStats(function(performance, stats) {
	// {"total":1,"connecting":0,"status":[0,0,1,0,0,0],"time":[1,0,0,0,0,0],"size":[1,0,0,0,0,0]}
	console.info(JSON.stringify(performance));
	// {"connecting":0,"total":1,"use":4,"bytes":11,"code":200,"status":2,"spdy":0,"size":0}
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

app.listen(3000);