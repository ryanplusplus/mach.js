'use strict';

var Node = require('./Node.js');

/**
* Represents the last node in a {@link Tree};
*/
class TerminusNode extends Node {
  constructor() {
    super('TERMINUS');
  }
}

module.exports = TerminusNode;
