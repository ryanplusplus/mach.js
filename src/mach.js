'use strict';

let Any = require('./Any.js');
let Callback = require('./Callback.js');
let Expectation = require('./Expectation.js');
let Mock = require('./Mock.js');
let MockObject = require('./MockObject.js');
let Same = require('./Same.js');

/**
 * mach.js
 */
class Mach {
  /**
   * Creates a new {@link Mock}.
   * @param {function|string} thing Either an existing function to mock or the name for the mock.
   * @returns {Mock} Mocked function.
   */
  static mockFunction(thing) {
    let name;

    if(typeof thing === 'function') {
      name = thing.name;
    }
    else {
      name = thing;
    }
    return new Mock(name);
  }

  /**
   * Creates a new {@link MockObject}
   * @param {object} object Object to mock.
   * @param {string} name Name for the mocked object.
   */
  static mockObject(object, name) {
    return new MockObject(object, name);
  }

  /**
   * Creates a new {@link Same} which is used as an expected argument for a {@link Mock} expectation.
   * @param {object} value Expected argument to a {@link Mock}
   * @param {function} matcher Custom equality function in the form `(expected, actual) => boolean`
   * @returns {Same} Same object to use as an expected argument in an expectation.
   */
  static same(value, matcher) {
    return new Same(value, matcher);
  }

  /**
   * Alias for {@link Mach#Same}
   */
  static match(value, matcher) {
    return Mach.same(value, matcher);
  }

  /**
   * Creates a new {@link Any} used as a wild card expected argument for a {@link Mock} expectation.
   * @returns {Any} Any
   */
  static get any() {
    return new Any();
  }

  /**
   * Creates a new {@link Callback} used as an expected argument for a {@link Mock} expectation that has a callback.
   * @returns {Callback} Callback
   */
  static get callback() {
    return new Callback();
  }

  /**
   * Creates a scope in which unexpected and out of order function calls are ignored and only required calls are checked during execution.
   * Consider using {@link Expectation#andOtherCallsShouldBeIgnored} instead.
   */
  static ignoreMockedCallsWhen(thunk) {
    let mock = new Mock();

    mock._class.ignoreOtherCalls = true;

    // TODO: handle async code??
    new Expectation(mock._class, false).when(() => {
      thunk();
      mock._class.reset();
    });
  }
}

module.exports = Mach;
