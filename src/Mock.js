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

    // class Mock is exposed to the world via a function version of itself
    let mock = function() {
      return mock._class.handler(Array.from(arguments));
    };

    this._function = mock;
    this._function._class = this;

    mock._name = this.name;

    mock._reset = function() {
      mock._class.reset();
    };

    mock._setHandler = function(handler) {
      mock._class.setHandler(handler);
    }

    mock.shouldBeCalled = function() {
      return mock._class.shouldBeCalled();
    };

    mock.shouldBeCalledWith = function() {
      return mock._class.shouldBeCalledWith(...arguments);
    };

    mock.shouldBeCalledWithAnyArguments = function() {
      return mock._class.shouldBeCalledWithAnyArguments();
    };

    mock.mayBeCalled = function() {
      return mock._class.mayBeCalled();
    };

    mock.mayBeCalledWith = function() {
      return mock._class.mayBeCalledWith(...arguments);
    };

    mock.mayBeCalledWithAnyArguments = function() {
      return mock._class.mayBeCalledWithAnyArguments();
    };

    mock._ignoreOtherCalls = function() {
      mock._class.ignoreOtherCalls = true;
    };

    mock._tree = function(tree) {
      mock._class.tree = tree;
    };

    this.reset();

    // rest of the world sees the function, only the function knows about the class that backs it
    return mock;
  }

  /**
   * Gets state of global ignore other calls flag
   */
  get ignoreOtherCalls() {
    return _ignoreOtherCalls;
  }

  /**
   * Sets state of the global ignore other calls flag
   */
  set ignoreOtherCalls(value) {
    _ignoreOtherCalls = value;
  }

  /**
   * Gets global tree pointer value.
   */
  get tree() {
    return _tree;
  }

  /**
   * Sets global tree pointer value
   */
  set tree(value) {
    _tree = value;
  }

  /**
   * Sets this mocks excecution handler.
   */
  setHandler(value) {
    this.handler = value;
  }

  /*
   * Resets Mock globals and this mocks execution handler
   */
  reset() {
    this.ignoreOtherCalls = false;
    this.tree = undefined;

    this.setHandler(this.defaultHandler);
  }

  /*
   * Default execution handler
   * @param {object[]} args Arguments passed to mock during execution.
   */
  defaultHandler(args) {
    if (!this.ignoreOtherCalls) {
      let calls = [];

      if (this.tree !== undefined) {
        calls = this.tree._calls;
      }

      throw new UnexpectedFunctionCallError(this._function, args, calls);
    }
  }

  /**
   * Creats a new required {@link Expecatation} from this mock.
   * @returns {Expectation} Expectation created from this mock.
   */
  shouldBeCalled() {
    return new Expectation(this._function, true);
  }

  /**
   * Creats a new required {@link Expecatation} from this mock that expects the specified arguments.
   * @param {object[]} arguments Expected arguments
   * @returns {Expectation} Expectation created from this mock.
   */
  shouldBeCalledWith() {
    return this.shouldBeCalled()
      .withTheseArguments(...arguments);
  }

  /**
   * Creats a new required {@link Expecatation} from this mock that will accept any arguments.
   * @returns {Expectation} Expectation created from this mock.
   */
  shouldBeCalledWithAnyArguments() {
    return this.shouldBeCalled()
      .withAnyArguments();
  }

  /**
   * Creats a new optional {@link Expecatation} from this mock.
   * @returns {Expectation} Expectation created from this mock.
   */
  mayBeCalled() {
    return new Expectation(this._function, false);
  }

  /**
   * Creats a new optional {@link Expecatation} from this mock that expects the specified arguments.
   * @param {object[]} arguments Expected arguments
   * @returns {Expectation} Expectation created from this mock.
   */
  mayBeCalledWith() {
    return this.mayBeCalled()
      .withTheseArguments(...arguments);
  }

  /**
   * Creats a new optional {@link Expecatation} from this mock that will accept any arguments.
   * @returns {Expectation} Expectation created from this mock.
   */
  mayBeCalledWithAnyArguments() {
    return this.mayBeCalled()
      .withAnyArguments();
  }
}

module.exports = Mock;
