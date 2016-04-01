'use strict';

var RootNode = require('./RootNode.js');
var TerminusNode = require('./TerminusNode.js');
var ExpectedCallNode = require('./ExpectedCallNode.js');
var Permutations = require('./Permutations.js');

class Tree {
  constructor() {
    this._root = new RootNode();
    this._terminus = new TerminusNode();
    this._currentNode = this._root;
    this._executeNode = this._root;

    this._pushNode(this._terminus);
  }

  _chainNodes(currentNode, node) {
    currentNode.children.push(node);
    node.parent = currentNode;
  }

  _pushNode(node) {
    this._chainNodes(this._currentNode, node);
  }

  _addNode(node) {
    let terminus = this._currentNode.children.pop();

    this._pushNode(node);

    this._currentNode = node;

    this._pushNode(terminus);
  }

  _popNode() {
    let terminus = this._currentNode.children.pop();

    this._currentNode = this._currentNode.parent;
    let node = this._currentNode.children.pop();

    this._pushNode(terminus);

    return node;
  }

  _addTree(tree) {
    let terminus = this._currentNode.children.pop();

    this._pushNode(tree._root);

    this._currentNode = tree._terminus;

    this._pushNode(terminus);
  }

  _popTree() {
    let terminus = this._currentNode.children.pop();

    let node = this._currentNode;

    let nodes = [];

    // jump up the tree until we find it's root
    while (true) {
      node = node.parent;

      if (node instanceof RootNode) {
        break;
      }

      // collect list of each unique node while we traverse the subtree
      nodes.push(node);
    }

    // get node that comes before subtree root
    this._currentNode = node.parent;

    // 'delete' the subtree
    this._currentNode.children = [];

    this._pushNode(terminus);

    return nodes;
  }

  _generateAndTree(nodes) {
    let tree = new Tree();
    tree._root.children.pop();

    let i = 0;
    for (let node of nodes) {
      node.id = i++;
    }

    let permutations = Permutations.permute(nodes);

    for (let permutation of permutations) {
      let currentNode = tree._root;

      for (let node of permutation) {
        let filteredNodes = currentNode.children.filter(n => n.id === node.id);

        if (filteredNodes.length === 0) {
          let clone = node.clone();
          clone.id = node.id;
          this._chainNodes(currentNode, clone);
          node = clone;
        } else {
          node = filteredNodes[0];
        }

        currentNode = node;
      }

      this._chainNodes(currentNode, tree._terminus);
    }

    return tree;
  }

  and(expectation) {
    let node = new ExpectedCallNode(expectation._expectedCalls.last());

    if (this._currentNode instanceof TerminusNode) {
      // - pop off existing AND subtree, add new node, re-insert
      this._addTree(this._generateAndTree(this._popTree().concat(node)));
    } else {
      // - pop off current node, create new AND subtree
      this._addTree(this._generateAndTree([this._popNode(), node]));
    }
  }

  then(expectation) {
    this._addNode(new ExpectedCallNode(expectation._expectedCalls.last()));
  }

  execute(args) {
    // TODO: execute expectation.when actions here
    // TODO: if successful, advance execute node
  }

  toString() {
    return this._root.toString();
  }
}

module.exports = Tree;
