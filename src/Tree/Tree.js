'use strict';

var RootNode = require('./RootNode.js');
var TerminusNode = require('./TerminusNode.js');
var ExpectedCallNode = require('./ExpectedCallNode.js');
var AndNode = require('./AndNode.js');
var NotAllCallsOccurredError = require('../Error/NotAllCallsOccurredError.js');

class Tree {
  constructor(node) {
    this._root = new RootNode();
    // TODO: ensure this transfers between trees during 'and' and 'then'?
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

  get _completedCalls() {
    return this._getCalls().filter(c => c.completed === true);
  }

  get _incompleteCalls() {
    return this._getCalls().filter(c => c.completed === false);
  }

  _checkCalls() {
    let result = true;
    for (let expectedCall of this._getCalls()) {
      if (expectedCall.required && !expectedCall.completed) {
        result = false;
        break;
      }
    }

    if (!result) {
      throw new NotAllCallsOccurredError(this._completedCalls, this._incompleteCalls);
    }
  }

  _asyncWhen(thunk) {
    return new Promise((resolve) => {
        var done = () => resolve();

        return thunk(done);
      })
      .then(() => {
        this._checkCalls();
      })
      .catch((error) => {
        return error;
      })
      .then((error) => {
        // TODO: reset for whole chain
        // this._mock._resetHandler();

        if (error) {
          throw error;
        }
      });
  }

  _syncWhen(thunk) {
    try {
      thunk();
    } finally {
      // TODO: reset for whole chain
      // this._mock._resetHandler();
    }

    this._checkCalls();
  }

  execute(thunk) {
    // TODO: set for whole chain
    //- need to ensure each mock gets its expectations references and not just all the same one?
    // this._mock._handler = (args) => {
    // TODO: Implement
    // var partialMatch;
    // var incompleteExpectationFound = false;
    //
    // for (var i = this._callIndex; i < this._expectedCalls.length; i++) {
    //   var expectedCall = this._expectedCalls[i];
    //   if (!expectedCall.completed) {
    //     if (expectedCall.matches(this._mock, args)) {
    //       if (expectedCall.strictlyOrdered && incompleteExpectationFound) {
    //         throw new OutOfOrderCallError(this._mock, args, this._completedCalls, this._incompleteCalls);
    //       }
    //
    //       if (expectedCall.strictlyOrdered) {
    //         this._callIndex = i;
    //       }
    //
    //       expectedCall.complete(args);
    //
    //       if (expectedCall.throwValue) {
    //         throw expectedCall.throwValue;
    //       }
    //
    //       return expectedCall.returnValue;
    //     }
    //
    //     if (expectedCall.matchesFunction(this._mock)) {
    //       partialMatch = expectedCall;
    //     }
    //   }
    //
    //   if (partialMatch) {
    //     throw new UnexpectedArgumentsError(this._mock, args, this._completedCalls, this._incompleteCalls);
    //   }
    //
    //   if (!this._ignoreOtherCalls) {
    //     throw new UnexpectedFunctionCallError(this._mock, args, this._completedCalls, this._incompleteCalls);
    //   }
    // }
    // };

    switch (thunk.length) {
      case 0:
        return this._syncWhen(thunk);
      default:
        return this._asyncWhen(thunk);
    }
  }

  toString() {
    return this._root.toString();
  }
}

module.exports = Tree;
