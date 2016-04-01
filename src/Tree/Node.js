'use strict';

class Node {
  constructor(name) {
    this._name = name;
    this.children = [];
    this.parent = undefined;
  }

  get name() {
    return this._name;
  }

  toString() {
    var result = '{ ' + this._name;

    if (this.children.length > 0) {
      result += ' [' + this.children.join(', ') + ']';
    }

    result += ' }';

    return result;
  }
}

module.exports = Node;
