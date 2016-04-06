'use strict';

describe('mach.js', () => {
  let mach = require('../index.js');
  let a = mach.mockFunction('a');
  let b = mach.mockFunction('b');
  let c = mach.mockFunction('c');

  let shouldFail = (thunk) => {
    expect(() => thunk()).toThrow();
  };

  let shouldFailWithExactly = (expectedFailure, thunk) => {
    expect(() => thunk()).toThrowError(expectedFailure);
  };

  let shouldFailWith = (expectedFailure, thunk) => {
    return shouldFailWithExactly(new RegExp('.*' + expectedFailure + '.*'), thunk);
  };

  it('should allow anonymous mocks', () => {
    let anonymous = mach.mockFunction();

    anonymous.shouldBeCalled().when(() => {
      anonymous();
    });
  });

  it('should verify that a function was called', () => {
    a.shouldBeCalled().when(() => a());
  });

  it('should fail when an expected function call does not occur', () => {
    shouldFailWith('Not all calls occurred', () => {
      a.shouldBeCalled().when(() => {});
    });
  });

  it('should fail when a different mock is called instead of the expected mock', () => {
    shouldFailWith('Unexpected function call b\(\)', () => {
      a.shouldBeCalled().when(() => {
        b();
      });
    });
  });

  it('should fail when a function is called unexpectedly', () => {
    shouldFailWith('Unexpected function call a\(\)', () => {
      a();
    });
  });

  it('should fail when a function is called unexpectedly after a successful expectation', () => {
    a.shouldBeCalled().when(() => {
      a();
    });

    shouldFailWith('Unexpected function call a\(\)', () => {
      a();
    });
  });

  it('should be able to verify that a function has been called with the correct arguments', () => {
    a.shouldBeCalledWith(1, '2').when(() => {
      a(1, '2');
    });
  });

  it('should allow undefined to be used as an argument to a mocked function', () => {
    a.shouldBeCalledWith(undefined).when(() => {
      a(undefined);
    });
  });

  it('should allow null to be used as an argument to a mocked function', () => {
    a.shouldBeCalledWith(null).when(() => {
      a(null);
    });
  });

  it('should fail when a function is called with incorrect arguments', () => {
    shouldFailWith('Unexpected arguments \\(1, \'3\'\\) provided to function a', () => {
      a.shouldBeCalledWith(1, '2').when(() => {
        a(1, '3');
      });
    });
  });

  it('should be able to verify that a function is called with any arguments', () => {
    b.shouldBeCalledWithAnyArguments().when(() => {
      b();
    });

    b.shouldBeCalledWithAnyArguments().when(() => {
      b(1, 'hi');
    });

    shouldFailWith('Not all calls occurred', () => {
      a.shouldBeCalledWithAnyArguments().when(() => {});
    });
  });

  it('should be able to have a soft expectation for a call with any arguments', () => {
    b.mayBeCalledWithAnyArguments().when(() => {});

    b.mayBeCalledWithAnyArguments().when(() => {
      b(1, 'hi');
    });
  });

  it('should allow mach.any to match any single argument', () => {
    a.shouldBeCalledWith(1, mach.any, 3).when(() => {
      a(1, 'whatever', 3);
    });
  });

  it('should ensure that other arguments match when using mach.any', () => {
    var failureMessage = 'Unexpected arguments (1, 3, 2) provided to function a\nIncomplete calls:\n\ta(1, <any>, 3)';

    shouldFailWithExactly(failureMessage, () => {
      a.shouldBeCalledWith(1, mach.any, 3).when(() => {
        a(1, 3, 2);
      });
    });
  });

  it('should allow the return value of a mocked function to be specified', () => {
    a.shouldBeCalled().andWillReturn(4).when(() => {
      expect(a()).toBe(4);
    });
  });

  it('should allow a mocked call to throw when called', () => {
    a.shouldBeCalled().andWillThrow(new Error('error')).when(() => {
      expect(() => a()).toThrowError('error');
    });
  });

  it('should allow multiple function calls to be expected', () => {
    a.shouldBeCalled().andAlso(a.shouldBeCalledWith(1, 2, 3)).when(() => {
      a();
      a(1, 2, 3);
    });
  });

  it('should fail if multiple function calls are expected but not all occur', () => {
    shouldFailWith('Not all calls occurred', () => {
      a.shouldBeCalled().andAlso(a.shouldBeCalledWith(1, 2, 3)).when(() => {
        a(1, 2, 3);
      });
    });
  });

  it('should be able to verify that multiple functions are called', () => {
    b.shouldBeCalled().andAlso(c.shouldBeCalledWith(1, 2, 3)).when(() => {
      b();
      c(1, 2, 3);
    });
  });

  it('should allow an existing function to be mocked', () => {
    let f = function f() {};
    let mock = mach.mockFunction(f);

    shouldFailWith('Unexpected function call f\(\)', () => {
      mock();
    });

    f = () => {};
    mock = mach.mockFunction(f);

    shouldFailWith('Unexpected function call <anonymous>\(\)', () => {
      mock();
    });
  });

  it('should allow functions to be used to improve readability', () => {
    let somethingShouldHappen = () => {
      return b.shouldBeCalled();
    };

    let anotherThingShouldHappen = () => {
      return c.shouldBeCalledWith(1, 2, 3);
    };

    let theCodeUnderTestRuns = () => {
      b();
      c(1, 2, 3);
    };

    somethingShouldHappen().andAlso(anotherThingShouldHappen()).when(theCodeUnderTestRuns);
  });

  it('should allow an object containing functions to be mocked', () => {
    let someObject = {
      foo: () => {},
      bar: () => {}
    };

    let mockedObject = mach.mockObject(someObject, 'someObject');

    mockedObject.foo.shouldBeCalledWith(1)
      .andAlso(mockedObject.bar.shouldBeCalled())
      .when(() => {
        mockedObject.foo(1);
        mockedObject.bar();
      });
  });

  it('should copy non-function fields to a mocked object', () => {
    let someObject = {
      foo: () => {},
      bar: () => {},
      baz: 3
    };

    let mockedObject = mach.mockObject(someObject, 'someObject');

    expect(mockedObject.baz).toBe(3);
  });

  it('should let you expect a function to be called multiple times', () => {
    a.shouldBeCalledWith(2).andWillReturn(1).multipleTimes(3).when(() => {
      expect(a(2)).toBe(1);
      expect(a(2)).toBe(1);
      expect(a(2)).toBe(1);
    });
  });

  it('should fail if a function is not called enough times', () => {
    shouldFailWith('Not all calls occurred', () => {
      a.shouldBeCalledWith(2).multipleTimes(3).when(() => {
        a(2);
        a(2);
      });
    });
  });

  it('should allow after to be used as an alias for when', () => {
    a.shouldBeCalled().after(() => {
      a();
    });
  });

  it('should allow and to be used as an alias for andAlso', () => {
    a.shouldBeCalled().and(a.shouldBeCalledWith(1, 2, 3)).when(() => {
      a();
      a(1, 2, 3);
    });
  });

  it('should fail if andWillReturn is not preceeded by shouldBeCalled or shouldBeCalledWith', () => {
    shouldFail(() => {
      a.andWillReturn(1);
    });
  });

  it('should fail if when is not preceeded by shouldBeCalled or shouldBeCalledWith', () => {
    shouldFail(() => {
      a.when(() => {});
    });
  });

  it('should fail if shouldBeCalled is used after a call has already been specified', () => {
    shouldFail(() => {
      a.shouldBeCalled().shouldBeCalled();
    });
  });

  it('should fail if shouldBeCalledWith is used after a call has already been specified', () => {
    shouldFail(() => {
      a.shouldBeCalled().shouldBeCalledWith(4);
    });
  });

  it('should allow calls to happen out of order when andAlso is used', () => {
    b.shouldBeCalled()
      .andAlso(c.shouldBeCalled())
      .when(() => {
        c();
        b();
      });

    b.shouldBeCalledWith(1)
      .andAlso(b.shouldBeCalledWith(2))
      .when(() => {
        b(2);
        b(1);
      });
  });

  it('should not allow calls to happen out of order when andThen is used', () => {
    shouldFailWith('Out of order function call c\(\)', () => {
      b.shouldBeCalled()
        .andThen(c.shouldBeCalled())
        .when(() => {
          c();
          b();
        });
    });

    shouldFailWith('Unexpected arguments \\(2\\) provided to function b', () => {
      b.shouldBeCalledWith(1)
        .andThen(c.shouldBeCalled(2))
        .when(() => {
          b(2);
          b(1);
        });
    });
  });

  it('should allow then to be used as a synonym for andThen', () => {
    shouldFailWith('Out of order function call c\(\)', () => {
      b.shouldBeCalled()
        .then(c.shouldBeCalled())
        .when(() => {
          c();
          b();
        });
    });
  });

  it('should catch out of order calls when mixed with unordered calls', () => {
    shouldFailWith('Out of order function call c\(\)', () => {
      a.shouldBeCalled()
        .and(b.shouldBeCalled())
        .then(c.shouldBeCalled())
        .when(() => {
          b();
          c();
          a();
        });
    });
  });

  it('should allow ordered and unordered calls to be mixed', () => {
    console.log();
    console.log();
    let e = a.shouldBeCalledWith(1)
      .andAlso(a.shouldBeCalledWith(2))
      .andThen(a.shouldBeCalledWith(3))
      .andAlso(a.shouldBeCalledWith(4));

    console.log(e._tree.toString());

    e.when(() => {
      a(2);
      a(1);
      a(4);
      a(3);
    });
  });
});
