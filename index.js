'use strict';

var Any = require('./src/Any.js');
var Expectation = require('./src/Expectation.js');
var Mock = require('./src/Mock.js');
var MockObject = require('./src/MockObject.js');
var Same = require('./src/Same.js');

class Mach {
  static mockFunction(thing) {
    let name;

    if (typeof thing === 'function') {
      name = thing.name;
    } else {
      name = thing;
    }
    return new Mock(name);
  }

  static mockObject(object, name) {
    return new MockObject(object, name);
  }

  static same(value, matcher) {
    return new Same(value, matcher);
  }

  static get any() {
    return new Any();
  }

  static ignoreMockedCallsWhen(thunk) {
    new Expectation(() => {
      return () => true;
    }, false).when(() => {
      thunk();
    });
  }
}

module.exports = Mach;
