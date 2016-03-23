var _ = require('underscore');

var machSame = {};

var machAny = {};
machAny.toString = function() {
  return '<mach.any>';
};

function argString(args) {
  var asStrings = [];

  for (i = 0; i < args.length; i++) {
    var arg = args[i];

    if (machSame.isPrototypeOf(arg)) {
      arg = arg.val;
    }

    if (typeof arg === 'string') {
      asStrings.push('\'' + arg + '\'');
    } else if (arg && arg.constructor === Array) {
      asStrings.push('[' + arg.join(', ') + ']');
    } else {
      asStrings.push(String(arg));
    }
  }

  return asStrings.join(', ');
}

function completedCallString(completedCalls) {
  return 'Completed calls:\n' + completedCalls.map(function(c) {
    return '\t' + c.getName() + '(' + argString(c.getActualArgs()) + ')';
  }).join('\n');
}

function incompleteCallString(incompleteCalls) {
  return 'Incomplete calls:\n' + incompleteCalls.map(function(c) {
    var args = c.argsChecked() ? argString(c.getExpectedArgs()) : '<any>';
    return '\t' + c.getName() + '(' + args + ')';
  }).join('\n');
}

function callStatusString(completedCalls, incompleteCalls) {
  var result = '';

  if (completedCalls.length > 0) {
    result += '\n' + completedCallString(completedCalls);
  }

  if (incompleteCalls.length > 0) {
    result += '\n' + incompleteCallString(incompleteCalls);
  }

  return result;
}

function UnexpectedFunctionCallError(mock, args, completedCalls, incompleteCalls) {
  return new Error(
    'Unexpected function call ' + mock._name + '(' + argString(args) + ')' +
    callStatusString(completedCalls, incompleteCalls)
  );
}

function UnexpectedArgumentsError(mock, args, completedCalls, incompleteCalls) {
  return new Error('Unexpected arguments ' + '(' + argString(args) + ')' + ' provided to function ' + mock._name +
    callStatusString(completedCalls, incompleteCalls)
  );
}

function OutOfOrderCallError(mock, args, completedCalls, incompleteCalls) {
  return new Error('Out of order function call ' + mock._name + '(' + argString(args) + ')' +
    callStatusString(completedCalls, incompleteCalls)
  );
}

function NotAllCallsOccurredError(completedCalls, incompleteCalls) {
  return new Error('Not all calls occurred\n' + callStatusString(completedCalls, incompleteCalls));
}

function defaultMockHandler() {
  throw UnexpectedFunctionCallError(this, Array.prototype.slice.call(arguments), [], []);
}

var mockHandler = defaultMockHandler;

