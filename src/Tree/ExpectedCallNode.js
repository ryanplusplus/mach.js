'use strict';

var Node = require('./Node.js');

class ExpectedCallNode extends Node {
  constructor(expectedCall) {
    super(expectedCall.name);
    this.expectedCall = expectedCall;
  }
}

module.exports = ExpectedCallNode;
