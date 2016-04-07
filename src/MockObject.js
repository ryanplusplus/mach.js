'use strict';

var Mock = require('./Mock.js');

/**
* Represents a mocked object.
*/
class MockObject {
  constructor(object, name) {
    for (let property in object) {
      if (typeof object[property] === 'function') {
        this[property] = new Mock((name || '<anonymous>') + '.' + property);
      } else {
        this[property] = object[property];
      }
    }
  }
}

module.exports = MockObject;
