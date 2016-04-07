'use strict';

var Any = require('./Any.js');
var Same = require('./Same.js');

/**
 * Represents an expected call to a {@link Mock}.
 */
class ExpectedCall {
  /**
   * Creates a new {@link ExpectedCall}
   * @param {Mock} mock Mock that will be called.
   * @param {object[]} args Arguments that are expected to be used during execution.
   * @param {boolean} required If true the mock is required to be call during execution; other wise it is optional and can be skipped.
   * @param {boolean} checkArgs If true then the arguments passed to the mock should be checked; otherwise they are ignored.
   */
  constructor(mock, args, required, checkArgs) {
    this.mock = mock;
    this.completed = false;
    this.checkArgs = checkArgs;
    this.required = required;
    this.expectedArgs = args;
    this.actualArgs = undefined;
    this.returnValue = undefined;
    this.throwValue = undefined;
  }

  /**
   * Completes this expected call with the specified arguments.
   * @param {object[]} args Arguments that were used during execution.
   */
  complete(args) {
    this.completed = true;
    this.actualArgs = args;
  }

  /**
   * Checks to see if the specified {@link Mock} is this expected calls mock.
   * @param {Mock} mock Mock to compare against this expected calls mock.
   * @returns {boolean} True if the mocks are the same mock; otherwise false.
   */
  matchesFunction(mock) {
    return mock === this.mock;
  }

  /**
   * Checks to see if the specified arguments match this expected calls expected arguments.
   * @param {object[]} args Arguments to compare against this expected calls expected arguments.
   * @returns {boolean} True if the arguments match the expected arguments; otherwise false.
   */
  matchesArguments(args) {
    if (!this.checkArgs) {
      return true;
    }

    if (args.length !== this.expectedArgs.length) {
      return false;
    }

    for (let i = 0; i < args.length; i++) {
      if (this.expectedArgs[i] instanceof Any) {
        continue;
      }

      if (this.expectedArgs[i] instanceof Same) {
        if (!this.expectedArgs[i].matcher(args[i], this.expectedArgs[i].value)) {
          return false;
        }
        else {
          continue;
        }
      }

      if (args[i] !== this.expectedArgs[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks to see if the specified {@link Mock} and arguments match this expected call.
   * @param {Mock} mock Mock to compare against this expected calls mock.
   * @param {object[]} args Arguments to compare against this expected calls expected arguments.
   * @returns {boolean} True if the mock and arguments match this expected call; otherwise false.
   */
  matches(mock, args) {
    return this.matchesFunction(mock) && this.matchesArguments(args);
  }

  /**
   * Gets the name of this expected calls mock.
   * @returns {string} The name of this expected calls mock.
   */
  get name() {
    return this.mock._name;
  }
}

module.exports = ExpectedCall;
