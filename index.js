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

var mockHandler = defaultMockHandler

module.exports = {
  mockFunction: function mockFunction(name) {
    var expectations = [];

    function when(thunk) {
      mockHandler = function mockHandler() {
        var mock = this;
        var foundExpectation = false;
        var args = Array.prototype.slice.call(arguments);

        expectations.some(function(expectation) {
          if (mock === expectation.mock) {
            if (args.length !== expectation.args.length) {
              return true;
            }

            for (i = 0; i < args.length; i++) {
              if (args[i] !== expectation.args[i]) {
                return true;
              }
            }

            expectation.met = true;
            foundExpectation = true;
            return false;
          }

          return true;
        });

        if (!foundExpectation) {
          throw unexpectedFunctionCall(mock, args);
        }
      }

      thunk();

      mockHandler = defaultMockHandler;

      expectations.forEach(function(expectation) {
        if (expectation.met == false) {
          throw new Error('not all calls occurred');
        }
      });
    }

    var theMock = function theMock() {
      mockHandler.apply(theMock, Array.prototype.slice.call(arguments));
    }

    theMock._name = name;

    theMock.shouldBeCalled = function shouldBeCalled() {
      expectations.push({
        mock: theMock,
        met: false,
        args: []
      })

      return {
        when: when
      }
    }

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
}
