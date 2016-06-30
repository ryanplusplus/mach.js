'use strict';

let RootNode = require('./RootNode.js');
let TerminusNode = require('./TerminusNode.js');
let ExpectedCallNode = require('./ExpectedCallNode.js');
let AndNode = require('./AndNode.js');
let NotAllCallsOccurredError = require('../Error/NotAllCallsOccurredError.js');
let OutOfOrderCallError = require('../Error/OutOfOrderCallError.js');
let UnexpectedArgumentsError = require('../Error/UnexpectedArgumentsError.js');
let UnexpectedFunctionCallError = require('../Error/UnexpectedFunctionCallError.js');

/**
 * Classes the make up the expected execution path.
 * @namespace Tree
 */

/**
 * Represents the expected execution path of all {@link ExpectedCall}s.
 * @memberof Tree
 */
class Tree {
  /**
   * Creates a new {@link Tree.Tree}
   * @param {Tree.AndNode|Tree.ExpectedCallNode} node Inital node in this tree.
   */
  constructor(node) {
    this._root = new RootNode();
    this._ignoreOtherCalls = false;
    this._chainNodes(this._root, node);
    this._chainNodes(node, new TerminusNode());
  }

  /**
   * Tells this tree to ignore unexpected and out of order calls during execution
   * and focus only on the required ones.
   */
  ignoreOtherCalls() {
    this._ignoreOtherCalls = true;
    this._calls[0].mock.ignoreOtherCalls = true;
  }

  /**
   * Chains two nodes together by making `a` the parent of `b`
   * @param {Tree.Node} a Node that will be the parent of b
   * @param {Tree.Node} b Node that will be the child of a
   */
  _chainNodes(a, b) {
    a.child = b;
    b.parent = a;
  }

  /**
   * Gets last non-{@link Tree.TerminusNode} node in this tree.
   * @returns {Tree.Node} Last non-terminus node
   */
  get _lastNode() {
    let node = this._root;

    while(!(node.child instanceof TerminusNode)) {
      node = node.child;
    }

    return node;
  }

  /**
   * Combines two execution {@link Tree.Tree}s together via an `AND` operation.
   * @param {Tree.Tree} tree Tree to combine with this tree.
   */
  and(tree) {
    let andNode;
    let lastNode = this._lastNode;

    if(lastNode instanceof ExpectedCallNode) {
      andNode = new AndNode(lastNode.expectedCall);
    }
    else if(lastNode instanceof AndNode) {
      andNode = lastNode;
    }
    else {
      throw new Error('Unexpected type for this node, expected AndNode or ExpectedCallNode');
    }

    let node = tree._root.child;

    andNode.merge(node);

    this._chainNodes(lastNode.parent, andNode);
    this._chainNodes(andNode, node.child);

    this._ignoreOtherCalls = tree._ignoreOtherCalls;
  }

  /**
   * Combines two execution {@link Tree.Tree}s together via a `THEN` operation.
   * @param {Tree.Tree} tree Tree to combine with this tree.
   */
  then(tree) {
    let node = tree._root.child;

    this._chainNodes(this._lastNode, node);

    this._ignoreOtherCalls = tree._ignoreOtherCalls;
  }

