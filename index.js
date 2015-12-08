'use strict';
const util = require('util');
const noop = function() {};

module.exports = stats;


function stats(options, onStats) {
	if (util.isFunction(options)) {
		onStats = options;
		options = null;
	}
	options = options || {};
	extendOptions(options);
	validate(options);
	onStats = onStats || noop;
	const sdc = options.sdc || {
		increment: noop,
		decrement: noop,
		timing: noop
	};
	const performance = {
		createdAt: (new Date()).toISOString(),
		total: 0,
		connecting: 0,
		status: {},
		time: {},
		size: {}
	};
	return (ctx, next) => {
		const start = Date.now();
		const res = ctx.res;
		const onfinish = done.bind(null, 'finish');
		const onclose = done.bind(null, 'close');
		res.once('finish', onfinish);
		res.once('close', onclose);

		sdc.increment('http.processing');
		sdc.increment('http.processTotal');
		performance.connecting++;
		performance.total++;
		onStats(performance);
		return next().then(function() {
			ctx.set('X-Time', `start:${start},use:${Date.now() - start}`);
		});


		function done() {
			const use = Date.now() - start;
			performance.connecting--;

			sdc.timing('http.use', use);
			sdc.decrement('http.processing');
			/* istanbul ignore else */
			if (options.status) {
				let statusDesc = getDesc(options.status, ctx.status);
				sdc.increment('http.status.' + statusDesc);
				performance.status[statusDesc] = (performance.status[statusDesc] || 0) + 1;
			}
			/* istanbul ignore else */
			if (options.time) {
				let timeDesc = getDesc(options.time, use);
				sdc.increment('http.timeLevel.' + timeDesc);
				performance.time[timeDesc] = (performance.time[timeDesc] || 0) + 1;
			}
			/* istanbul ignore else */
			if (options.size) {
				let length = ctx.length || 0;
				let sizeDesc = getDesc(options.size, length);
				sdc.increment('http.sizeLevel.' + sizeDesc);
				performance.size[sizeDesc] = (performance.size[sizeDesc] || 0) + 1;
			}

			res.removeListener('finish', onfinish);
			res.removeListener('close', onclose);

		}
	};
}

/**
 * [validate description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function validate(options) {
	const validKeys = ['time', 'size', 'status'];
	validKeys.forEach(function(key) {
		const opts = options[key];
		if (opts && opts.v.length !== opts.desc.length - 1) {
			throw new Error(`${key} stats value size is not equal desc size - 1`);
		}
	});
}

/**
 * [extendOptions description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function extendOptions(options) {
	const defaultOptions = {
		time: {
			v: [300, 500, 1000, 3000],
			desc: ['puma', 'tiger', 'deer', 'rabbit', 'turtle']
		},
		size: {
			v: [1024 * 2, 10 * 1024, 50 * 1024, 100 * 1024, 300 * 1024],
			desc: ['2KB', '10KB', '50KB', '100KB', '300KB', '>300KB'],
		},
		status: {
			v: [199, 299, 399, 499, 599],
			desc: ['10x', '20x', '30x', '40x', '50x', 'xxx']
		}
	};
	Object.keys(defaultOptions).forEach(function(key) {
		if (!options[key]) {
			options[key] = defaultOptions[key];
		}
	});
}

/**
 * [getDesc 获取统计的描述]
 * @param  {[type]} data [description]
 * @param  {[type]} value [description]
 * @return {[type]}      [description]
 */
function getDesc(data, value) {
	/* istanbul ignore if */
	if (!data) {
		return 'unknown';
	}
	let index = -1;
	data.v.forEach(function(v, i) {
		if (value > v) {
			index = i;
		}
	});
	return data.desc[index + 1] || 'unknown';
}