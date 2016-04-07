'use strict';

/**
 * Abstract base class for all {@link Tree} node types.
 * @abstract
 */
class Node {
  constructor(name) {
    this._name = name;
    this.child = undefined;
    this.parent = undefined;
  }

  /**
   * Gets the human readable name for this {@link Node}.
   * @returns {string} Human readable name of this node.
   */
  get name() {
    return this._name;
  }

  /**
   * Returns this node as a string.
   * @return {string} This node in string form.
   */
  toString() {
    var result = '{ ' + this.name;

    if (this.child !== undefined) {
      result += ' [' + this.child.toString() + ']';
    }

    result += ' }';

    return result;
  }
}

module.exports = Node;
