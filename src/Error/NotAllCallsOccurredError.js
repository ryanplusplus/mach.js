'use strict';

var FunctionCallsString = require('./FunctionCallsString.js');

class NotAllCallsOccurredError extends Error {
  constructor(calls) {
    super('Not all calls occurred' +
      new FunctionCallsString(calls));
  }
}

module.exports = NotAllCallsOccurredError;