  /**
   * Gets all {@link ExpectedCall}s that come after the specified node.
   * @param {Tree.AndNode|Tree.ExpectedCallNode} node Current node in the tree.
   * @returns {ExpectedCall[]} List of expected calls that come after the specified node.
   */
  _callsAfter(node) {
    let calls = [];

    node = node.child;

    while(!(node instanceof TerminusNode)) {
      if(node instanceof ExpectedCallNode) {
        calls.push(node.expectedCall);
      }
      else if(node instanceof AndNode) {
        for(let expectedCall of node.expectedCalls) {
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

  /**
   * Gets all {@link ExpectedCall}s in this tree.
   * @return {ExpectedCall[]} All the expected calls in this tree.
   */
  get _calls() {
    return this._callsAfter(this._root);
  }

  /**
   * Checks to see if all required {@link ExpectedCall}s in this tree were completed during execution.
   * @throws {Errors.NotAllCallsOccurredError} Will throw an error if any required expected calls are incomplete.
   */
  _checkCalls() {
    let result = true;
    for(let expectedCall of this._calls) {
      if(expectedCall.required && !expectedCall.completed) {
        result = false;
        break;
      }
    }

    if(!result) {
      throw new NotAllCallsOccurredError(this._calls);
    }
  }

  /**
   * Resets all {@link Mock} globals and handlers
   */
  _resetMocks() {
    for(let call of this._calls) {
      call.mock.reset();
    }
  }

  _checkRemainingExpectations(mock, args) {
    if(!this._ignoreOtherCalls) {
      if(this._executingNode.partialMatch(mock)) {
        throw new UnexpectedArgumentsError(mock, args, this._calls);
      }

      if(this._callsAfter(this._executingNode).filter((ec) => ec.matches(mock, args)).length > 0) {
        throw new OutOfOrderCallError(mock, args, this._calls);
      }

      // no match
      throw new UnexpectedFunctionCallError(mock, args, this._calls);
    }
  }

  /**
   * Attempts to execute a call to a {@link Mock}.
   * @param {Mock} mock Mock that was called.
   * @param {object[]} args Arguments for the call.
   * @returns {object|undefined} Will return a value if the mock as a return value; otherwise undefined.
   * @throws {Error} Will throw an error if the mock has a throw value. This is normal and should be handled by the code under test.
   * @throws {Errors.OutOfOrderCallError} Will throw an error if an expected call is made out of order.
   * @throws {Errors.UnexpectedArgumentsError} Will throw an error if an expected call is made with the wrong arguments.
   * @throws {Errors.UnexpectedFunctionCallError} Will throw an error if a call is made and there is not matching expected call.
   */
  _executeNode(mock, args) {
    if(this._executingNode instanceof ExpectedCallNode) {
      let expectedCall = this._executingNode.expectedCall;

      if(expectedCall.matches(mock, args)) {
        this._executingNode = this._executingNode.child;

        return expectedCall.execute(args);
      }

      if(!expectedCall.required) {
        this._executingNode = this._executingNode.child;

        return this._executeNode(mock, args);
      }

      this._checkRemainingExpectations(mock, args);

      return;
    }

    if(this._executingNode instanceof AndNode) {
      let matchedExpectedCall = this._executingNode.match(mock, args);

      if(matchedExpectedCall !== undefined) {
        return matchedExpectedCall.execute(args);
      }

      if(this._executingNode.onlyOptionalRemain()) {
        this._executingNode = this._executingNode.child;

        return this._executeNode(mock, args);
      }

      this._checkRemainingExpectations(mock, args);

      return;
    }

    if(this._executingNode instanceof TerminusNode) {
      if(!this._ignoreOtherCalls) {
        throw new UnexpectedFunctionCallError(mock, args, this._calls);
      }
      return;
    }
  }

  /**
   * Sets execution handlers of all {@link Mock}s in this tree to this trees {@link Tree.Tree#executeNode}.
   */
  _setMockExecutionHandler() {
    this._calls[0].mock.tree = this;

    for(let call of this._calls) {
      call.mock.handler = (args) => this._executeNode(call.mock, args);
    }
  }

  /**
   * Executes the specifed test code.
   * @param {function} thunk Test code.
   * @returns {Promise|undefined} Promise if thunk has a callback argument; otherwise undefined.
   */
  execute(thunk) {
    this._setMockExecutionHandler();

    this._executingNode = this._root.child;

    let sync = true;

    try {
      let t = thunk();

      if(t instanceof Promise) {
        sync = false;

        return t
          .then((value) => {
            this._resetMocks();
            this._checkCalls();
            return value;
          })
          .catch((error) => {
            this._resetMocks();
            throw error;
          });
      }
    }
    finally {
      if(sync) {
        this._resetMocks();
      }
    }

    this._checkCalls();
  }

  /**
   * Converts this tree into a string.
   * @returns {string} This tree in string form.
   */
  toString() {
    return this._root.toString();
  }
}

module.exports = Tree;
