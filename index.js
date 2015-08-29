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

function unexpectedFunctionCall(mock, args) {
  return new Error('unexpected function call ' + mock._name + '(' + argString(args) + ')');
}

function defaultMockHandler() {
  throw unexpectedFunctionCall(this, Array.prototype.slice.call(arguments));
}

var mockHandler = defaultMockHandler;

function ExpectedCall(mock, args) {
  return {
    mock: mock,
    met: false,
    args: args || [],
    complete: function() {
      this.met = true;
    },
    isComplete: function() {
      return this.met;
    },
    matches: function(mock, args) {
      if (mock === this.mock) {
        if (args.length !== this.args.length) {
          return false;
        }

        for (i = 0; i < args.length; i++) {
          if (args[i] !== this.args[i]) {
            return false;
          }
        }

        return true;
      }
    }
  };
}

function Expectation() {
  var expectedCalls = [];

  function when(thunk) {
    mockHandler = function mockHandler() {
      var mock = this;
      var matchedExpectation;
      var args = Array.prototype.slice.call(arguments);

      expectedCalls.some(function(expectedCall) {
        if (expectedCall.matches(mock, args)) {
          expectedCall.complete();
          matchedExpectation = expectedCall;
          return true;
        }

        return false;
      });

      if (!matchedExpectation) {
        throw unexpectedFunctionCall(mock, args);
      }

      return matchedExpectation.returnValue;
    }

    thunk();

    mockHandler = defaultMockHandler;

    expectedCalls.forEach(function(expectedCall) {
      if (expectedCall.isComplete() == false) {
        throw new Error('not all calls occurred');
      }
    });
  }

  function andWillReturn(returnValue) {
    expectedCalls[expectedCalls.length - 1].returnValue = returnValue;
    return this;
  }

  function andAlso(expectation) {
    expectation._expectedCalls.forEach(function(expectedCall) {
      expectedCalls.push(expectedCall);
    });

    return this;
  }

  function expectCallTo(mock, args) {
    this._expectedCalls.push(ExpectedCall(mock, args));
  }

  function multipleTimes(count) {
    for (var i = 0; i < count - 2; i++) {
      this._expectedCalls.push(this._expectedCalls[this._expectedCalls.length - 1]);
    }

    return this;
  }

  return {
    when: when,
    andWillReturn: andWillReturn,
    andAlso: andAlso,
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

  mock.shouldBeCalled = function shouldBeCalled() {
    var expectation = Expectation();
    expectation._expectCallTo(mock);
    return expectation;
  };

  mock.shouldBeCalledWith = function shouldBeCalledWith() {
    var expectation = Expectation();
    expectation._expectCallTo(mock, Array.prototype.slice.call(arguments));
    return expectation;
  }

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
