# koa-http-stats
	
	HTTP Stats middleware for Koa. This is an useful simple stats, include: request total, request connecting total, request handle time and so on.

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

// app.use(httpStats(options, onStats));

app.use(httpStats(function(performance, stats){
	// {"total":2,"connecting":1,"status":{"20x":1},"time":{"puma":1},"size":{"2KB":1}}
	console.info(JSON.stringify(performance));

	// { connecting: 0,total: 1,use: 2,statusDesc: '50x',status: 500,timeLevel: 'puma',sizeLevel: '2KB' }
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

- `time` time stats config, default: `{"v":[300,500,1000,3000],"desc":["puma","tiger","deer","rabbit","turtle"]}`

- `size` size stats config, default: `{"v":[2048,10240,51200,102400,307200],"desc":["2KB","10KB","50KB","100KB","300KB",">300KB"]}`

- `status` status stats config, default: `{"v":[199,299,399,499,599],"desc":["10x","20x","30x","40x","50x","xxx"]}`


#### onStats

When a request is done, the function will be trigger. 


## License

MIT