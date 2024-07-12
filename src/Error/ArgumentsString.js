'use strict';

var Same = require('../Same.js');
var Any = require('../Any.js');
var Callback = require('../Callback.js');

/**
 * Converts arguments into a human readable string
 * @memberof Errors
 */
class ArgumentsString {
  /**
   * Default constructor
   * @param {Object[]} args Function arguments to stringify.
   */
  constructor(args) {
    this._string = this._convertArgsToString(args);
  }

  /**
   * Recursively converts arguments array into string.
   * @param {Object[]} args Function arguments to stringify
   * @returns {string} Function arguments as string.
   */
  _convertArgsToString(args) {
    var strings = [];

    for (var arg of args) {
      if (arg instanceof Same) {
        arg = arg.value;
      }

      if (typeof arg === 'string' || arg instanceof String) {
        strings.push('\'' + arg + '\'');
      }
      else if (arg instanceof Array) {
        strings.push('[' + this._convertArgsToString(arg) + ']');
      }
      else if (arg === undefined) {
        strings.push(String(arg));
      }
      else if (arg instanceof Any) {
        strings.push(String(arg));
      }
      else if (arg instanceof Callback) {
        strings.push(String(arg));
      }
      else if (typeof arg === 'function') {
        strings.push(String(arg));
      }
      else {
        strings.push(JSON.stringify(arg, (key, value) => {
          return value === undefined ? "undefined" : value;
        }));
      }
    }

    return strings.join(', ');
  }

  /**
   * Returns arguments string.
   * @returns {string} Function arguments as string.
   */
  toString() {
    return this._string;
  }
}

module.exports = ArgumentsString;
