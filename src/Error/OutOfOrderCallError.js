'use strict';

var ArgumentsString = require('../ArgumentsString.js');
var FunctionCallsString = require('../FunctionCallsString.js');

class OutOfOrderCallError extends Error {
  constructor(mock, args, completedCalls, incompleteCalls) {
    super('Out of order function call ' +
      mock._name +
      '(' + new ArgumentsString(args) + ')' +
      new FunctionCallsString(completedCalls, incompleteCalls));
  }
}

module.exports = OutOfOrderCallError;
