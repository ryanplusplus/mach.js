'use strict';

var Node = require('./Node.js');

class ExpectedCallNode extends Node {
  constructor(expectedCall) {
    super(expectedCall.name);
    this.expectedCall = expectedCall;
  }

  clone() {
    return new ExpectedCallNode(this.expectedCall);
  }
}

module.exports = ExpectedCallNode;
