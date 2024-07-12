# [mach.js](https://github.com/ryanplusplus/mach.js)
Simple mocking framework for JavaScript inspired by CppUMock and designed for readability

## Mocking a Function

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

f.shouldBeCalled().when(function() {
  f();
});
```

## Naming a Mocked Function

```javascript
const mach = require('mach.js');

// Mocked function is now given as 'f' in error messages
const f = mach.mockFunction('f');
```

## Mocking an Object

```javascript
const mach = require('mach.js');

const someObject = {
  foo: function() {},
  bar: function() {}
};

mockedObject = mach.mockObject(someObject);

mockedObject.foo.shouldBeCalled().when(function() {
  mockedObject.foo();
});
```

## Naming a Mocked Object

```javascript
const mach = require('mach.js');

const someObject = {
  foo: function() {},
  bar: function() {}
};

// Mocked fields are now given as 'someObject.foo' and 'someObject.bar' in error messages
mockedObject = mach.mockObject(someObject, 'someObject');
```

## Requiring Arguments

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

f.shouldBeCalledWith(1, 2).when(function() {
  f(1, 2);
});
```

## Ignoring Single Arguments

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

f.shouldBeCalledWith(1, mach.any, 3).when(function() {
  f(1, 'whatever', 3);
});
```

## Ignoring All Arguments

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

f.shouldBeCalledWithAnyArguments().when(function() {
  f(1, 2);
});
```

## Ignoring Other Calls

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

f.shouldBeCalled().andOtherCallsShouldBeIgnored().when(function() {
  f();
  f(1);
});
```

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

f.shouldBeCalled().withOtherCallsIgnored().when(function() {
  f();
  f(1);
});
```

## Returning Values

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

f.shouldBeCalled().andWillReturn(4).when(function() {
  expect(f()).toBe(4);
});
```

## Throwing Values

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

f.shouldBeCalled().andWillThrow(Error('error')).when(function() {
  try {
    f();
  }
  catch(e) {
    console.log(e.message);
  }
});
```

## Requiring Multiple Calls

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

f.shouldBeCalledWith(2).andWillReturn(1).multipleTimes(3).when(() => {
  f(2);
  f(2);
  f(2);
});
```

## Making Multiple Expectations

```javascript
const mach = require('mach.js');

const f1 = mach.mockFunction();
const f2 = mach.mockFunction();

f1.shouldBeCalled()
  .andAlso(f2.shouldBeCalled())
  .when(function() {
    f1();
    f2();
  });
```

## Making Optional Expectations

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

f.mayBeCalled().when(function() {});
```

## Using Optional Ordering

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

// Use andThen or then when order is important
f.shouldBeCalledWith(1)
  .andThen(f.shouldBeCalledWith(2))
  .when(function() {
    f(2); // Error, out of order call
    f(1);
  });

f.shouldBeCalledWith(1)
  .then(f.shouldBeCalledWith(2))
  .when(function() {
    f(2); // Error, out of order call
    f(1);
  });

// Use andAlso or and when order is unimportant
f.shouldBeCalledWith(1)
  .andAlso(f.shouldBeCalledWith(2))
  .when(function() {
    f(2); // No error, order is not fixed when 'andAlso' is used
    f(1);
  });

f.shouldBeCalledWith(1)
  .and(f.shouldBeCalledWith(2))
  .when(function() {
    f(2); // No error, order is not fixed when 'and' is used
    f(1);
  });
```

## Using Mixed Ordering

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

f.shouldBeCalledWith(1)
  .and(f.shouldBeCalledWith(2))
  .then(f.shouldBeCalledWith(3))
  .and(f.shouldBeCalledWith(4))
  .when(function() {
    f(2);
    f(1);
    f(4);
    f(3);
  });
```

## Matching Arguments Using Deep Compare

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

// mach.match can also be used
f.shouldBeCalledWith(mach.same([1, 2, 3]))
  .when(function() {
    f([1, 2, 3]);
  });
```

## Matching Arguments Using a Custom Matcher

```javascript
const mach = require('mach.js');

const customMatcher = function(a, b) {
  return a[0] === b[0]
};

const f = mach.mockFunction();

f.shouldBeCalledWith(mach.same([1, 2, 3], customMatcher))
  .when(function() {
    f([1, 4, 9]);
  });
```

## Ignoring Mocked Calls

```javascript
const mach = require('mach.js');

const f = mach.mockFunction();

mach.ignoreMockedCallsWhen(function() {
  f();
});
```

## Flexible Syntax

```javascript
const mach = require('mach.js');

const f1 = mach.mockFunction();
const f2 = mach.mockFunction();

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

// Actual test.
somethingShouldHappen()
  .and(anotherThingShouldHappen())
  .when(theCodeUnderTestRuns);
```

## Handy Error messages

```javascript
const mach = require('mach.js');

const f1 = mach.mockFunction('f1');
const f2 = mach.mockFunction('f2');
const f2 = mach.mockFunction('f3');

f1.shouldBeCalledWith(1)
  .and(f2.shouldBeCalledWith(2))
  .when(function() {
    f1(1);
    f3(3);
  });
```

```
Unexpected function call f(3)
Completed calls:
  f1(1)
Incomplete calls:
  f2(2)
```

## Testing asynchronous code

```javascript
describe('Foo', () => {
  const Foo = require('./Foo.js');

  let mockTemplate = {
    sync: () => {},
    callback: () => {},
    promise: () => {}
  }

  let foo;
  let mock;

  beforeEach() => {
    mock = mach.mockObject('mock', mockTemplate);
    foo = new Foo(mock);
  };

  it('should return a promise for callback code', (done) => {
    mock.callback.shouldBeCalled().when(() => {
      return new Promise((resolve) => {
        foo.bar(() => {
          resolve();
        });
      });
    }).catch((error) => {
      fail(error);
    }).then(() => {
      done();
    };
  });

  it('should return a promise for promise code', (done) => {
    mock.promise.shouldBeCalled().when(() => {
      return foo.baz().then((value) => {
        return value;
      });
    }).catch((error) => {
      fail(error);
    }).then((value) => {
      expect(value).toEqual(something); // value will be return value of foo.baz();
      done();
    });
  });
});
```
