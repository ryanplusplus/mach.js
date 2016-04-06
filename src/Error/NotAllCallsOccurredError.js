'use strict';

var FunctionCallsString = require('./FunctionCallsString.js');

class NotAllCallsOccurredError extends Error {
  constructor(calls) {
    super('Not all calls occurred\n' +
      new FunctionCallsString(calls));
  }
}

module.exports = NotAllCallsOccurredError;
