'use strict';

var Expectation = require('./Expectation.js');
var UnexpectedFunctionCallError = require('./Error/UnexpectedFunctionCallError.js');

class Mock {
  constructor(name) {
    var mock = function() {
      return mock._handler(Array.from(arguments));
    };

    mock._name = name;

    mock._resetHandler = () => {
      mock._handler = (args) => {
        throw new UnexpectedFunctionCallError(mock, args, [], []);
      };
    };

    mock.shouldBeCalled = () => {
      return new Expectation(mock, true);
    };

    mock.mayBeCalled = () => {
      return new Expectation(mock, false);
    };

    mock._resetHandler();

    return mock;
  }
}

module.exports = Mock;
