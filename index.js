function argString(args) {
  var asStrings = [];

  for (i = 0; i < args.length; i++) {
    if (typeof args[i] === 'string') {
      asStrings.push('\'' + args[i] + '\'');
    } else {
      asStrings.push(args[i]);
    }
  }

  return asStrings.join(', ');
}

function UnexpectedFunctionCall(mock, args) {
  return new Error('unexpected function call ' + mock._name + '(' + argString(args) + ')');
}

function UnexpectedArguments(mock, args) {
  return new Error('unexpected arguments ' + '(' + argString(args) + ')' + ' provided to function ' + mock._name);
}

function OutOfOrderCall(mock, args) {
  return new Error('out of order function call ' + mock._name + '(' + argString(args) + ')');
}

function defaultMockHandler() {
  throw UnexpectedFunctionCall(this, Array.prototype.slice.call(arguments));
}

var mockHandler = defaultMockHandler;

function ExpectedCall(mock, args, required) {
  return {
    _mock: mock,
    _met: false,
    _strictlyOrdered: false,
    _required: required,
    _args: args,
    complete: function() {
      this._met = true;
    },
    isComplete: function() {
      return this._met;
    },
    isRequired: function() {
      return this._required;
    },
    matchesFunction: function(mock) {
      return (mock === this._mock);
    },
    matchesArguments: function(args) {
      if (args.length !== this._args.length) {
        return false;
      }

      for (i = 0; i < args.length; i++) {
        if (args[i] !== this._args[i]) {
          return false;
        }
      }

      return true;
    },
    matches: function(mock, args) {
      return this.matchesFunction(mock) && this.matchesArguments(args);
    },
    setReturnValue: function(returnValue) {
      this._returnValue = returnValue;
    },
    getReturnValue: function() {
      return this._returnValue;
    },
    clone: function() {
      var clone = ExpectedCall(this._mock, this._args, this._required);
      clone.setReturnValue(this._returnValue);
      return clone;
    },
    requireStrictOrdering: function() {
      this._strictlyOrdered = true;
    },
    strictlyOrdered: function() {
      return this._strictlyOrdered;
    }
  };
}

function Expectation() {
  var expectedCalls = [];
  var expectedCallIndex = 0;

  function when(thunk) {
    mockHandler = function mockHandler() {
      var mock = this;
      var matchedExpectation;
      var partialMatch;
      var args = Array.prototype.slice.call(arguments);
      var incompleteExpectationFound = false;

      for (var i = expectedCallIndex; i < expectedCalls.length; i++) {
        var expectedCall = expectedCalls[i];

        if (!expectedCall.isComplete()) {
          if (expectedCall.matches(mock, args)) {
            if (expectedCall.strictlyOrdered() && incompleteExpectationFound) {
              throw OutOfOrderCall(mock, args);
            }

            if (expectedCall.strictlyOrdered()) {
              expectedCallIndex = i;
            }

            expectedCall.complete();
            matchedExpectation = expectedCall;

            break;
          }

          if (expectedCall.matchesFunction(mock)) {
            partialMatch = expectedCall;
          }
        }

        if (!expectedCall.isComplete() && expectedCall.isRequired()) {
          incompleteExpectationFound = true;
        }
      }

      if (!matchedExpectation) {
        if (partialMatch) {
          throw UnexpectedArguments(mock, args);
        }

        throw UnexpectedFunctionCall(mock, args);
      }

      return matchedExpectation.getReturnValue();
    }

    thunk();

    mockHandler = defaultMockHandler;

    expectedCalls.forEach(function(expectedCall) {
      if (expectedCall.isRequired() && !expectedCall.isComplete()) {
        throw new Error('not all calls occurred');
      }
    });
  }

  function andWillReturn(returnValue) {
    expectedCalls[expectedCalls.length - 1].setReturnValue(returnValue);
    return this;
  }

  function andAlso(expectation) {
    expectation._expectedCalls.forEach(function(expectedCall) {
      expectedCalls.push(expectedCall);
    });

    return this;
  }

  function andThen(expectation) {
    expectation._expectedCalls.forEach(function(expectedCall) {
      expectedCall.requireStrictOrdering();
      expectedCalls.push(expectedCall);
    });

    return this;
  }

  function expectCallTo(mock, args, required) {
    this._expectedCalls.push(ExpectedCall(mock, args, required));
  }

  function multipleTimes(count) {
    for (var i = 0; i < count - 1; i++) {
      this._expectedCalls.push(this._expectedCalls[this._expectedCalls.length - 1].clone());
    }

    return this;
  }

  return {
    when: when,
    after: when,
    andWillReturn: andWillReturn,
    andAlso: andAlso,
    and: andAlso,
    andThen: andThen,
    then: andThen,
    multipleTimes: multipleTimes,
    _expectedCalls: expectedCalls,
    _expectCallTo: expectCallTo
  };
}

function Mock(name) {
  var mock = function mock() {
    return mockHandler.apply(mock, Array.prototype.slice.call(arguments));
  };

  mock._name = name;

  mock.shouldBeCalled = function() {
    var expectation = Expectation();
    expectation._expectCallTo(mock, [], true);
    return expectation;
  };

  mock.shouldBeCalledWith = function() {
    var expectation = Expectation();
    expectation._expectCallTo(mock, Array.prototype.slice.call(arguments), true);
    return expectation;
  }

  mock.mayBeCalled = function() {
    var expectation = Expectation();
    expectation._expectCallTo(mock, [], false);
    return expectation;
  };

  mock.mayBeCalledWith = function() {
    var expectation = Expectation();
    expectation._expectCallTo(mock, Array.prototype.slice.call(arguments), false);
    return expectation;
  };

  return mock;
}

module.exports = {
  mockFunction: function mockFunction() {
    if (typeof arguments[0] == 'function') {
      return Mock(arguments[0].name);
    } else {
      return Mock(arguments[0]);
    }
  },
  mockObject: function mockObject(obj, name) {
    var mockedObject = {};

    for (property in obj) {
      mockedObject[property] = this.mockFunction(name + '.' + property);
    }

    return mockedObject;
  }
};