function ExpectedCall(mock, args, required, checkArgs) {
  return {
    _mock: mock,
    _met: false,
    _strictlyOrdered: false,
    _checkArgs: checkArgs,
    _required: required,
    _expectedArgs: args,
    complete: function(args) {
      this._met = true;
      this._actualArgs = args;
    },
    isComplete: function() {
      return this._met;
    },
    isRequired: function() {
      return this._required;
    },
    argsChecked: function() {
      return this._checkArgs;
    },
    matchesFunction: function(mock) {
      return (mock === this._mock);
    },
    matchesArguments: function(args) {
      if (!this._checkArgs) {
        return true;
      }

      if (args.length !== this._expectedArgs.length) {
        return false;
      }

      for (i = 0; i < args.length; i++) {
        if (this._expectedArgs[i] === machAny) {} else if (machSame.isPrototypeOf(this._expectedArgs[i])) {
          if (!this._expectedArgs[i].matcher(args[i], this._expectedArgs[i].val)) {
            return false;
          }
        } else if (args[i] !== this._expectedArgs[i]) {
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
    setThrowValue: function(throwValue) {
      this._throwValue = throwValue;
    },
    getThrowValue: function() {
      return this._throwValue;
    },
    getExpectedArgs: function() {
      return this._expectedArgs;
    },
    getActualArgs: function() {
      return this._actualArgs;
    },
    getName: function() {
      return this._mock._name;
    },
    clone: function() {
      var clone = ExpectedCall(this._mock, this._expectedArgs, this._required, this._checkArgs);
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
  var ignoreOtherCalls = false;

  function completedCalls() {
    return expectedCalls.filter(function(c) {
      return c.isComplete();
    });
  }

  function incompleteCalls() {
    return expectedCalls.filter(function(c) {
      return !c.isComplete();
    });
  }

  function _mockHandler() {
    var mock = this;
    var partialMatch;
    var args = Array.prototype.slice.call(arguments);
    var incompleteExpectationFound = false;

    for (var i = expectedCallIndex; i < expectedCalls.length; i++) {
      var expectedCall = expectedCalls[i];

      if (!expectedCall.isComplete()) {
        if (expectedCall.matches(mock, args)) {
          if (expectedCall.strictlyOrdered() && incompleteExpectationFound) {
            throw OutOfOrderCallError(mock, args, completedCalls(), incompleteCalls());
          }

          if (expectedCall.strictlyOrdered()) {
            expectedCallIndex = i;
          }

          expectedCall.complete(args);

          if (expectedCall.getThrowValue()) {
            throw expectedCall.getThrowValue();
          }

          return expectedCall.getReturnValue();
        }

        if (expectedCall.matchesFunction(mock)) {
          partialMatch = expectedCall;
        }
      }

      if (!expectedCall.isComplete() && expectedCall.isRequired()) {
        incompleteExpectationFound = true;
      }
    }

    if (partialMatch) {
      throw UnexpectedArgumentsError(mock, args, completedCalls(), incompleteCalls());
    }

    if (!ignoreOtherCalls) {
      throw UnexpectedFunctionCallError(mock, args, completedCalls(), incompleteCalls());
    }
  };

  function _checkCalls() {
    expectedCalls.forEach(function(expectedCall) {
      if (expectedCall.isRequired() && !expectedCall.isComplete()) {
        throw NotAllCallsOccurredError(completedCalls(), incompleteCalls());
      }
    });
  };

  function during(thunk) {
    mockHandler = _mockHandler;

    return new Promise((resolve, reject) => {
        var done = () => {
          resolve();
        };

        var t = setTimeout(() => reject(), 5000);

        thunk(done);
      })
      .catch(() => mockHandler = defaultMockHandler)
      .then(() => {
        _checkCalls();
      });
  };

  function when(thunk) {
    mockHandler = _mockHandler;

    try {
      thunk();
    } finally {
      mockHandler = defaultMockHandler;
    }

    _checkCalls();
  };

  function andWillReturn(returnValue) {
    expectedCalls[expectedCalls.length - 1].setReturnValue(returnValue);
    return this;
  }

  function andWillThrow(returnValue) {
    expectedCalls[expectedCalls.length - 1].setThrowValue(returnValue);
    return this;
  }

  function andAlso(expectation) {
    expectation._expectedCalls.forEach(function(expectedCall) {
      expectedCalls.push(expectedCall);
    });

    return this;
  }

  function andThen(expectation) {
    expectation._expectedCalls.forEach(function(expectedCall, i) {
      if (i === 0) expectedCall.requireStrictOrdering();
      expectedCalls.push(expectedCall);
    });

    return this;
  }

  function expectCallTo(mock, args, required, checkArgs) {
    this._expectedCalls.push(ExpectedCall(mock, args, required, checkArgs));
  }

  function multipleTimes(count) {
    for (var i = 0; i < count - 1; i++) {
      this._expectedCalls.push(this._expectedCalls[this._expectedCalls.length - 1].clone());
    }

    return this;
  }

  function andOtherCallsShouldBeIgnored() {
    ignoreOtherCalls = true;
    return this;
  }

  return {
    during: during,
    when: when,
    after: when,
    andWillReturn: andWillReturn,
    andWillThrow: andWillThrow,
    andAlso: andAlso,
    and: andAlso,
    andThen: andThen,
    then: andThen,
    multipleTimes: multipleTimes,
    andOtherCallsShouldBeIgnored: andOtherCallsShouldBeIgnored,
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
    expectation._expectCallTo(mock, [], true, true);
    return expectation;
  };

  mock.shouldBeCalledWith = function() {
    var expectation = Expectation();
    expectation._expectCallTo(mock, Array.prototype.slice.call(arguments), true, true);
    return expectation;
  };

  mock.shouldBeCalledWithAnyArguments = function() {
    var expectation = Expectation();
    expectation._expectCallTo(mock, [], true, false);
    return expectation;
  };

  mock.mayBeCalledWithAnyArguments = function() {
    var expectation = Expectation();
    expectation._expectCallTo(mock, [], false, false);
    return expectation;
  };

  mock.mayBeCalled = function() {
    var expectation = Expectation();
    expectation._expectCallTo(mock, [], false, true);
    return expectation;
  };

  mock.mayBeCalledWith = function() {
    var expectation = Expectation();
    expectation._expectCallTo(mock, Array.prototype.slice.call(arguments), false, true);
    return expectation;
  };

  return mock;
}

var mach = {
  mockFunction: function mockFunction() {
    if (typeof arguments[0] === 'function') {
      return Mock(arguments[0].name);
    } else {
      return Mock(arguments[0] || '<anonymous>');
    }
  },
  mockObject: function mockObject(obj, name) {
    var mockedObject = {};

    for (var property in obj) {
      if (typeof obj[property] === 'function') {
        mockedObject[property] = this.mockFunction((name || '<anonymous>') + '.' + property);
      } else {
        mockedObject[property] = obj[property];
      }
    }

    return mockedObject;
  },
  same: function same(val, matcher) {
    return Object.create(machSame, {
      val: {
        value: val
      },
      matcher: {
        value: matcher || _.isEqual
      }
    });
  },
  ignoreMockedCallsWhen: function ignoreWhen(thunk) {
    mockHandler = function() {};
    thunk();
    mockHandler = defaultMockHandler;
  }
};

mach.match = mach.same;

mach.any = machAny;

module.exports = mach;
