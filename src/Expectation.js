'use strict';

var NotAllCallsOccurredError = require('./Error/NotAllCallsOccurredError.js');

class Expectation {
  constructor(expectedCalls) {
    this._expectedCalls = expectedCalls;
  }

  get completedCalls() {
    return this._expectedCalls.filter(c => c.isComplete);
  }

  get incompleteCalls() {
    return this._expectedCalls.filter(c => !c.isComplete);
  }

  _checkCalls() {
    for (let expectedCall of this._expectedCalls) {
      if (expectedCall.isRequired && !expectedCall.isComplete) {
        throw new NotAllCallsOccurredError(this.completedCalls, this.incompleteCalls);
      }
    }
  }

  // FIXME: finish implementing
}

module.exports = Expectation;
