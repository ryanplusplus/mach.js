'use strict';

var Expectation = require('./Expectation.js');
var UnexpectedFunctionCallError = require('./UnexpectedFunctionCallError.js');

class Mock {
  constructor(name) {
    var mock = (args) => {
      return mock._handler(Array.from(args));
    };

    mock._name = name;

    mock._resetHandler = () => {
      this._handler = (args) => {
        throw new UnexpectedFunctionCallError(this, args, [], []);
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
