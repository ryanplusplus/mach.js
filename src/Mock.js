'use strict';

var Expectation = require('./Expectation.js');
var UnexpectedFunctionCallError = require('./Error/UnexpectedFunctionCallError.js');

var _ignoreOtherCalls = false;

class Mock {
  constructor(name) {
    let mock = function() {
      return mock._handler(Array.from(arguments));
    };

    mock._name = name || '<anonymous>';

    mock._reset = function() {
      _ignoreOtherCalls = false;

      mock._handler = function(args) {
        if (!_ignoreOtherCalls) {
          throw new UnexpectedFunctionCallError(mock, args, []);
        }
      };
    };

    mock.shouldBeCalled = function() {
      return new Expectation(mock, true);
    };

    mock.shouldBeCalledWith = function() {
      return mock.shouldBeCalled().withTheseArguments(...arguments);
    };

    mock.shouldBeCalledWithAnyArguments = function() {
      return mock.shouldBeCalled().withAnyArguments();
    };

    mock.mayBeCalled = function() {
      return new Expectation(mock, false);
    };

    mock.mayBeCalledWith = function() {
      return mock.mayBeCalled().withTheseArguments(...arguments);
    };

    mock.mayBeCalledWithAnyArguments = function() {
      return mock.mayBeCalled().withAnyArguments();
    };

    mock._ignoreOtherCalls = function() {
      _ignoreOtherCalls = true;
    };

    mock._reset();

    return mock;
  }
}

module.exports = Mock;
