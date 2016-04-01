'use strict';

var Node = require('./Node.js');

class TerminusNode extends Node {
  constructor() {
    super('TERMINUS');
  }
}

module.exports = TerminusNode;
