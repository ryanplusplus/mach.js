'use strict';

/**
 * Abstract base class for all {@link Tree.Tree} node types.
 * @abstract
 * @memberof Tree
 */
class Node {
  constructor(name) {
    this._name = name;

    /**
     * The node that comes before this node in the {@link Tree.Tree}.
     * This will be undefined for the {@link Tree.RootNode} of a {@link Tree.Tree}.
     * @name Tree.Node#parent
     * @type Tree.Node
     */
    this.parent = undefined;

    /**
     * The node that comes after this node in the {@link Tree.Tree}.
     * This will be undefined for the {@link Tree.TerminusNode} of a {@link Tree.Tree}.
     * @name Tree.Node#child
     * @type Tree.Node
     */
    this.child = undefined;
  }

  /**
   * Gets the human readable name for this node.
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
