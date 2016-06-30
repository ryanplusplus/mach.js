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
    try {
      thunk();
    }
    catch(error) {
      expect(error.message).toContain(expectedFailure);
    }
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
    shouldFailWith('Unexpected function call b()', () => {
      a.shouldBeCalled().when(() => {
        b();
      });
    });
  });

  it('should fail when a function is called unexpectedly', () => {
    shouldFailWith('Unexpected function call a()', () => {
      a();
    });
  });

  it('should fail when a function is called unexpectedly after a successful expectation', () => {
    a.shouldBeCalled().when(() => {
      a();
    });

    shouldFailWith('Unexpected function call a()', () => {
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
    shouldFailWith('Unexpected arguments (1, \'3\') provided to function a', () => {
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
    let failureMessage = 'Unexpected arguments (1, 3, 2) provided to function a\nIncomplete calls:\n\ta(1, <any>, 3)';

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

    shouldFailWith('Unexpected function call f()', () => {
      mock();
    });

    f = () => {};
    mock = mach.mockFunction(f);

    shouldFailWith('Unexpected function call <anonymous>()', () => {
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
    shouldFailWith('Out of order function call c()', () => {
      b.shouldBeCalled()
        .andThen(c.shouldBeCalled())
        .when(() => {
          c();
          b();
        });
    });

    shouldFailWith('Unexpected arguments (2) provided to function b', () => {
      b.shouldBeCalledWith(1)
        .andThen(c.shouldBeCalled(2))
        .when(() => {
          b(2);
          b(1);
        });
    });
  });

  it('should allow then to be used as a synonym for andThen', () => {
    shouldFailWith('Out of order function call c()', () => {
      b.shouldBeCalled()
        .then(c.shouldBeCalled())
        .when(() => {
          c();
          b();
        });
    });
  });

  it('should catch out of order calls when mixed with unordered calls', () => {
    shouldFailWith('Out of order function call c()', () => {
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
    a.shouldBeCalledWith(1)
      .andAlso(a.shouldBeCalledWith(2))
      .andThen(a.shouldBeCalledWith(3))
      .andAlso(a.shouldBeCalledWith(4))
      .when(() => {
        a(2);
        a(1);
        a(4);
        a(3);
      });
  });

  it('should correctly handle ordering when expectations are nested', () => {
    a.shouldBeCalledWith(1)
      .andAlso(a.shouldBeCalledWith(2)
        .andThen(a.shouldBeCalledWith(3)
          .andAlso(a.shouldBeCalledWith(4))))
      .when(() => {
        a(2);
        a(1);
        a(4);
        a(3);
      });
  });

  it('should allow you to mix and match call types', () => {
    b.shouldBeCalled()
      .andAlso(c.shouldBeCalledWith(1, 2, 3))
      .andThen(c.shouldBeCalledWith(1)
        .andWillReturn(4))
      .when(() => {
        b();
        c(1, 2, 3);
        expect(c(1))
          .toBe(4);
      });
  });

  it('should maintain independent expectations', () => {
    a.shouldBeCalled();

    a.shouldBeCalled().when(() => {
      a();
    });
  });

  it('should allow soft expectations to be called', () => {
    a.mayBeCalled().when(() => {
      a();
    });
  });

  it('should allow soft expectations to be omitted', () => {
    a.mayBeCalled().when(() => {});
  });

  it('should allow soft expectations with return values', () => {
    a.mayBeCalled().andWillReturn(3).when(() => {
      expect(a()).toBe(3);
    });
  });

  it('should allow soft expectations with arguments to be called', () => {
    a.mayBeCalledWith(4).when(() => {
      a(4);
    });

    a.mayBeCalledWith(4).when(() => {
      a(4);
    });
  });

  it('should fail if mayBeCalled is used after a call has already been specified', () => {
    shouldFail(() => {
      a.shouldBeCalled().mayBeCalled();
    });
  });

  it('should fail if mayBeCalledWith is used after a call has already been specified', () => {
    shouldFail(() => {
      a.shouldBeCalled().mayBeCalledWith(4);
    });
  });

  it('should handle object arguments in error messages', () => {
    let o = {};

    shouldFailWithExactly('Unexpected function call a([object Object])', () => {
      a(o);
    });
  });

  it('should allow a strictly ordered call to occur after a missing optional call', () => {
    b.mayBeCalled().andThen(c.shouldBeCalled()).when(() => {
      c();
    });
  });

  it('should not allow order to be violated for an optional call', () => {
    shouldFailWith('Unexpected function call b()', () => {
      b.mayBeCalled().andThen(c.shouldBeCalled()).when(() => {
        c();
        b();
      });
    });
  });

  it('should indicate expectation status in unexpected call failures', () => {
    let failureMessage =
      'Unexpected function call b()\n' +
      'Completed calls:\n' +
      '\tb()\n' +
      'Incomplete calls:\n' +
      '\tc()';

    shouldFailWithExactly(failureMessage, () => {
      b.shouldBeCalled().andThen(c.shouldBeCalled()).when(() => {
        b();
        b();
      });
    });
  });

  it('should indicate expectation status in unexpected arguments failures', () => {
    let failureMessage =
      'Unexpected arguments (1) provided to function c\n' +
      'Completed calls:\n' +
      '\tb()\n' +
      'Incomplete calls:\n' +
      '\tc()';

    shouldFailWithExactly(failureMessage, () => {
      b.shouldBeCalled().andThen(c.shouldBeCalled()).when(() => {
        b();
        c(1);
      });
    });
  });

  it('should indicate expectation status in out of order call failures', () => {
    let failureMessage =
      'Out of order function call b()\n' +
      'Completed calls:\n' +
      '\tb()\n' +
      'Incomplete calls:\n' +
      '\tc()\n' +
      '\tb()';

    shouldFailWithExactly(failureMessage, () => {
      b.shouldBeCalled()
        .andThen(c.shouldBeCalled())
        .andThen(b.shouldBeCalled())
        .when(() => {
          b();
          b();
        });
    });
  });

  it('should indicate expectation status when not all calls occur', () => {
    let failureMessage =
      'Not all calls occurred\n' +
      'Completed calls:\n' +
      '\ta()\n' +
      'Incomplete calls:\n' +
      '\tb()';

    shouldFailWithExactly(failureMessage, () => {
      a.shouldBeCalled().andThen(b.shouldBeCalled()).when(() => {
        a();
      });
    });
  });

  it('should omit the completed call listing when there are no completed calls', () => {
    let failureMessage =
      'Unexpected function call b()\n' +
      'Incomplete calls:\n' +
      '\ta()';

    shouldFailWithExactly(failureMessage, () => {
      a.shouldBeCalled().when(() => {
        b();
      });
    });
  });

  it('should omit the incomplete call listing when there are no incomplete calls', () => {
    let failureMessage =
      'Unexpected function call c()\n' +
      'Completed calls:\n' +
      '\tb()';

    shouldFailWithExactly(failureMessage, () => {
      b.shouldBeCalled().when(() => {
        b();
        c();
      });
    });
  });

  it('should indicate when any args are allowed in call listing', () => {
    let failureMessage =
      'Unexpected function call c()\n' +
      'Completed calls:\n' +
      '\tb(1, 2, 3)\n' +
      'Incomplete calls:\n' +
      '\tb(<any>)';

    shouldFailWithExactly(failureMessage, () => {
      b.shouldBeCalledWithAnyArguments().multipleTimes(2).when(() => {
        b(1, 2, 3);
        c();
      });
    });
  });

  it('should show anonymous mocks in call listings', () => {
    let mock = mach.mockFunction();

    shouldFailWithExactly('Not all calls occurred\nIncomplete calls:\n\t<anonymous>()', () => {
      mock.shouldBeCalled().when(() => {});
    });
  });

  it('should show methods mocked on anonymous objects in call listings', () => {
    let mockedObject = mach.mockObject({
      f: () => {}
    });

    shouldFailWithExactly('Not all calls occurred\nIncomplete calls:\n\t<anonymous>.f()', () => {
      mockedObject.f.shouldBeCalled().when(() => {});
    });
  });

  it('should print arrays in calls properly', () => {
    shouldFailWith('Unexpected function call a([1, \'2\', 3])', () => {
      a([1, '2', 3]);
    });
  });

  it('should print nested arrays in calls properly', () => {
    shouldFailWith('Unexpected function call a([1, [2, \'3\'], \'4\'])', () => {
      a([1, [2, '3'], '4']);
    });
  });

  it('should print undefined in calls properly', () => {
    shouldFailWith('Unexpected function call a(undefined)', () => {
      a(undefined);
    });
  });

  it('should print null in calls properly', () => {
    shouldFailWith('Unexpected function call a(null)', () => {
      a(null);
    });
  });

  it('should actually check for sameness', () => {
    shouldFail(() => {
      a.shouldBeCalledWith(mach.same([1, 2, 3])).when(() => {
        a([3, 2, 1]);
      });
    });
  });

  it('should allow some arguments to be checked for sameness and some for equality', () => {
    shouldFail(() => {
      a.shouldBeCalledWith(mach.same([1, 2, 3]), [4, 5, 6]).when(() => {
        a([1, 2, 3], [4, 5, 6]);
      });
    });

    a.shouldBeCalledWith(mach.same([1, 2, 3]), 7).when(() => {
      a([1, 2, 3], 7);
    });
  });

  it('should actually check for sameness when nothing is called', () => {
    let failureMessage = 'Incomplete calls:\n' + '\ta([1, 2, 3])';

    shouldFailWith(failureMessage, () => {
      a.shouldBeCalledWith(mach.same([1, 2, 3])).when(() => {});
    });
  });

  it('should allow custom matchers to be used with mach.same', () => {
    let alwaysMatches = () => {
      return true;
    };

    let neverMatches = () => {
      return false;
    };

    a.shouldBeCalledWith(mach.same([1, 2, 3], alwaysMatches)).when(() => {
      a([3, 2, 1]);
    });

    shouldFail(() => {
      a.shouldBeCalledWith(mach.same([1, 2, 3], neverMatches)).when(() => {
        a([1, 2, 3]);
      });
    });
  });

  it('should allow mach.match to be used as an alias for mach.same', () => {
    a.shouldBeCalledWith(mach.match([1, 2, 3])).when(() => {
      a([1, 2, 3]);
    });
  });

  it('should allow additional mocked calls to be ignored', () => {
    b.shouldBeCalled().andOtherCallsShouldBeIgnored().when(() => {
      b();
      c();
    });
  });

  it('should allow mocked calls to be ignored', () => {
    let x;

    mach.ignoreMockedCallsWhen(() => {
      a();
      x = 4;
    });

    expect(x).toBe(4);
  });

  it('should allow mocked calls to be ignored asynchronously', (done) => {
    let x;

    mach.ignoreMockedCallsWhen(() => new Promise((resolve) => {
      process.nextTick(a);
      process.nextTick(() => {
        x = 4;
      });
      process.nextTick(resolve);
    })).then(() => {
      expect(x).toBe(4);
      done();
    });
  });

  it('should fail when a function is called unexpectedly after calls are ignored', () => {
    mach.ignoreMockedCallsWhen(() => {
      a();
    });

    shouldFailWith('Unexpected function call a()', () => {
      a();
    });
  });

  describe('callback expectations', () => {
    it('should allow an expectation to have a callback', (done) => {
      a.shouldBeCalledWith(mach.callback).andWillCallback()
        .when(() => new Promise((resolve) => {
          a(() => {
            resolve(1);
          });
        }))
        .catch(fail)
        .then((value) => {
          expect(value).toEqual(1);
          done();
        });
    });

    it('should allow an expectation to have a callback with arguments', (done) => {
      a.shouldBeCalledWith(mach.callback).andWillCallback(0, 1, 2)
        .when(() => new Promise((resolve) => {
          a((...args) => {
            resolve(args.reduce((p, c) => p + c));
          });
        }))
        .catch(fail)
        .then((value) => {
          expect(value).toEqual(3);
          done();
        });
    });

    it('should allow mixing callbacks and regular arguments', (done) => {
      a.shouldBeCalledWith(1, mach.callback, 2).andWillCallback(3)
        .when(() => new Promise((resolve) => {
          a(1, (value) => {
            expect(value).toEqual(3);
            resolve();
          }, 2);
        }))
        .catch(fail)
        .then(done);
    });

    it('should support node style error callbacks: error case', (done) => {
      a.shouldBeCalledWith(mach.callback).andWillCallback('oh noes')
        .when(() => new Promise((resolve, reject) => {
          a((err, val) => {
            if(err) {
              reject(err);
            }
            resolve(val);
          });
        }))
        .then(() => fail('should have rejected'))
        .catch((error) => {
          expect(error).toEqual('oh noes');
          done();
        });
    });

    it('should support node style error callbacks: non-error case', (done) => {
      a.shouldBeCalledWith(mach.callback).andWillCallback(undefined, 1)
        .when(() => new Promise((resolve, reject) => {
          a((err, val) => {
            if(err) {
              reject(err);
            }
            resolve(val);
          });
        }))
        .catch(fail)
        .then((value) => {
          expect(value).toEqual(1);
          done();
        });
    });

    it('should throw a mach error when callback expected argument is not specified', (done) => {
      shouldFailWith('expectation has no arguments to callback', () => {
        a.shouldBeCalled().andWillCallback()
          .when(() => new Promise((resolve) => {
            a(() => resolve);
          }))
          .then(() => {
            fail('should have errored out');
            done();
          });
      });
      done();
    });

    it('should throw a mach error when callback and return value are specified', (done) => {
      shouldFailWith('expectation can not have return value and callback', () => {
        a.shouldBeCalledWith(mach.callback).andWillCallback().andWillReturn(0)
          .when(() => new Promise((resolve) => {
            a(() => resolve);
          }))
          .then(() => {
            fail('should have errored out');
            done();
          });
      });

      shouldFailWith('expectation can not have return value and callback', () => {
        a.shouldBeCalledWith(mach.callback).andWillReturn(0).andWillCallback()
          .when(() => new Promise((resolve) => {
            a(() => resolve);
          }))
          .then(() => {
            fail('should have errored out');
            done();
          });
      });
      done();
    });

    it('should throw a mach error if no callback is passed in at runtime', (done) => {
      a.shouldBeCalledWith(mach.callback).andWillCallback()
        .when(() => new Promise((resolve) => {
          a(0);
          resolve();
        }))
        .then(() => fail('should have rejected'))
        .catch((error) => {
          expect(error.message)
            .toEqual('Unexpected arguments (0) provided to function a\nIncomplete calls:\n\ta(<callback>)');
          done();
        });
    });

    it('should throw a mach error if callback passed in incorrectly at runtime', (done) => {
      let expectedError = 'Unexpected arguments (0, () => {\n' +
        ' resolve();\n' +
        ' }) provided to function a\n' +
        'Incomplete calls:\n' +
        '\ta(<callback>, 0)';

      a.shouldBeCalledWith(mach.callback, 0).andWillCallback()
        .when(() => new Promise((resolve) => {
          a(0, () => {
            resolve();
          });
        }))
        .then(() => fail('should have rejected'))
        .catch((error) => {
          expect(error.message.replace(/\s+/g, '')).toEqual(expectedError.replace(/\s+/g, ''));
          done();
        });
    });
  });

  describe('async tests', () => {
    it('should allow callbacks in thunks', (done) => {
      a.shouldBeCalled()
        .when(() => new Promise((resolve) => {
          let f = (callback) => {
            a();
            callback();
          };

          f(() => {
            resolve();
          });
        }))
        .then(() => done());
    });

    it('should rethrow errors from node style error callbacks in thunks', (done) => {
      let errorMessage = 'oh hai der!';

      a.shouldBeCalled()
        .when(() => new Promise((resolve, reject) => {
          let f = (callback) => {
            a();
            callback(new Error(errorMessage));
          };

          f((error) => {
            if(error) {
              reject(error);
            }
          });
        }))
        .catch((error) => {
          expect(error.message).toEqual(errorMessage);
          done();
        });
    });

    it('should rethrow errors from before callback in thunks', (done) => {
      let errorMessage = 'oh hai der!';

      a.shouldBeCalled()
        .when(() => new Promise((resolve) => {
          let f = () => {
            a();
            throw new Error(errorMessage);
          };

          f(() => {
            resolve();
          });
        }))
        .catch((error) => {
          expect(error.message).toEqual(errorMessage);
          done();
        });
    });

    it('should rethrow mach errors from callback thunks', (done) => {
      a.shouldBeCalled()
        .when(() => Promise.resolve())
        .catch((error) => {
          expect(error.message.startsWith('Not all calls occurred')).toBe(true);
          done();
        });
    });
  });

  it('should allow promises in thunks', (done) => {
    a.shouldBeCalled()
      .when(() => Promise.resolve(a()))
      .then(() => {
        done();
      });
  });

  it('should return values from promises', (done) => {
    a.shouldBeCalled()
      .andWillReturn(1)
      .when(() => Promise.resolve(a()))
      .catch((error) => {
        fail(error);
      })
      .then((value) => {
        expect(value).toEqual(1);
        done();
      });
  });

  it('should rethrow errors from code in promises', (done) => {
    let errorMessage = 'oh hai der!';

    a.shouldBeCalled()
      .when(() => Promise.reject(new Error(errorMessage)))
      .catch((error) => {
        expect(error.message).toEqual(errorMessage);
        done();
      });
  });

  it('should rethrow mach errors from promises', (done) => {
    a.shouldBeCalled()
      .when(() => Promise.resolve())
      .then(() => {
        fail('expected an error to happen...');
        done();
      }, (error) => {
        expect(error.message.startsWith('Not all calls occurred'))
          .toBe(true);
        done();
      });
  });

  it('should allow for nested promises', (done) => {
    a.shouldBeCalled()
      .andWillReturn(Promise.resolve(0))
      .then(a.shouldBeCalled()
        .andWillReturn(Promise.resolve(1)))
      .when(() => {
        return a()
          .then((v0) => {
            expect(v0).toEqual(0);

            return a()
              .then((v1) => {
                expect(v1).toEqual(1);
              });
          });
      })
      .catch((error) => {
        fail(error);
      })
      .then(() => {
        done();
      });
  });

  it('should mock setTimeout', (done) => {
    let _setTimeout = global.setTimeout;
    global.setTimeout = mach.mockFunction('setTimeout');
    let timer = {
      _name: 'timer object'
    };

    global.setTimeout.shouldBeCalledWith(mach.callback, 1000).andWillReturn(timer).andWillCallback()
      .when(() => new Promise((resolve) => {
        let t = setTimeout(() => {
          expect(t).toEqual(timer);
          resolve();
        }, 1000);
      }))
      .catch(fail)
      .then(() => global.setTimeout = _setTimeout)
      .then(done);
  });
});
