'use strict';

var Node = require('./Node.js');
var ExpectedCallNode = require('./ExpectedCallNode.js');

/**
 * Represent a result of 'and'ing two {@link Expectation}s.
 * Execution order of the {@link ExpectedCall}s in a {@link AndNode} is unrestricted.
 *
 * IE: AND(1, 2, 3) can execute in any of the following orders:
 * <ul>
 *  <li>1, 2, 3</li>
 *  <li>1, 3, 2</li>
 *  <li>2, 1, 3</li>
 *  <li>2, 3, 1</li>
 *  <li>3, 1, 2</li>
 *  <li>3, 2, 1</li>
 * </ul>
 * @memberof Tree
 */
class AndNode extends Node {
  /**
   * Creates a new {@link Tree.AndNode}
   * @param {ExpectedCall} expectedCall Initial expected call for this node.
   */
  constructor(expectedCall) {
    super('AND');
    /**
     * {@link ExpectedCall}s for this node.
     * @name Tree.AndNode#expectedCalls
     * @type ExpectedCall[]
     */
    this.expectedCalls = [expectedCall];
  }

  /**
   * Gets the human readable name for this node.
   * @returns {string} Human readable name of this node.
   */
  get name() {
    let calls = [];

    for (let expectedCall of this.expectedCalls) {
      calls.push(expectedCall.name);
    }

    return this._name + ' {{ ' + calls.join(', ') + ' }}';
  }

  /**
   * Merges this node and another {@link Tree.AndNode} or {@link Tree.ExpectedCallNode}
   * @param {Tree.AndNode|Tree.ExpectedCallNode} node Node to merge with this node.
   */
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

  /**
   * Determines the the {@link Mock} and args match any {@link ExpectedCall}s in this node.
   * @param {Mock} mock Mock that was called.
   * @param {object[]} args Arguments for the call.
   * @return {ExpectedCall|undefined} The matching {@link ExpectedCall} if found; otherwise undefined.
   */
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

  /**
   * Determines the the {@link Mock} partially matches any {@link ExpectedCall}s in this node.
   * @param {Mock} mock Mock that was called.
   * @return {ExpectedCall|undefined} The matching expected call if found; otherwise undefined.
   */
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

  /**
   * Checks to see if all {@link ExpectedCall}s in this node have been completed.
   * @return {boolean} True if all calls are completed; otherwise false.
   */
  allDone() {
    for (let expectedCall of this.expectedCalls) {
      if (!expectedCall.completed) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks to see if only optional {@link ExpectedCall}s remain in this node.
   * @return {boolean} True if all incomplete calls are optional; otherwise false.
   */
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
