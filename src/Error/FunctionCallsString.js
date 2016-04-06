'use strict';

var ArgumentsString = require('./ArgumentsString.js');
var Any = require('../Any.js');

/**
 * Converts {@link ExpectedCall}s into a string.
 */
class FunctionCallsString {
  /**
   * @param {ExpectedCall} calls {@link ExpectedCall}s to stringify
   */
  constructor(calls) {
    var result = '';

    let completedCalls = calls.filter(c => c.completed);

    if (completedCalls.length > 0) {
      result += '\n' + this._completedCallsString(completedCalls);
    }

    let incompleteCalls = calls.filter(c => !c.completed);

    if (incompleteCalls.length > 0) {
      result += '\n' + this._incompleteCallsString(incompleteCalls);
    }

    this._string = result;
  }

  /**
   * Converts completed calls into a string.
   * @param {ExpectedCall[]} completedCalls
   * @returns {string} Completed calls string.
   */
  _completedCallsString(completedCalls) {
    return 'Completed calls:\n' + completedCalls.map((c) => {
        return '\t' + c.name + '(' + new ArgumentsString(c.actualArgs) + ')';
      })
      .join('\n');
  }

  /**
   * Converts incomplete calls into a string.
   * @param {ExpectedCall[]} completedCalls
   * @returns {string} Incomplete calls string.
   */
  _incompleteCallsString(incompleteCalls) {
    return 'Incomplete calls:\n' + incompleteCalls.map(function(c) {
        var args = c.checkArgs ? new ArgumentsString(c.expectedArgs) : new Any()
          .toString();
        return '\t' + c.name + '(' + args + ')';
      })
      .join('\n');
  }

  /**
   * Returns {@link ExpectedCall}s string.
   * @returns {string} {@link ExpectedCall}s as string.
   */
  toString() {
    return this._string;
  }
}

module.exports = FunctionCallsString;
