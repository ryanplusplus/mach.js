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
  return expectedCall = {
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
      if (mock === expectedCall.mock) {
        if (args.length !== expectedCall.args.length) {
          return false;
        }

        for (i = 0; i < args.length; i++) {
          if (args[i] !== expectedCall.args[i]) {
            return false;
          }
        }

        return true;
      }
    }
  };
}

module.exports = {
  mockFunction: function mockFunction(name) {
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
            return false;
          }

          return true;
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

    var api = {
      when: when,
      andWillReturn: andWillReturn,
      andAlso: andAlso
    };

    function andWillReturn(returnValue) {
      expectedCalls[expectedCalls.length - 1].returnValue = returnValue;

      return api;
    }

    function andAlso() {
      return api;
    }

    var theMock = function theMock() {
      return mockHandler.apply(theMock, Array.prototype.slice.call(arguments));
    };

    theMock._name = name;

    theMock.shouldBeCalled = function shouldBeCalled() {
      expectedCalls.push(ExpectedCall(theMock));
      return api;
    };

    theMock.shouldBeCalledWith = function shouldBeCalledWith() {
      expectedCalls.push(ExpectedCall(theMock, Array.prototype.slice.call(arguments)));
      return api;
    }

    return theMock;
  }
};
