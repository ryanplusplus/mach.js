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
    /**
     * Name of the mocked function.
     * @name Mock#name
     * @type {string}
     */
    this.name = name || '<anonymous>';

    let mock = function() {
      return mock._class.handler(Array.from(arguments));
    };

    this.function = mock;
    this.function._class = this;

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

    this.reset();

    // this class is exposed to the user via a function version of itself
    // internal code sees the class version
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

  /*
   * Resets Mock globals and this mocks execution handler
   */
  reset() {
    this.ignoreOtherCalls = false;
    this.tree = undefined;

    /**
     * The function that gets executed when the mocked function is called
     * @name Mock#handler
     * @type function
     */
    this.handler = this._defaultHandler;
  }

  /*
   * Default execution handler
   * @param {object[]} args Arguments passed to mock during execution.
   */
  _defaultHandler(args) {
    if (!this.ignoreOtherCalls) {
      let calls = [];

      if (this.tree !== undefined) {
        calls = this.tree._calls;
      }

      throw new UnexpectedFunctionCallError(this, args, calls);
    }
  }

  /**
   * Creats a new required {@link Expecatation} from this mock.
   * @returns {Expectation} Expectation created from this mock.
   */
  shouldBeCalled() {
    return new Expectation(this, true);
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
    return new Expectation(this, false);
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
