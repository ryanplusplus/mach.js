'use strict';

let Any = require('./Any.js');
let Callback = require('./Callback.js');
let Same = require('./Same.js');

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
    /**
     * {@link Mock} this expected call is based on.
     * @name ExpectedCall#mock
     * @type Mock
     */
    this.mock = mock;

    /**
     * Whether or not this expected call was called during execution.
     * @name ExpectedCall#completed
     * @type boolean
     */
    this.completed = false;

    /**
     * Whether or not to check the arguments for this expected call during execution.
     * @name ExpectedCall#checkArgs
     * @type boolean
     */
    this.checkArgs = checkArgs;

    /**
     * Whether or not this expected call is required during execution.
     * @name ExpectedCall#required
     * @type boolean
     */
    this.required = required;

    /**
     * The arguments this expected call expects during execution.
     * @name ExpectedCall#expectedArgs
     * @type object[]
     */
    this.expectedArgs = args;

    /**
     * The arguments this expected call received during execution.
     * @name ExpectedCall#actualArgs
     * @type object[]
     */
    this.actualArgs = undefined;

    /**
     * This expected calls return value.
     * @name ExpectedCall#returnValue
     * @type object
     */
    this.returnValue = undefined;

    /**
     * This expected calls return value.
     * @name ExpectedCall#returnValue
     * @type Error
     */
    this.throwValue = undefined;

    /**
     * If this expected call will invoke a callback this will be the index of
     * that callback in the arguments array that is passed to it at runtime.
     * @type number
     */
    this.callbackIndex = -1;

    /**
     * If this expected call will invoke a callback these are the arguments that will be passed to it.
     * @type {object[]}
     */
    this.callbackArgs = [];
  }

  /**
   * Completes this expected call with the specified arguments.
   * @param {object[]} args Arguments that were used during execution.
   */
  execute(args) {
    this.completed = true;
    this.actualArgs = args;

    if(this.throwValue !== undefined) {
      throw this.throwValue;
    }

    if(this.callbackIndex !== -1) {
      process.nextTick(() => {
        args[this.callbackIndex](...this.callbackArgs);
      });
    }

    return this.returnValue;
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
    if(!this.checkArgs) {
      return true;
    }

    if(args.length !== this.expectedArgs.length) {
      return false;
    }

    for(let i = 0; i < args.length; i++) {
      if(this.expectedArgs[i] instanceof Any) {
        continue;
      }

      if(this.expectedArgs[i] instanceof Same) {
        if(!this.expectedArgs[i].matcher(args[i], this.expectedArgs[i].value)) {
          return false;
        }
        else {
          continue;
        }
      }

      if(this.expectedArgs[i] instanceof Callback) {
        if(typeof args[i] !== 'function') {
          return false;
        }
        else {
          continue;
        }
      }

      if(args[i] !== this.expectedArgs[i]) {
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
    return this.mock.name;
  }
}

module.exports = ExpectedCall;
