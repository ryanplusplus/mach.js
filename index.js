function unexpectedFunctionCall(mock) {
  return new Error('unexpected function call ' + mock._name + '()');
}

function defaultMockHandler() {
  throw unexpectedFunctionCall(this);
}

var mockHandler = defaultMockHandler

module.exports = {
  mockFunction: function mockFunction(name) {
    var expectations = [];

    var theMock = function theMock() {
      mockHandler.call(theMock, arguments);
    }

    theMock._name = name;

    theMock.shouldBeCalled = function shouldBeCalled() {
      expectations.push({
        mock: theMock,
        met: false
      })

      return {
        when: function when(thunk) {
          mockHandler = function mockHandler() {
            var mock = this;
            var foundExpectation = false;

            expectations.some(function(expectation) {
              if (mock === expectation.mock) {
                expectation.met = true;
                foundExpectation = true;
                return false;
              }

              return true;
            });

            if (!foundExpectation) {
              throw unexpectedFunctionCall(mock);
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
      }
    }

    return theMock;
  }
}
