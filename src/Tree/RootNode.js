'use strict';

var Node = require('./Node.js');

/**
* Represents root of all {@link Tree.Tree}s.
* @memberof Tree
*/
class RootNode extends Node {
  constructor() {
    super('ROOT');
  }
}

module.exports = RootNode;
