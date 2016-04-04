'use strict';

var RootNode = require('./RootNode.js');
var TerminusNode = require('./TerminusNode.js');
var ExpectedCallNode = require('./ExpectedCallNode.js');
var AndNode = require('./AndNode.js');
var NotAllCallsOccurredError = require('../Error/NotAllCallsOccurredError.js');

class Tree {
  constructor(node) {
    this._root = new RootNode();
    // TODO: ensure this transfers between trees during and and then?
    this.ignoreOtherCalls = false;
    this._chainNodes(this._root, node);
    this._chainNodes(node, new TerminusNode());
  }

  _chainNodes(a, b) {
    a.child = b;
    b.parent = a;
  }

  and(tree) {
    let andNode;

    if (this._root.child instanceof ExpectedCallNode) {
      andNode = new AndNode(this._root.child.expectedCall);
    } else if (this._root.child instanceof AndNode) {
      andNode = this._root.child;
    } else {
      throw new Error('Unexpected type for this node, expected AndNode or ExpectedCallNode');
    }

    let node = tree._root.child;

    andNode.merge(node);

    this._chainNodes(this._root, andNode);
    this._chainNodes(andNode, node.child);
  }

  then(tree) {
    let node = tree._root.child;

    this._chainNodes(this._root.child, node);
  }

  _getCalls() {
    let calls = [];

    let node = this._root.child;

    while (!(node instanceof TerminusNode)) {
      if (node instanceof ExpectedCallNode) {
        calls.push(node.expectedCall);
      } else if (node instanceof AndNode) {
        for (let expectedCall of node.expectedCalls) {
          calls.push(expectedCall);
        }
      } else {
        throw new Error('Unexpected type for node, expected AndNode or ExpectedCallNode');
      }

      node = node.child;
    }

    return calls;
  }

  get completedCalls() {
    return this._getCalls().filter(c => c.completed === true);
  }

  get incompleteCalls() {
    return this._getCalls().filter(c => c.completed === false);
  }

  checkCalls() {
    let result = true;
    for (let expectedCall of this._getCalls()) {
      if (expectedCall.required && !expectedCall.completed) {
        result = false;
        break;
      }
    }

    if (!result) {
      throw new NotAllCallsOccurredError(this.completedCalls, this.incompleteCalls);
    }
  }

  // execute(thunk) {
  //   // TODO: execute expectation.when actions here
  //   // TODO: if successful, advance execute node
  // }

  toString() {
    return this._root.toString();
  }
}

module.exports = Tree;
