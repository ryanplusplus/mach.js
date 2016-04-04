'use strict';

var Node = require('./Node.js');

class AndNode extends Node {
  constructor(expectedCall) {
    super('AND');
    this.expectedCalls = [expectedCall];
  }

  get name() {
    let calls = [];

    for (let expectedCall of this.expectedCalls) {
      calls.push(expectedCall.name);
    }

    return this._name + ' {{ ' + calls.join(', ') + ' }}';
  }

  merge(andNode) {
    for (let expectedCall of andNode.expectedCalls) {
      this.expectedCalls.push(expectedCall);
    }
  }
}

module.exports = AndNode;
