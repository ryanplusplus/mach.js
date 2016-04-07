'use strict';

var _ = require('underscore');

/**
 * Represents an argument with a custom equality comparison.
 * Used when `===` does not suffice.
 */
class Same {
  constructor(value, matcher) {
    this._value = value;
    this._matcher = matcher || _.isEqual;
  }

  get value() {
    return this._value;
  }

  get matcher() {
    return this._matcher;
  }

  toString() {
    return 'Same {value: ' + this.value + ', matcher: ' + this.matcher + '}';
  }
}

module.exports = Same;
