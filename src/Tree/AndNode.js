'use strict';

var Node = require('./Node.js');
var ExpectedCallNode = require('./ExpectedCallNode.js');

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

  merge(node) {
    let andNode;
    if (node instanceof ExpectedCallNode) {
      andNode = new AndNode(node.expectedCall);
    } else if (node instanceof AndNode) {
      andNode = node;
    } else {
      throw new Error('Unexpected type for node, expected AndNode or ExpectedCallNode');
    }

    for (let expectedCall of andNode.expectedCalls) {
      this.expectedCalls.push(expectedCall);
    }
  }

  match(mock, args) {
    for (let expectedCall of this.expectedCalls) {
      if (expectedCall.completed) {
        continue;
      }

      if (expectedCall.matches(mock, args)) {
        return expectedCall;
      }
    }

    return undefined;
  }

  partialMatch(mock) {
    for (let expectedCall of this.expectedCalls) {
      if (expectedCall.completed) {
        continue;
      }

      if (expectedCall.matchesFunction(mock)) {
        return expectedCall;
      }
    }

    return undefined;
  }

  allDone() {
    for (let expectedCall of this.expectedCalls) {
      if (!expectedCall.completed) {
        return false;
      }
    }

    return true;
  }

  onlyOptionalRemain() {
    for (let expectedCall of this.expectedCalls) {
      if (expectedCall.completed) {
        continue;
      }

      if (expectedCall.required) {
        return false;
      }
    }

    return true;
  }
}

module.exports = AndNode;
