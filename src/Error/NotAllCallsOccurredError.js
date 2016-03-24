'use strict';

var ArgumentsString = require('../ArgumentsString.js');
var FunctionCallsString = require('../FunctionCallsString.js');

class NotAllCallsOccurredError extends Error {
  constructor(mock, args, completedCalls, incompleteCalls) {
    super('Not all calls occurred\n' +
      new FunctionCallsString(completedCalls, incompleteCalls));
  }
}

module.exports = NotAllCallsOccurredError;
