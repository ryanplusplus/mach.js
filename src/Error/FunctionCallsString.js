'use strict';

var ArgumentsString = require('./ArgumentsString.js');
var Any = require('../Any.js');

class FunctionCallsString {
  /**
   * @param {ExpectedCall} completedCalls Calls that executed
   * @param {ExpectedCall} incompleteCalls Calls that were not executed
   */
  constructor(completedCalls, incompleteCalls) {
    var result = '';

    if (completedCalls.length > 0) {
      result += '\n' + this._completedCallsString(completedCalls);
    }

    if (incompleteCalls.length > 0) {
      result += '\n' + this._incompleteCallsString(incompleteCalls);
    }

    this._string = result;
  }

  _completedCallsString(completedCalls) {
    return 'Completed calls:\n' + completedCalls.map((c) => {
      return '\t' + c.name + '(' + new ArgumentsString(c.actualArgs) + ')';
    }).join('\n');
  }

  _incompleteCallsString(incompleteCalls) {
    return 'Incomplete calls:\n' + incompleteCalls.map(function(c) {
        var args = c.argsChecked ? new ArgumentsString(c.expectedArgs) : new Any().toString();
        return '\t' + c.name + '(' + args + ')';
      })
      .join('\n');
  }

  toString() {
    return this._string;
  }
}

module.exports = FunctionCallsString;
