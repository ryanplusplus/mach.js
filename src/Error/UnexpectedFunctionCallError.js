'use strict';

var ArgumentsString = require('../ArgumentsString.js');
var FunctionCallsString = require('../FunctionCallsString.js');

class UnexpectedFunctionCallError extends Error {
  constructor(mock, args, completedCalls, incompleteCalls) {
    super('Unexpected function call ' +
      mock._name +
      '(' + new ArgumentsString(args) + ')' +
      new FunctionCallsString(completedCalls, incompleteCalls));
  }
}

module.exports = UnexpectedFunctionCallError;
