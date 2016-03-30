'use strict';

var FunctionCallsString = require('./FunctionCallsString.js');

class NotAllCallsOccurredError extends Error {
  constructor(completedCalls, incompleteCalls) {
    super('Not all calls occurred\n' +
      new FunctionCallsString(completedCalls, incompleteCalls));
  }
}

module.exports = NotAllCallsOccurredError;
