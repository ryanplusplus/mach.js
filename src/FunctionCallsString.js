'use strict';

var ArgumentsString = require('./ArgumentsString.js');

class FunctionCallsString {
  constructor(completedCalls, incompleteCalls) {
    var result = '';

    if (completedCalls.length > 0) {
      result += '\n' + this._completedCallString(completedCalls);
    }

    if (incompleteCalls.length > 0) {
      result += '\n' + this._incompleteCallString(incompleteCalls);
    }

    this._string = result;
  }

  _completedCallsToString(completedCalls) {
    return 'Completed calls:\n' + completedCalls.map((c) => {
      return '\t' + c.getName() + '(' + new ArgumentsString(c.getActualArgs()) + ')';
    }).join('\n');
  }

  _incompleteCallString(incompleteCalls) {
    return 'Incomplete calls:\n' + incompleteCalls.map(function(c) {
        var args = c.argsChecked() ? new ArgumentsString(c.getExpectedArgs()) : '<any>';
        return '\t' + c.getName() + '(' + args + ')';
      })
      .join('\n');
  }

  toString() {
    return this._string;
  }
}

module.exports = FunctionCallsString;
