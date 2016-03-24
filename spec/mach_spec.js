'use strict';

describe('mach', () => {
  let mach = require('./../index.js');
  let f = mach.mockFunction('f');
  let f1 = mach.mockFunction('f1');
  let f2 = mach.mockFunction('f2');

  let shouldFail = (thunk) => {
    try {
      thunk();
      fail('expected failure did not occur');
    }
    catch (e) {}
  };

  let shouldFailWith = (expectedFailure, thunk) => {
    try {
      thunk();
      fail('expected failure did not occur');
    }
    catch (e) {
      expect(e.message.toString())
        .toContain(expectedFailure);
    }
  };

  let shouldFailWithExactly = (expectedFailure, thunk) => {
    try {
      thunk();
      fail('expected failure did not occur');
    }
    catch (e) {
      expect(e.message.toString())
        .toBe(expectedFailure);
    }
  };

  it('should allow anonymous mocks', () => {
    var anonymousMock = mach.mockFunction();

    anonymousMock.shouldBeCalled()
      .when(() => {
        anonymousMock();
      });
  });

  describe('synchronous', () => {
    it('should pass through errors in the tested code', () => {
      let expectedError = 'error from tested code';
      shouldFailWithExactly(expectedError, () => {
        f.shouldBeCalled()
          .when(() => {
            throw new Error(expectedError);
          });
      });
    });

    it('should be able to verify that a function is called', () => {
      f.shouldBeCalled()
        .when(() => {
          f();
        });
    });

    it('should fail when an expected function call does not occur', () => {
      shouldFailWith('Not all calls occurred', () => {
        f.shouldBeCalled()
          .when(() => {});
      });
    });

    it('should fail when a different mock is called instead of the expected mock', () => {
      shouldFailWith('Unexpected function call f2()', () => {
        f1.shouldBeCalled()
          .when(() => {
            f2();
          });
      });
    });

    it('should fail when a function is called unexpectedly', () => {
      shouldFailWith('Unexpected function call f()', () => {
        f();
      });
    });

    it('should fail when a function is called unexpectedly after a successful expectation', () => {
      f.shouldBeCalled()
        .when(() => {
          f();
        });

      shouldFailWith('Unexpected function call f()', () => {
        f();
      });
    });

    it('should be able to verify that a function has been called with the correct arguments', () => {
      f.shouldBeCalledWith(1, '2')
        .when(() => {
          f(1, '2');
        });
    });

    it('should allow undefined to be used as an argument to a mocked function', () => {
      f.shouldBeCalledWith(undefined)
        .when(() => {
          f(undefined);
        });
    });

    it('should allow null to be used as an argument to a mocked function', () => {
      f.shouldBeCalledWith(null)
        .when(() => {
          f(null);
        });
    });

    it('should fail when a function is called with incorrect arguments', () => {
      shouldFailWith('Unexpected arguments (1, \'3\') provided to function f', () => {
        f.shouldBeCalledWith(1, '2')
          .when(() => {
            f(1, '3');
          });
      });
    });
    // END OF SYNC
  });

  describe('callbacks', () => {
    it('should pass through errors in the tested code', (done) => {
      let expectedError = 'error from tested code';
      f.shouldBeCalled()
        .when((finish) => {
          let cbFunc = (callback) => {
            throw new Error(expectedError);
            callback();
          };

          cbFunc(() => {
            finish();
          });
        })
        .then(() => {
          fail(new Error('expected an error'));
          done();
        })
        .catch((error) => {
          expect(error.message)
            .toBe(expectedError);
          done();
        });
    });

    it('should be able to verify that a function is called', (done) => {
      f.shouldBeCalled()
        .when((finish) => {
          let cbFunc = (callback) => {
            f();
            callback();
          };

          cbFunc(() => {
            finish();
          });
        })
        .catch((error) => {
          fail(error.message);
          done();
        })
        .then(done);
    });

    it('should fail when an expected function call does not occur', (done) => {
      f.shouldBeCalled()
        .when((finish) => {
          let cbFunc = (callback) => {
            callback();
          };

          cbFunc(() => {
            finish();
          });
        })
        .then(() => {
          fail(new Error('expected an error'));
          done();
        })
        .catch((error) => {
          expect(error.message)
            .toContain('Not all calls occurred');
          done();
        });
    });
  });

  describe('promises', () => {
    it('should pass through errors in the tested code', (done) => {
      let expectedError = 'error from tested code';
      f.shouldBeCalled()
        .when((finish) => {
          return new Promise((resolve) => {
              throw new Error(expectedError);
              resolve();
            })
            .then(finish);
        })
        .then(() => {
          fail(new Error('expected an error'));
          done();
        })
        .catch((error) => {
          expect(error.message)
            .toBe(expectedError);
          done();
        });
    });

    it('should handle rejections in the tested code', (done) => {
      let expectedError = 'error from tested code';
      f.shouldBeCalled()
        .when((finish) => {
          return new Promise((resolve, reject) => {
              reject(new Error(expectedError));
            })
            .then(finish);
        })
        .then(() => {
          fail(new Error('expected an error'));
          done();
        })
        .catch((error) => {
          expect(error.message)
            .toBe(expectedError);
          done();
        });
    });

    it('should be able to verify that a function is called', (done) => {
      f.shouldBeCalled()
        .when((finish) => {
          return new Promise((resolve) => {
              f();
              resolve();
            })
            .then(finish);
        })
        .catch((error) => {
          fail(error.message);
          done();
        })
        .then(done);
    });

    it('should fail when an expected function call does not occur', (done) => {
      f.shouldBeCalled()
        .when((finish) => {
          return new Promise((resolve) => {
              resolve();
            })
            .then(finish);
        })
        .then(() => {
          fail(new Error('expected an error'));
          done();
        })
        .catch((error) => {
          expect(error.message)
            .toContain('Not all calls occurred');
          done();
        });
    });

    it('should fail when a different mock is called instead of the expected mock', (done) => {
      f1.shouldBeCalled()
        .when((finish) => {
          return new Promise((resolve) => {
              f2();
              resolve();
            })
            .then(() => {
              finish();
            });
        })
        .then(() => {
          fail(new Error('expected an error'));
          done();
        })
        .catch((error) => {
          expect(error.message)
            .toContain('Unexpected function call f2()');
          done();
        });
    });

    it('should fail when a function is called unexpectedly', (done) => {
      new Promise((resolve) => {
          f();
          resolve();
        })
        .then(() => {
          fail(new Error('expected an error'));
          done();
        })
        .catch((error) => {
          expect(error.message)
            .toContain('Unexpected function call f()');
          done();
        });
    });

    it('should fail when a function is called unexpectedly after a successful expectation', () => {
      f.shouldBeCalled()
        .when((finish) => {
          new Promise((resolve) => {
              f();
              resolve();
            })
            .then(() => {
              shouldFailWith('Unexpected function call f()', () => {
                f();
              });
            });
            finish();
        });
    });

    it('should be able to verify that a function has been called with the correct arguments', (done) => {
      f.shouldBeCalledWith(1, '2')
        .when((finish) => {
          return new Promise((resolve) => {
              f(1, '2');
              resolve();
            })
            .then(finish);
        })
        .catch((error) => {
          fail(error.message);
          done();
        })
        .then(done);
    });

    it('should allow undefined to be used as an argument to a mocked function', (done) => {
      f.shouldBeCalledWith(undefined)
        .when((finish) => {
          return new Promise((resolve) => {
              f(undefined);
              resolve();
            })
            .then(finish);
        })
        .catch((error) => {
          fail(error.message);
          done();
        })
        .then(done);
    });

    it('should allow null to be used as an argument to a mocked function', (done) => {
      f.shouldBeCalledWith(null)
        .when((finish) => {
          return new Promise((resolve) => {
              f(null);
              resolve();
            })
            .then(finish);
        })
        .catch((error) => {
          fail(error.message);
          done();
        })
        .then(done);
    });

    it('should fail when a function is called with incorrect arguments', (done) => {
      // shouldFailWith('Unexpected arguments (1, \'3\') provided to function f', () => {
      f.shouldBeCalledWith(1, '2')
        .when((finish) => {
          return new Promise((resolve) => {
              f(1, '3');
              resolve();
            })
            .then(finish);
        })
        .then(() => {
          fail(new Error('expected an error'));
          done();
        })
        .catch((error) => {
          expect(error.message)
            .toContain('Unexpected arguments (1, \'3\') provided to function f');
          done();
        });
    });
    // END OF PROMISES
  });

  it('should be able to verify that a function is called with any arguments', () => {
    f1.shouldBeCalledWithAnyArguments()
      .when(() => {
        f1();
      });

    f1.shouldBeCalledWithAnyArguments()
      .when(() => {
        f1(1, 'hi');
      });

    shouldFailWith('Not all calls occurred', () => {
      f.shouldBeCalledWithAnyArguments()
        .when(() => {});
    });
  });

  it('should be able to have a soft expectation for a call with any arguments', () => {
    f1.mayBeCalledWithAnyArguments()
      .when(() => {});

    f1.mayBeCalledWithAnyArguments()
      .when(() => {
        f1(1, 'hi');
      });
  });

  it('should allow mach.any to match any single argument', () => {
    f.shouldBeCalledWith(1, mach.any, 3)
      .when(() => {
        f(1, 'whatever', 3);
      });
  });

  it('should ensure that other arguments match when using mach.any', () => {
    var failureMessage =
      'Unexpected arguments (1, 3, 2) provided to function f\n' +
      'Incomplete calls:\n' +
      '\tf(1, <mach.any>, 3)';

    shouldFailWithExactly(failureMessage, () => {
      f.shouldBeCalledWith(1, mach.any, 3)
        .when(() => {
          f(1, 3, 2);
        });
    });
  });

  it('should allow the return value of a mocked function to be specified', () => {
    f.shouldBeCalled()
      .andWillReturn(4)
      .when(() => {
        expect(f())
          .toBe(4);
      });
  });

  it('should allow a mocked call to throw when called', () => {
    f.shouldBeCalled()
      .andWillThrow(4)
      .when(() => {
        try {
          f();
        }
        catch (e) {
          expect(e)
            .toBe(4);
        }
      });
  });

  it('should allow multiple function calls to be expected', () => {
    f.shouldBeCalled()
      .andAlso(f.shouldBeCalledWith(1, 2, 3))
      .when(() => {
        f();
        f(1, 2, 3);
      });
  });

  it('should fail if multiplle function calls are expected but not all occur', () => {
    shouldFailWith('Not all calls occurred', () => {
      f.shouldBeCalled()
        .andAlso(f.shouldBeCalledWith(1, 2, 3))
        .when(() => {
          f(1, 2, 3);
        });
    });
  });

  it('should be able to verify that multiple functions are called', () => {
    f1.shouldBeCalled()
      .andAlso(f2.shouldBeCalledWith(1, 2, 3))
      .when(() => {
        f1();
        f2(1, 2, 3);
      });
  });

  it('should allow an existing function to be mocked', () => {
    function f() {}
    var fMock = mach.mockFunction(f);

    shouldFailWith('Unexpected function call f()', () => {
      fMock();
    });
  });

  it('should allow functions to be used to improve readability', () => {
    function somethingShouldHappen() {
      return f1.shouldBeCalled();
    }

    function anotherThingShouldHappen() {
      return f2.shouldBeCalledWith(1, 2, 3);
    }

    function theCodeUnderTestRuns() {
      f1();
      f2(1, 2, 3);
    }

    somethingShouldHappen()
      .
    andAlso(anotherThingShouldHappen())
      .
    when(theCodeUnderTestRuns);
  });

  it('should allow an object containing functions to be mocked', () => {
    var someObject = {
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
    var someObject = {
      foo: () => {},
      bar: () => {},
      baz: 3
    };

    let mockedObject = mach.mockObject(someObject, 'someObject');

    expect(mockedObject.baz)
      .toBe(3);
  });

  it('should let you expect a function to be called multiple times', () => {
    f.shouldBeCalledWith(2)
      .andWillReturn(1)
      .multipleTimes(3)
      .when(() => {
        expect(f(2))
          .toBe(1);
        expect(f(2))
          .toBe(1);
        expect(f(2))
          .toBe(1);
      });
  });

  it('should fail if a function is not called enough times', () => {
    shouldFailWith('Not all calls occurred', () => {
      var f = mach.mockFunction();

      f.shouldBeCalledWith(2)
        .multipleTimes(3)
        .when(() => {
          f(2);
          f(2);
        });
    });
  });

  it('should fail if a function is called too many times', () => {
    shouldFailWith('Unexpected function call f(2)', () => {
      f.shouldBeCalledWith(2)
        .multipleTimes(2)
        .when(() => {
          f(2);
          f(2);
          f(2);
        });
    });
  });

  it('should allow after to be used as an alias for when', () => {
    var f = mach.mockFunction();

    f.shouldBeCalled()
      .after(() => {
        f();
      });
  });

  it('should allow and to be used as an alias for andAlso', () => {
    f.shouldBeCalled()
      .and(f.shouldBeCalledWith(1, 2, 3))
      .when(() => {
        f();
        f(1, 2, 3);
      });
  });

  it('should fail if andWillReturn is not preceeded by shouldBeCalled or shouldBeCalledWith', () => {
    shouldFail(() => {
      f.andWillReturn(1);
    });
  });

  it('should fail if when is not preceeded by shouldBeCalled or shouldBeCalledWith', () => {
    shouldFail(() => {
      f.when(() => {});
    });
  });

  it('should fail if after is not preceeded by shouldBeCalled or shouldBeCalledWith', () => {
    shouldFail(() => {
      f.after(() => {});
    });
  });

  it('should fail if shouldBeCalled is used after a call has already been specified', () => {
    shouldFail(() => {
      f.shouldBeCalled()
        .shouldBeCalled();
    });
  });

  it('should fail if shouldBeCalledWith is used after a call has already been specified', () => {
    shouldFail(() => {
      f.shouldBeCalled()
        .shouldBeCalledWith(4);
    });
  });

  it('should allow calls to happen out of order when andAlso is used', () => {
    f1.shouldBeCalled()
      .andAlso(f2.shouldBeCalled())
      .when(() => {
        f2();
        f1();
      });

    f1.shouldBeCalledWith(1)
      .andAlso(f1.shouldBeCalledWith(2))
      .when(() => {
        f1(2);
        f1(1);
      });
  });

  it('should not allow calls to happen out of order when andThen is used', () => {
    shouldFailWith('Out of order function call f2()', () => {
      f1.shouldBeCalled()
        .andThen(f2.shouldBeCalled())
        .when(() => {
          f2();
          f1();
        });
    });

    shouldFailWith('Unexpected arguments (2) provided to function f1', () => {
      f1.shouldBeCalledWith(1)
        .andThen(f2.shouldBeCalled(2))
        .when(() => {
          f1(2);
          f1(1);
        });
    });
  });

  it('should allow then to be used as a synonym for andThen', () => {
    shouldFailWith('Out of order function call f2()', () => {
      f1.shouldBeCalled()
        .then(f2.shouldBeCalled())
        .when(() => {
          f2();
          f1();
        });
    });
  });

  it('should catch out of order calls when mixed with unordered calls', () => {
    var f1 = mach.mockFunction('f1');
    var f2 = mach.mockFunction('f2');
    var f3 = mach.mockFunction('f3');

    shouldFailWith('Out of order function call f3()', () => {
      f1.shouldBeCalled()
        .and(f2.shouldBeCalled())
        .then(f3.shouldBeCalled())
        .when(() => {
          f2();
          f3();
          f1();
        });
    });
  });

  it('should allow ordered and unordered calls to be mixed', () => {
    f.shouldBeCalledWith(1)
      .andAlso(f.shouldBeCalledWith(2))
      .andThen(f.shouldBeCalledWith(3))
      .andAlso(f.shouldBeCalledWith(4))
      .when(() => {
        f(2);
        f(1);
        f(4);
        f(3);
      });
  });

  it('should correctly handle ordering when expectations are nested', () => {
    f.shouldBeCalledWith(1)
      .andAlso(f.shouldBeCalledWith(2)
        .andThen(f.shouldBeCalledWith(3)
          .andAlso(f.shouldBeCalledWith(4))))
      .when(() => {
        f(2);
        f(1);
        f(4);
        f(3);
      });
  });

  it('should allow you to mix and match call types', () => {
    f1.shouldBeCalled()
      .andAlso(f2.shouldBeCalledWith(1, 2, 3))
      .andThen(f2.shouldBeCalledWith(1)
        .andWillReturn(4))
      .when(() => {
        f1();
        f2(1, 2, 3);
        expect(f2(1))
          .toBe(4);
      });
  });

  it('should maintain independent expectations', () => {
    f.shouldBeCalled();

    f.shouldBeCalled()
      .when(() => {
        f();
      });
  });

  it('should allow soft expectations to be called', () => {
    f.mayBeCalled()
      .when(() => {
        f();
      });
  });

  it('should allow soft expectations to be omitted', () => {
    f.mayBeCalled()
      .when(() => {});
  });

  it('should allow soft expectations with return values', () => {
    f.mayBeCalled()
      .andWillReturn(3)
      .when(() => {
        expect(f())
          .toBe(3);
      });
  });

  it('should allow soft expectations with arguments to be called', () => {
    f.mayBeCalledWith(4)
      .when(() => {
        f(4);
      });

    f.mayBeCalledWith(4)
      .when(() => {
        f(4);
      });
  });

  it('should allow soft expectations with arguments to be omitted', () => {
    f.mayBeCalledWith(4)
      .when(() => {});
  });

  it('should fail if mayBeCalled is used after a call has already been specified', () => {
    shouldFail(() => {
      f.shouldBeCalled()
        .mayBeCalled();
    });
  });

  it('should fail if mayBeCalledWith is used after a call has already been specified', () => {
    shouldFail(() => {
      f.shouldBeCalled()
        .mayBeCalledWith(4);
    });
  });

  it('should handle object arguments in error messages', () => {
    var a = {};

    shouldFailWith('Unexpected function call f(' + a.toString() + ')', () => {
      mach.mockFunction('f')(a);
    });
  });

  it('should allow a strictly ordered call to occur after a missing optional call', () => {
    f1.mayBeCalled()
      .andThen(f2.shouldBeCalled())
      .when(() => {
        f2();
      });
  });

  it('should not allow order to be violated for an optional call', () => {
    shouldFailWith('Unexpected function call f1()', () => {
      f1.mayBeCalled()
        .andThen(f2.shouldBeCalled())
        .when(() => {
          f2();
          f1();
        });
    });
  });

  it('should indicate expectation status in unexpected call failures', () => {
    var failureMessage =
      'Completed calls:\n' +
      '\tf1()\n' +
      'Incomplete calls:\n' +
      '\tf2()';

    shouldFailWith(failureMessage, () => {
      f1.shouldBeCalled()
        .andThen(f2.shouldBeCalled())
        .when(() => {
          f1();
          f1();
        });
    });
  });

  it('should indicate expectation status in unexpected arguments failures', () => {
    var failureMessage =
      'Completed calls:\n' +
      '\tf1()\n' +
      'Incomplete calls:\n' +
      '\tf2()';

    shouldFailWith(failureMessage, () => {
      f1.shouldBeCalled()
        .andThen(f2.shouldBeCalled())
        .when(() => {
          f1();
          f2(1);
        });
    });
  });

  it('should indicate expectation status in out of order call failures', () => {
    var failureMessage =
      'Completed calls:\n' +
      '\tf1()\n' +
      'Incomplete calls:\n' +
      '\tf2()\n' +
      '\tf1()';

    shouldFailWith(failureMessage, () => {
      f1.shouldBeCalled()
        .andThen(f2.shouldBeCalled())
        .andThen(f1.shouldBeCalled())
        .when(() => {
          f1();
          f1();
        });
    });
  });

  it('should indicate expectation status when not all calls occur', () => {
    var failureMessage =
      'Completed calls:\n' +
      '\tf1()\n' +
      'Incomplete calls:\n' +
      '\tf2()';

    shouldFailWith(failureMessage, () => {
      f1.shouldBeCalled()
        .andThen(f2.shouldBeCalled())
        .when(() => {
          f1();
        });
    });
  });

  it('should omit the completed call listing when there are no completed calls', () => {
    var failureMessage =
      'Unexpected function call f2()\n' +
      'Incomplete calls:\n' +
      '\tf1()';

    shouldFailWithExactly(failureMessage, () => {
      f1.shouldBeCalled()
        .when(() => {
          f2();
        });
    });
  });

  it('should omit the incomplete call listing when there are no incomplete calls', () => {
    var failureMessage =
      'Unexpected function call f2()\n' +
      'Completed calls:\n' +
      '\tf1()';

    shouldFailWithExactly(failureMessage, () => {
      f1.shouldBeCalled()
        .when(() => {
          f1();
          f2();
        });
    });
  });

  it('should indicate when any args are allowed in call listing', () => {
    var failureMessage =
      'Completed calls:\n' +
      '\tf1(1, 2, 3)\n' +
      'Incomplete calls:\n' +
      '\tf1(<any>)';

    shouldFailWith(failureMessage, () => {
      f1.shouldBeCalledWithAnyArguments()
        .multipleTimes(2)
        .when(() => {
          f1(1, 2, 3);
          f2();
        });
    });
  });

  it('should show anonymous mocks in call listings', () => {
    var anonymousMock = mach.mockFunction();

    shouldFailWith('Incomplete calls:\n\t<anonymous>()', () => {
      anonymousMock.shouldBeCalled()
        .when(() => {});
    });
  });

  it('should show methods mocked on anonymous objects in call listings', () => {
    var anonymousMockedObject = mach.mockObject({
      f: () => {}
    });

    shouldFailWith('Incomplete calls:\n\t<anonymous>.f()', () => {
      anonymousMockedObject.f.shouldBeCalled()
        .when(() => {});
    });
  });

  it('should print arrays in calls properly', () => {
    shouldFailWith('Unexpected function call f([1, 2, 3])', () => {
      f([1, 2, 3]);
    });
  });

  it('should print undefined in calls properly', () => {
    shouldFailWith('Unexpected function call f(undefined)', () => {
      f(undefined);
    });
  });

  it('should print null in calls properly', () => {
    shouldFailWith('Unexpected function call f(null)', () => {
      f(null);
    });
  });

  it('should allow arguments to be checked for sameness', () => {
    f.shouldBeCalledWith(mach.same([1, 2, 3]))
      .when(() => {
        f([1, 2, 3]);
      });
  });

  it('should actually check for sameness', () => {
    shouldFail(() => {
      f.shouldBeCalledWith(mach.same([1, 2, 3]))
        .when(() => {
          f([3, 2, 1]);
        });
    });
  });

  it('should allow some arguments to be checked for sameness and some for equality', () => {
    shouldFail(() => {
      f.shouldBeCalledWith(mach.same([1, 2, 3]), [4, 5, 6])
        .when(() => {
          f([1, 2, 3], [4, 5, 6]);
        });
    });

    f.shouldBeCalledWith(mach.same([1, 2, 3]), 7)
      .when(() => {
        f([1, 2, 3], 7);
      });
  });

  it('should actually check for sameness', () => {
    var failureMessage = 'Incomplete calls:\n' + '\tf([1, 2, 3])';

    shouldFailWith(failureMessage, () => {
      f.shouldBeCalledWith(mach.same([1, 2, 3]))
        .when(() => {});
    });
  });

  it('should allow custom matchers to be used with mach.same', () => {
    var alwaysMatches = () => {
      return true;
    };

    var neverMatches = () => {
      return false;
    };

    f.shouldBeCalledWith(mach.same([1, 2, 3], alwaysMatches))
      .when(() => {
        f([3, 2, 1]);
      });

    shouldFail(() => {
      f.shouldBeCalledWith(mach.same([1, 2, 3], neverMatches))
        .when(() => {
          f([1, 2, 3]);
        });
    });
  });

  it('should allow mach.match to be used as an alias for mach.same', () => {
    f.shouldBeCalledWith(mach.match([1, 2, 3]))
      .when(() => {
        f([1, 2, 3]);
      });
  });

  it('should allow additional mocked calls to be ignored', () => {
    f1.shouldBeCalled()
      .andOtherCallsShouldBeIgnored()
      .when(() => {
        f1();
        f2();
      });
  });

  it('should allow mocked calls to be ignored', () => {
    var x;

    mach.ignoreMockedCallsWhen(() => {
      f();
      x = 4;
    });

    expect(x)
      .toBe(4);
  });

  it('should fail when a function is called unexpectedly after calls are ignored', () => {
    mach.ignoreMockedCallsWhen(() => {
      f();
    });

    shouldFailWith('Unexpected function call f()', () => {
      f();
    });
  });
});
