'use strict';

var RootNode = require('./RootNode.js');
var TerminusNode = require('./TerminusNode.js');
var ExpectedCallNode = require('./ExpectedCallNode.js');
var AndNode = require('./AndNode.js');

class Tree {
  constructor(node) {
    this._root = new RootNode();

    this._chainNodes(this._root, node);
    this._chainNodes(node, new TerminusNode());
    this._currentNode = node;
  }

  _chainNodes(a, b) {
    a.child = b;
    b.parent = a;
  }

  and(tree) {
    let andNode;

    if (this._currentNode instanceof ExpectedCallNode) {
      andNode = new AndNode(this._currentNode.expectedCall);
    } else if (this._currentNode instanceof AndNode) {
      andNode = this._currentNode;
    } else {
      throw new Error('Unexpected type for this node, expected AndNode or ExpectedCallNode');
    }

    let node = tree._root.child;

    if (node instanceof ExpectedCallNode) {
      andNode.merge(new AndNode(node.expectedCall));
    } else if (node instanceof AndNode) {
      andNode.merge(node);
    } else {
      throw new Error('Unexpected type for tree node, expected AndNode or ExpectedCallNode')
    }

    this._chainNodes(this._root, andNode);
    this._chainNodes(andNode, node.child);
    this._currentNode = andNode;
  }

  then(tree) {
    let node = tree._root.child;

    this._chainNodes(this._currentNode, node);
  }

  // execute(args) {
  //   // TODO: execute expectation.when actions here
  //   // TODO: if successful, advance execute node
  // }

  toString() {
    return this._root.toString();
  }
}

module.exports = Tree;
