'use strict';

var _ = require('underscore');

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
}

module.exports = Same;
