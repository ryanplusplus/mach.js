'use strict';

var Node = require('./Node.js');

/**
 * Represents an {@link ExpectedCall} in the {@link Tree.Tree}.
 * @memberof Tree
 */
class ExpectedCallNode extends Node {
  /**
   * Creates a new {@link ExpectedCallNode}
   * @param {ExpectedCall} expectedCall The expected call for this node.
   */
  constructor(expectedCall) {
    super(expectedCall.name);

    /**
     * {@link ExpectedCall} for this node.
     * @name Tree.ExpectedCallNode#expectedCall
     * @type ExpectedCall
     */
    this.expectedCall = expectedCall;
  }
}

module.exports = ExpectedCallNode;
