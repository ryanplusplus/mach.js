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

function callMatchesExpectation(mock, args, expectation) {
  if (mock === expectation.mock) {
    if (args.length !== expectation.args.length) {
      return false;
    }

    for (i = 0; i < args.length; i++) {
      if (args[i] !== expectation.args[i]) {
        return false;
      }
    }

    return true;
  }
}

module.exports = {
  mockFunction: function mockFunction(name) {
    var expectations = [];

    function when(thunk) {
      mockHandler = function mockHandler() {
        var mock = this;
        var matchedExpectation;
        var args = Array.prototype.slice.call(arguments);

        expectations.some(function(expectation) {
          if (callMatchesExpectation(mock, args, expectation)) {
            expectation.met = true;
            matchedExpectation = expectation;
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

      expectations.forEach(function(expectation) {
        if (expectation.met == false) {
          throw new Error('not all calls occurred');
        }
      });
    }

    function andWillReturn(returnValue) {
      this.returnValue = returnValue;

      return {
        when: when
      };
    }

    function andAlso() {
      return this;
    }

    var theMock = function theMock() {
      return mockHandler.apply(theMock, Array.prototype.slice.call(arguments));
    };

    theMock._name = name;

    theMock.shouldBeCalled = function shouldBeCalled() {
      var expectation = {
        mock: theMock,
        met: false,
        args: []
      };

      expectations.push(expectation);

      return {
        when: when,
        andWillReturn: andWillReturn.bind(expectation),
        andAlso: andAlso.bind({
          when: when
        })
      };
    };

    theMock.shouldBeCalledWith = function shouldBeCalledWith() {
      expectations.push({
        mock: theMock,
        met: false,
        args: Array.prototype.slice.call(arguments)
      })

      return {
        when: when
      }

    }

    return theMock;
  }
};
