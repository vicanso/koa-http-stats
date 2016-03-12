'use strict';
const util = require('util');
/* istanbul ignore next */
const noop = function() {};

module.exports = stats;

function stats(options, onStats) {
	/* istanbul ignore else */
	if (util.isFunction(options)) {
		onStats = options;
		options = null;
	}
	options = options || {};
	extendOptions(options);
	onStats = onStats || noop;
	const performance = {
		total: 0,
		connecting: 0,
		status: fill(options.status.length + 1, 0),
		time: fill(options.time.length + 1, 0),
		size: fill(options.size.length + 1, 0)
	};

	return (ctx, next) => {
		const start = Date.now();
		performance.total++;
		performance.connecting++;
		return next().then(done, done);

		function done(err) {
			const use = Date.now() - start;
			performance.connecting--;


			let statusCode = ctx.status;
			/* istanbul ignore else */
			if (err) {
				statusCode = err.status || err.code || 500;
			}

			const bytes = ctx.length || 0;
			const statsResult = {
				connecting: performance.connecting,
				total: performance.total,
				use: use,
				bytes: bytes,
				code: statusCode
			};
			/* istanbul ignore else */
			if (options.status) {
				const index = sortedIndex(options.status, statusCode);
				statsResult.status = index;
				performance.status[index]++;
			}
			/* istanbul ignore else */
			if (options.time) {
				const index = sortedIndex(options.time, use);
				statsResult.spdy = index;
				performance.time[index]++;
			}
			/* istanbul ignore else */
			if (options.size) {
				const index = sortedIndex(options.size, bytes);
				statsResult.size = index;
				performance.size[index]++;
			}
			onStats(performance, statsResult);
			if (err) {
				throw err;
			}
		}
	};
}


function fill(total, v) {
	const arr = [];
	for (let i = 0; i < total; i++) {
		arr.push(v);
	}
	return arr;
}

function extendOptions(options) {
	const defaultOptions = {
		time: [30, 100, 500, 1000, 3000],
		size: [1024 * 2, 10 * 1024, 50 * 1024, 100 * 1024, 300 * 1024],
		status: [99, 199, 299, 399, 499]
	};
	Object.keys(defaultOptions).forEach(function(key) {
		/* istanbul ignore else */
		if (!options[key]) {
			options[key] = defaultOptions[key];
		}
	});
}

function sortedIndex(arr, value) {
	let low = 0,
		high = arr.length;
	while (low < high) {
		let mid = (low + high) >>> 1,
			computed = arr[mid];
		if (computed < value) {
			low = mid + 1;
		} else {
			high = mid;
		}
	}
	return high;
}