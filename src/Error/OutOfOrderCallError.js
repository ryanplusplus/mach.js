'use strict';

var ArgumentsString = require('./ArgumentsString.js');
var FunctionCallsString = require('./FunctionCallsString.js');

class OutOfOrderCallError extends Error {
  constructor(mock, args, calls) {
    super('Out of order function call ' +
      mock._name +
      '(' + new ArgumentsString(args) + ')' +
      new FunctionCallsString(calls));
  }
}

module.exports = OutOfOrderCallError;
