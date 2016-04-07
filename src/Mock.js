'use strict';

var Expectation = require('./Expectation.js');
var UnexpectedFunctionCallError = require('./Error/UnexpectedFunctionCallError.js');

/**
 * Flag to have mocks not throw an error if they are called unexpectedly
 * @global
 */
var _ignoreOtherCalls = false;

/**
 * Pointer to currently executing tree so that unexpected calls can display expected calls in error message.
 * @global
 */
var _tree;

/**
 * Represents a mocked function.
 */
class Mock {
  /**
   * Creates a new mocked function.
   * @param {string} [name=<anonymous>] Name of the function.
   */
  constructor(name) {
    this.name = name || '<anonymous>';
    
    let mock = function() {
      return mock._handler(Array.from(arguments));
    };
    
    mock._name = this.name;

    mock._reset = function() {
      _ignoreOtherCalls = false;
      _tree = undefined;

      mock._handler = function(args) {
        if (!_ignoreOtherCalls) {
          let calls = [];

          if (_tree !== undefined) {
            calls = _tree._calls;
          }

          throw new UnexpectedFunctionCallError(mock, args, calls);
        }
      };
    };

    mock.shouldBeCalled = function() {
      return new Expectation(mock, true);
    };

    mock.shouldBeCalledWith = function() {
      return mock.shouldBeCalled()
        .withTheseArguments(...arguments);
    };

    mock.shouldBeCalledWithAnyArguments = function() {
      return mock.shouldBeCalled()
        .withAnyArguments();
    };

    mock.mayBeCalled = function() {
      return new Expectation(mock, false);
    };

    mock.mayBeCalledWith = function() {
      return mock.mayBeCalled()
        .withTheseArguments(...arguments);
    };

    mock.mayBeCalledWithAnyArguments = function() {
      return mock.mayBeCalled()
        .withAnyArguments();
    };

    mock._ignoreOtherCalls = function() {
      _ignoreOtherCalls = true;
    };

    mock._tree = function(tree) {
      _tree = tree;
    };

    mock._reset();

    return mock;
  }
}

module.exports = Mock;
