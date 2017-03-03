'use strict';

function noop() {}

function isFunction(fn) {
  return typeof fn === 'function';
}
function isObject(x) {
  return x != null && typeof x === 'object';
}

function fill(total, v) {
  const arr = [];
  for (let i = 0; i < total; i += 1) {
    arr.push(v);
  }
  return arr;
}

function extendOptions(options) {
  const opts = options;
  const defaultOptions = {
    time: [30, 100, 500, 1000, 3000],
    size: [1024 * 2, 10 * 1024, 50 * 1024, 100 * 1024, 300 * 1024],
    status: [99, 199, 299, 399, 499],
    busy: [50, 200, 500, 1000],
  };
  Object.keys(defaultOptions).forEach((key) => {
    /* istanbul ignore else */
    if (!opts[key]) {
      opts[key] = defaultOptions[key];
    }
  });
}

function sortedIndex(arr, value) {
  let low = 0;
  let high = arr.length;
  while (low < high) {
    /* eslint no-bitwise:0 */
    const mid = (low + high) >>> 1;
    const computed = arr[mid];
    if (computed < value) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return high;
}

function get(arr, filter, defaultValue) {
  let result;
  arr.forEach((tmp) => {
    if (tmp && filter(tmp)) {
      result = tmp;
    }
  });
  return result || defaultValue;
}

function stats() {
  const args = Array.from(arguments);
  const onStats = get(args, isFunction, noop);
  const options = get(args, isObject, {});
  extendOptions(options);
  const performance = {
    total: 0,
    connecting: 0,
    status: fill(options.status.length + 1, 0),
    time: fill(options.time.length + 1, 0),
    size: fill(options.size.length + 1, 0),
    busy: fill(options.busy.length + 1, 0),
  };

  return (ctx, next) => {
    const start = Date.now();
    performance.total += 1;
    performance.connecting += 1;


    function done(err) {
      const use = Date.now() - start;
      performance.connecting -= 1;
      const connecting = performance.connecting;

      let statusCode = ctx.status;
      /* istanbul ignore else */
      if (err) {
        statusCode = err.status || err.code || 500;
      }

      const bytes = ctx.length || 0;
      const statsResult = {
        connecting,
        total: performance.total,
        use,
        bytes,
        code: statusCode,
      };
      let index = sortedIndex(options.status, statusCode);
      statsResult.status = index;
      performance.status[index] += 1;

      index = sortedIndex(options.time, use);
      statsResult.spdy = index;
      performance.time[index] += 1;

      index = sortedIndex(options.size, bytes);
      statsResult.size = index;
      performance.size[index] += 1;

      index = sortedIndex(options.busy, connecting);
      statsResult.busy = index;
      performance.busy[index] += 1;

      onStats(performance, statsResult, ctx);
      if (err) {
        throw err;
      }
    }
    return next().then(done, done);
  };
}


module.exports = stats;
