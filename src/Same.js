'use strict';

const eq = require('fast-deep-equal');

const equal = (a, b) => eq(a, b);

/**
 * Represents an argument with a custom equality comparison.
 * Used when `===` does not suffice.
 */
class Same {
  /**
   * Creates a new {@link Same}
   * @param {object} value Expected argument.
   * @param {function} matcher Function to do equality comparison with actual argument.
   */
  constructor(value, matcher) {
    /**
     * The expected argument
     * @name Same#value
     * @type {object}
     */
    this.value = value;

    /**
     * Function to do equality comparison with actual argument.
     * @name Same#matcher
     * @type function
     */
    this.matcher = matcher || equal;
  }

  toString() {
    return 'Same {value: ' + this.value + ', matcher: ' + this.matcher + '}';
  }
}

module.exports = Same;
