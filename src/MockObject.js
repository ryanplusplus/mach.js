'use strict';

var Mock = require('./Mock.js');

/**
 * Maps an object type where all function properties become MockFunctions.
 * @template T
 * @typedef {Object} MockedType
 * All function properties of T are replaced with MockFunction,
 * while non-function properties retain their original types.
 */

/**
 * Represents a mocked object.
 * @template T
 */
class MockObject {
  /**
   * Creates a new mocked object with all methods replaced by mocks.
   * @param {T} object Object to mock.
   * @param {string} [name='anonymous'] Name of object.
   */
  constructor(object, name) {
    for(let property in object) {
      if(typeof object[property] === 'function') {
        this[property] = new Mock((name || '<anonymous>') + '.' + property);
      }
      else {
        this[property] = object[property];
      }
    }
  }
}

module.exports = MockObject;
