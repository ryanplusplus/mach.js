'use strict';

var RootNode = require('./RootNode.js');
var TerminusNode = require('./TerminusNode.js');
var ExpectedCallNode = require('./ExpectedCallNode.js');
var AndNode = require('./AndNode.js');
var NotAllCallsOccurredError = require('../Error/NotAllCallsOccurredError.js');
var UnexpectedArgumentsError = require('../Error/UnexpectedArgumentsError.js');
var UnexpectedFunctionCallError = require('../Error/UnexpectedFunctionCallError.js');

class Tree {
  constructor(node) {
    this._root = new RootNode();
    this._ignoreOtherCalls = false;
    this._chainNodes(this._root, node);
    this._chainNodes(node, new TerminusNode());
  }

  ignoreOtherCalls() {
    this._ignoreOtherCalls = true;
    this._calls[0].mock._ignoreOtherCalls();
  }

  _chainNodes(a, b) {
    a.child = b;
    b.parent = a;
  }

  and(tree) {
    let andNode;

    if (this._root.child instanceof ExpectedCallNode) {
      andNode = new AndNode(this._root.child.expectedCall);
    }
    else if (this._root.child instanceof AndNode) {
      andNode = this._root.child;
    }
    else {
      throw new Error('Unexpected type for this node, expected AndNode or ExpectedCallNode');
    }

    let node = tree._root.child;

    andNode.merge(node);

    this._chainNodes(this._root, andNode);
    this._chainNodes(andNode, node.child);

    this._ignoreOtherCalls = tree._ignoreOtherCalls;
  }

  then(tree) {
    let node = tree._root.child;

    this._chainNodes(this._root.child, node);

    this._ignoreOtherCalls = tree._ignoreOtherCalls;
  }

  get _calls() {
    let calls = [];

    let node = this._root.child;

    while (!(node instanceof TerminusNode)) {
      if (node instanceof ExpectedCallNode) {
        calls.push(node.expectedCall);
      }
      else if (node instanceof AndNode) {
        for (let expectedCall of node.expectedCalls) {
          calls.push(expectedCall);
        }
      }
      else {
        throw new Error('Unexpected type for node, expected AndNode or ExpectedCallNode');
      }

      node = node.child;
    }

    return calls;
  }

  get _completedCalls() {
    return this._calls.filter(c => c.completed === true);
  }

  get _incompleteCalls() {
    return this._calls.filter(c => c.completed === false);
  }

  _checkCalls() {
    let result = true;
    for (let expectedCall of this._calls) {
      if (expectedCall.required && !expectedCall.completed) {
        result = false;
        break;
      }
    }

    if (!result) {
      throw new NotAllCallsOccurredError(this._calls);
    }
  }

  _asyncWhen(thunk) {
    return new Promise((resolve, reject) => {
        var done = () => resolve();

        return thunk(done).catch((error) => {
          reject(error);
        });
      })
      .then(() => {
        this._checkCalls();
      })
      .catch((error) => {
        return error;
      })
      .then((error) => {
        this._resetMockHandler();
        
        if (error) {
          throw error;
        }
      });
  }

  _syncWhen(thunk) {
    try {
      thunk();
    }
    finally {
      this._resetMockHandler();
    }

    this._checkCalls();
  }

  _resetMockHandler() {
    for (let call of this._calls) {
      call.mock._reset();
    }
  }

  _executeNode(mock, args) {
    // TODO: out of order call error
    // - if not found in expected calls after current node -> UnexpectedFunctionCallError
    // - if found later -> OutOfOrderCallError
    if (this._executingNode instanceof ExpectedCallNode) {
      let expectedCall = this._executingNode.expectedCall;

      if (expectedCall.matches(mock, args)) {
        expectedCall.complete(args);

        this._executingNode = this._executingNode.child;

        if (expectedCall.throwValue !== undefined) {
          throw expectedCall.throwValue;
        }

        return expectedCall.returnValue;
      }

      if (!expectedCall.required) {
        this._executingNode = this._executingNode.child;

        return this._executeNode(mock, args);
      }

      // TODO: Out of order?

      if (!this._ignoreOtherCalls) {
        if (expectedCall.matchesFunction(mock)) {
          throw new UnexpectedArgumentsError(mock, args, this._calls);
        }

        // no match
        throw new UnexpectedFunctionCallError(mock, args, this._calls);
      }

      return;
    }

    if (this._executingNode instanceof AndNode) {
      let matchedExpectedCall = this._executingNode.match(mock, args);

      if (matchedExpectedCall !== undefined) {
        matchedExpectedCall.complete(args);

        if (this._executingNode.allDone()) {
          this._executingNode = this._executingNode.child;
        }

        if (matchedExpectedCall.throwValue !== undefined) {
          throw matchedExpectedCall.throwValue;
        }

        return matchedExpectedCall.returnValue;
      }

      if (this._executingNode.onlyOptionalRemain()) {
        this._executingNode = this._executingNode.child;

        return this._executeNode(mock, args);
      }

      // TODO: Out of order?

      if (!this._ignoreOtherCalls) {
        let partialMatchExpectedCall = this._executingNode.partialMatch(mock);

        if (partialMatchExpectedCall !== undefined) {
          throw new UnexpectedArgumentsError(mock, args, this._calls);
        }

        // no match
        throw new UnexpectedFunctionCallError(mock, args, this._calls);
      }
      return;
    }

    if (this._executingNode instanceof TerminusNode) {
      if (!this._ignoreOtherCalls) {
        throw new UnexpectedFunctionCallError(mock, args, this._calls);
      }
      return;
    }
  }

  _setMockExecutionHandler() {
    for (let call of this._calls) {
      call.mock._handler = (args) => {
        return this._executeNode(call.mock, args);
      };
    }
  }

  execute(thunk) {
    this._setMockExecutionHandler();
    this._executingNode = this._root.child;

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
