'use strict';

var Same = require('../Same.js');

class ArgumentsString {
  constructor(args) {
    this._string = this._convertArgsToString(args);
  }

  _convertArgsToString(args) {
    var strings = [];

    for (var arg of args) {
      if (arg instanceof Same) {
        arg = arg.value;
      }

      if (typeof arg === 'string' || arg instanceof String) {
        strings.push('\'' + arg + '\'');
      } else if (arg instanceof Array) {
        strings.push('[' + this._convertArgsToString(arg) + ']');
      } else {
        strings.push(String(arg));
      }
    }

    return strings.join(', ');
  }

  toString() {
    return this._string;
  }
}

module.exports = ArgumentsString;
