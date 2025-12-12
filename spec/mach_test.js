'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

void describe('mach.js', () => {
  let mach = require('../index.js');
  let a = mach.mockFunction('a');
  let b = mach.mockFunction('b');
  let c = mach.mockFunction('c');

  void it('should allow anonymous mocks', () => {
    let anonymous = mach.mockFunction();

    anonymous.shouldBeCalled().when(() => {
      anonymous();
    });
  });

  void it('should verify that a function was called', () => {
    a.shouldBeCalled().when(() => a());
  });

  void it('should fail when an expected function call does not occur', () => {
    assert.throws(() => {
      a.shouldBeCalled().when(() => {});
    }, /Not all calls occurred/);
  });

  void it('should fail when a different mock is called instead of the expected mock', () => {
    assert.throws(() => {
      a.shouldBeCalled().when(() => {
        b();
      });
    }, /Unexpected function call b()/);
  });

  void it('should fail when a function is called unexpectedly', () => {
    assert.throws(() => {
      a();
    }, /Unexpected function call a()/);
  });

  void it('should fail when a function is called unexpectedly after a successful expectation', () => {
    a.shouldBeCalled().when(() => {
      a();
    });

    assert.throws(() => {
      a();
    }, /Unexpected function call a()/);
  });

  void it('should be able to verify that a function has been called with the correct arguments', () => {
    a.shouldBeCalledWith(1, '2').when(() => {
      a(1, '2');
    });
  });

  void it('should allow undefined to be used as an argument to a mocked function', () => {
    a.shouldBeCalledWith(undefined).when(() => {
      a(undefined);
    });
  });

  void it('should allow null to be used as an argument to a mocked function', () => {
    a.shouldBeCalledWith(null).when(() => {
      a(null);
    });
  });

  void it('should fail when a function is called with incorrect arguments', () => {
    assert.throws(() => {
      a.shouldBeCalledWith(1, '2').when(() => {
        a(1, '3');
      });
    }, /Unexpected arguments \(1, '3'\) provided to function a/);
  });

  void it('should be able to verify that a function is called with any arguments', () => {
    b.shouldBeCalledWithAnyArguments().when(() => {
      b();
    });

    b.shouldBeCalledWithAnyArguments().when(() => {
      b(1, 'hi');
    });

    assert.throws(() => {
      a.shouldBeCalledWithAnyArguments().when(() => {});
    }, /Not all calls occurred/);
  });

  void it('should be able to have a soft expectation for a call with any arguments', () => {
    b.mayBeCalledWithAnyArguments().when(() => {});

    b.mayBeCalledWithAnyArguments().when(() => {
      b(1, 'hi');
    });
  });

  void it('should allow mach.any to match any single argument', () => {
    a.shouldBeCalledWith(1, mach.any, 3).when(() => {
      a(1, 'whatever', 3);
    });
  });

  void it('should ensure that other arguments match when using mach.any', () => {
    assert.throws(() => {
      a.shouldBeCalledWith(1, mach.any, 3).when(() => {
        a(1, 3, 2);
      });
    }, /Unexpected arguments \(1, 3, 2\) provided to function a\nIncomplete calls:\n\ta\(1, <any>, 3\)/);
  });

  void it('should allow the return value of a mocked function to be specified', () => {
    a.shouldBeCalled().andWillReturn(4).when(() => {
      assert.strictEqual(a(), 4);
    });
  });

  void it('should allow a mocked call to throw when called', () => {
    a.shouldBeCalled().andWillThrow(new Error('error')).when(() => {
      assert.throws(() => a(), /error/);
    });
  });

  void it('should allow multiple function calls to be expected', () => {
    a.shouldBeCalled().andAlso(a.shouldBeCalledWith(1, 2, 3)).when(() => {
      a();
      a(1, 2, 3);
    });
  });

  void it('should fail if multiple function calls are expected but not all occur', () => {
    assert.throws(() => {
      a.shouldBeCalled().andAlso(a.shouldBeCalledWith(1, 2, 3)).when(() => {
        a(1, 2, 3);
      });
    }, /Not all calls occurred/);
  });

  void it('should be able to verify that multiple functions are called', () => {
    b.shouldBeCalled().andAlso(c.shouldBeCalledWith(1, 2, 3)).when(() => {
      b();
      c(1, 2, 3);
    });
  });

  void it('should allow an existing function to be mocked', () => {
    let f = function f() {};
    let mock = mach.mockFunction(f);

    assert.throws(() => {
      mock();
    }, /Unexpected function call f\(\)/);

    mock = mach.mockFunction(() => {});

    assert.throws(() => {
      mock();
    }, /Unexpected function call <anonymous>\(\)/);
  });

  void it('should allow functions to be used to improve readability', () => {
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

  void it('should allow an object containing functions to be mocked', () => {
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

  void it('should copy non-function fields to a mocked object', () => {
    let someObject = {
      foo: () => {},
      bar: () => {},
      baz: 3
    };

    let mockedObject = mach.mockObject(someObject, 'someObject');

    assert.strictEqual(mockedObject.baz, 3);
  });

  void it('should let you expect a function to be called multiple times', () => {
    a.shouldBeCalledWith(2).andWillReturn(1).multipleTimes(3).when(() => {
      assert.strictEqual(a(2), 1);
      assert.strictEqual(a(2), 1);
      assert.strictEqual(a(2), 1);
    });
  });

  void it('should fail if a function is not called enough times', () => {
    assert.throws(() => {
      a.shouldBeCalledWith(2).multipleTimes(3).when(() => {
        a(2);
        a(2);
      });
    }, /Not all calls occurred/);
  });

  void it('should allow after to be used as an alias for when', () => {
    a.shouldBeCalled().after(() => {
      a();
    });
  });

  void it('should allow and to be used as an alias for andAlso', () => {
    a.shouldBeCalled().and(a.shouldBeCalledWith(1, 2, 3)).when(() => {
      a();
      a(1, 2, 3);
    });
  });

  void it('should fail if andWillReturn is not preceeded by shouldBeCalled or shouldBeCalledWith', () => {
    assert.throws(() => {
      a.andWillReturn(1);
    });
  }, /.*/);

  void it('should fail if when is not preceeded by shouldBeCalled or shouldBeCalledWith', () => {
    assert.throws(() => {
      a.when(() => {});
    });
  }, /.*/);

  void it('should fail if shouldBeCalled is used after a call has already been specified', () => {
    assert.throws(() => {
      a.shouldBeCalled().shouldBeCalled();
    });
  }, /.*/);

  void it('should fail if shouldBeCalledWith is used after a call has already been specified', () => {
    assert.throws(() => {
      a.shouldBeCalled().shouldBeCalledWith(4);
    });
  }, /.*/);

  void it('should allow calls to happen out of order when andAlso is used', () => {
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

  void it('should not allow calls to happen out of order when andThen is used', () => {
    assert.throws(() => {
      b.shouldBeCalled()
        .andThen(c.shouldBeCalled())
        .when(() => {
          c();
          b();
        });
    }, /.*/);

    assert.throws(() => {
      b.shouldBeCalledWith(1)
        .andThen(c.shouldBeCalled(2))
        .when(() => {
          b(2);
          b(1);
        });
    }, /.*/);
  });

  void it('should allow then to be used as a synonym for andThen', () => {
    assert.throws(() => {
      b.shouldBeCalled()
        .then(c.shouldBeCalled())
        .when(() => {
          c();
          b();
        });
    }, /Out of order function call c\(\)/);
  });

  void it('should catch out of order calls when mixed with unordered calls', () => {
    assert.throws(() => {
      a.shouldBeCalled()
        .and(b.shouldBeCalled())
        .then(c.shouldBeCalled())
        .when(() => {
          b();
          c();
          a();
        });
    }, /Out of order function call c\(\)/);
  });

  void it('should allow ordered and unordered calls to be mixed', () => {
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

  void it('should correctly handle ordering when expectations are nested', () => {
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

  void it('should allow you to mix and match call types', () => {
    b.shouldBeCalled()
      .andAlso(c.shouldBeCalledWith(1, 2, 3))
      .andThen(c.shouldBeCalledWith(1).andWillReturn(4))
      .when(() => {
        b();
        c(1, 2, 3);
        assert.strictEqual(c(1), 4);
      });
  });

  void it('should maintain independent expectations', () => {
    a.shouldBeCalled();

    a.shouldBeCalled().when(() => {
      a();
    });
  });

  void it('should allow soft expectations to be called', () => {
    a.mayBeCalled().when(() => {
      a();
    });
  });

  void it('should allow soft expectations to be omitted', () => {
    a.mayBeCalled().when(() => {});
  });

  void it('should allow soft expectations with return values', () => {
    a.mayBeCalled().andWillReturn(3).when(() => {
      assert.strictEqual(a(), 3);
    });
  });

  void it('should allow soft expectations with arguments to be called', () => {
    a.mayBeCalledWith(4).when(() => {
      a(4);
    });

    a.mayBeCalledWith(4).when(() => {
      a(4);
    });
  });

  void it('should fail if mayBeCalled is used after a call has already been specified', () => {
    assert.throws(() => {
      a.shouldBeCalled().mayBeCalled();
    }, /.*/);
  });

  void it('should fail if mayBeCalledWith is used after a call has already been specified', () => {
    assert.throws(() => {
      a.shouldBeCalled().mayBeCalledWith(4);
    }, /.*/);
  });

  void it('should handle object arguments in error messages', () => {
    let o = {};

    assert.throws(() => {
      a(o);
    }, /.*/);
  });

  void it('should allow a strictly ordered call to occur after a missing optional call', () => {
    b.mayBeCalled().andThen(c.shouldBeCalled()).when(() => {
      c();
    });
  });

  void it('should not allow order to be violated for an optional call', () => {
    assert.throws(() => {
      b.mayBeCalled().andThen(c.shouldBeCalled()).when(() => {
        c();
        b();
      });
    }, /Unexpected function call b\(\)/);
  });

  void it('should indicate expectation status in unexpected call failures', () => {
    assert.throws(() => {
      b.shouldBeCalled().andThen(c.shouldBeCalled()).when(() => {
        b();
        b();
      });
    }, /Unexpected function call b\(\)\nCompleted calls:\n\tb\(\)\nIncomplete calls:\n\tc\(\)/);
  });

  void it('should indicate expectation status in unexpected arguments failures', () => {
    assert.throws(() => {
      b.shouldBeCalled().andThen(c.shouldBeCalled()).when(() => {
        b();
        c(1);
      });
    }, /Unexpected arguments \(1\) provided to function c\nCompleted calls:\n\tb\(\)\nIncomplete calls:\n\tc\(\)/);
  });

  void it('should indicate expectation status in out of order call failures', () => {
    assert.throws(() => {
      b.shouldBeCalled()
        .andThen(c.shouldBeCalled())
        .andThen(b.shouldBeCalled())
        .when(() => {
          b();
          b();
        });
    }, /Out of order function call b\(\)\nCompleted calls:\n\tb\(\)\nIncomplete calls:\n\tc\(\)\n\tb\(\)/);
  });

  void it('should indicate expectation status when not all calls occur', () => {
    assert.throws(() => {
      a.shouldBeCalled().andThen(b.shouldBeCalled()).when(() => {
        a();
      });
    }, /Not all calls occurred\nCompleted calls:\n\ta\(\)\nIncomplete calls:\n\tb\(\)/);
  });

  void it('should omit the completed call listing when there are no completed calls', () => {
    assert.throws(() => {
      a.shouldBeCalled().when(() => {
        b();
      });
    }, /Unexpected function call b\(\)\nIncomplete calls:\n\ta\(\)/);
  });

  void it('should omit the incomplete call listing when there are no incomplete calls', () => {
    assert.throws(() => {
      b.shouldBeCalled().when(() => {
        b();
        c();
      });
    }, /Unexpected function call c\(\)\nCompleted calls:\n\tb\(\)/);
  });

  void it('should indicate when any args are allowed in call listing', () => {
    assert.throws(() => {
      b.shouldBeCalledWithAnyArguments().multipleTimes(2).when(() => {
        b(1, 2, 3);
        c();
      });
    }, /Unexpected function call c\(\)\nCompleted calls:\n\tb\(1, 2, 3\)\nIncomplete calls:\n\tb\(<any>\)/);
  });

  void it('should show anonymous mocks in call listings', () => {
    let mock = mach.mockFunction();

    assert.throws(() => {
      mock.shouldBeCalled().when(() => {});
    }, /Not all calls occurred\nIncomplete calls:\n\t<anonymous>\(\)/);
  });

  void it('should show methods mocked on anonymous objects in call listings', () => {
    let mockedObject = mach.mockObject({
      f: () => {}
    });

    assert.throws(() => {
      mockedObject.f.shouldBeCalled().when(() => {});
    }, /Not all calls occurred\nIncomplete calls:\n\t<anonymous>.f\(\)/);
  });

  void it('should print arrays in calls properly', () => {
    assert.throws(() => {
      a([1, '2', 3]);
    }, /Unexpected function call a\(\[1, '2', 3\]\)/);
  });

  void it('should print nested arrays in calls properly', () => {
    assert.throws(() => {
      a([1, [2, '3'], '4']);
    }, /Unexpected function call a\(\[1, \[2, '3'\], '4'\]\)/);
  });

  void it('should print undefined in calls properly', () => {
    assert.throws(() => {
      a(undefined);
    }, /Unexpected function call a\(undefined\)/);
  });

  void it('should print null in calls properly', () => {
    assert.throws(() => {
      a(null);
    }, /Unexpected function call a\(null\)/);
  });

  void it('should actually check for sameness', () => {
    assert.throws(() => {
      a.shouldBeCalledWith(mach.same([1, 2, 3])).when(() => {
        a([3, 2, 1]);
      });
    }, /.*/);
  });

  void it('should allow some arguments to be checked for sameness and some for equality', () => {
    assert.throws(() => {
      a.shouldBeCalledWith(mach.same([1, 2, 3]), [4, 5, 6]).when(() => {
        a([1, 2, 3], [4, 5, 6]);
      });
    }, /.*/);

    a.shouldBeCalledWith(mach.same([1, 2, 3]), 7).when(() => {
      a([1, 2, 3], 7);
    });
  });

  void it('should actually check for sameness when nothing is called', () => {
    assert.throws(() => {
      a.shouldBeCalledWith(mach.same([1, 2, 3])).when(() => {});
    }, /Incomplete calls:\n\ta\(\[1, 2, 3\]\)/);
  });

  void it('should allow custom matchers to be used with mach.same', () => {
    let alwaysMatches = () => {
      return true;
    };

    let neverMatches = () => {
      return false;
    };

    a.shouldBeCalledWith(mach.same([1, 2, 3], alwaysMatches)).when(() => {
      a([3, 2, 1]);
    });

    assert.throws(() => {
      a.shouldBeCalledWith(mach.same([1, 2, 3], neverMatches)).when(() => {
        a([1, 2, 3]);
      });
    }, /.*/);
  });

  void it('should allow mach.match to be used as an alias for mach.same', () => {
    a.shouldBeCalledWith(mach.match([1, 2, 3])).when(() => {
      a([1, 2, 3]);
    });
  });

  void it('should allow additional mocked calls to be ignored', () => {
    b.shouldBeCalled().andOtherCallsShouldBeIgnored().when(() => {
      b();
      c();
    });

    b.shouldBeCalled().withOtherCallsIgnored().when(() => {
      b();
      c();
    });
  });

  void it('should allow mocked calls to be ignored', () => {
    let x;

    mach.ignoreMockedCallsWhen(() => {
      a();
      x = 4;
    });

    assert.strictEqual(x, 4);
  });

  void it('should allow mocked calls to be ignored asynchronously', async () => {
    let x;

    await mach.ignoreMockedCallsWhen(() => new Promise((resolve) => {
      process.nextTick(a);
      process.nextTick(() => x = 4);
      process.nextTick(resolve);
    }));

    assert.strictEqual(x, 4);
  });

  void it('should fail when a function is called unexpectedly after calls are ignored', () => {
    mach.ignoreMockedCallsWhen(() => {
      a();
    });

    assert.throws(() => {
      a();
    }, /Unexpected function call a\(\)/);
  });

  void describe('callback expectations', () => {
    void it('should allow an expectation to have a callback', async () => {
      await a.shouldBeCalledWith(mach.callback).andWillCallback()
        .and(b.shouldBeCalled())
        .when(() => new Promise((resolve) => {
          a(() => {
            b();
            resolve(1);
          });
        }));
    });

    void it('should allow an expectation to have a callback with arguments', async () => {
      await a.shouldBeCalledWith(mach.callback).andWillCallback(0, 1, 2)
        .and(b.shouldBeCalledWith(0, 1, 2))
        .when(() => new Promise((resolve) => {
          a((...args) => {
            b(...args);
            resolve(1);
          });
        }));
    });

    void it('should allow mixing callbacks and regular arguments', async () => {
      await a.shouldBeCalledWith(1, mach.callback).andWillCallback()
        .and(b.shouldBeCalled())
        .when(() => new Promise((resolve) => {
          a(1, () => {
            b();
            resolve(1);
          });
        }));
    });

    void it('should throw a mach error when callback expected argument is not specified', () => {
      assert.throws(() => {
        a.shouldBeCalledWith().andWillCallback()
          .when(() => {
            a(() => {});
          });
      }, /expectation has no arguments to callback/);
    });

    void it('should throw a mach error when callback and return value are specified', () => {
      assert.throws(() => {
        a.shouldBeCalledWith(mach.callback).andWillCallback().andWillReturn(0)
          .when(() => {
            a(() => {});
          });
      }, /expectation cannot have return value and callback/);
    });

    void it('should throw a mach error if no callback is passed in at runtime', () => {
      assert.throws(() => {
        a.shouldBeCalledWith(mach.callback).andWillCallback()
          .when(() => {
            a(0);
          });
      }, /Unexpected arguments \(0\) provided to function a/);
    });

    void it('should throw a mach error if callback passed in incorrectly at runtime', () => {
      assert.throws(() => {
        a.shouldBeCalledWith(mach.callback).andWillCallback()
          .when(() => {
            a(0, () => {});
          });
      }, /Unexpected arguments .* provided to function a/);
    });
  });

  void describe('async tests', () => {
    void it('should rethrow errors from before callback in thunks', async () => {
      await assert.rejects(async () => {
        await a.shouldBeCalled()
          .when(async () => {
            throw new Error('Derp');
            a();
          });
      }, /Derp/);
    });

    void it('should rethrow mach errors from callback thunks', async () => {
      await assert.rejects(async () => {
        await a.shouldBeCalled()
          .when(() => Promise.resolve());
      }, /Not all calls occurred/);
    });
  });

  void it('should allow promises in thunks', async () => {
    await a.shouldBeCalled()
      .when(() => Promise.resolve(a()));
  });

  void it('should return values from promises', async () => {
    await a.shouldBeCalled().andWillReturn(1)
      .when(() => Promise.resolve(a()))
      .catch((error) => {
        fail(error);
      })
      .then((value) => {
        assert.strictEqual(value, 1);
      });
  });

  void it('should rethrow errors from code in promises', async () => {
    await assert.rejects(async () => {
      await a.shouldBeCalled()
        .when(() => Promise.reject('Ope'));
    }, /Ope/);
  });

  void it('should rethrow mach errors from promises', async () => {
    await assert.rejects(async () => {
      await a.shouldBeCalled()
        .when(() => Promise.resolve());
    }, /Not all calls occurred/);
  });
});
