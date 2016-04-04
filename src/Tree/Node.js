'use strict';

class Node {
  constructor(name) {
    this._name = name;
    this.child = undefined;
    this.parent = undefined;
  }

  get name() {
    return this._name;
  }

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
