'use strict';

var Node = require('./Node.js');

class RootNode extends Node {
  constructor() {
    super('ROOT');
  }
}

module.exports = RootNode;
