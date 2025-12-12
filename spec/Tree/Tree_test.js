'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

void describe('Tree', () => {
  let Tree = require('../../src/Tree/Tree.js');
  let Node = require('../../src/Tree/Node.js');
  let TerminusNode = require('../../src/Tree/TerminusNode.js');
  let ExpectedCallNode = require('../../src/Tree/ExpectedCallNode.js');
  let AndNode = require('../../src/Tree/AndNode.js');
  let NotAllCallsOccurredError = require('../../src/Error/NotAllCallsOccurredError.js');
  let OutOfOrderCallError = require('../../src/Error/OutOfOrderCallError.js');
  let UnexpectedFunctionCallError = require('../../src/Error/UnexpectedFunctionCallError.js');
  let UnexpectedArgumentsError = require('../../src/Error/UnexpectedArgumentsError.js');
  let Mock = require('../../src/Mock.js');
  let ExpectedCall = require('../../src/ExpectedCall.js');
  let Callback = require('../../src/Callback.js');

  void it('should have a node when initialized', () => {
    let node = new ExpectedCallNode({
      name: 'foo'
    });

    let tree = new Tree(node);

    assert.strictEqual(tree._root.child, node);
    assert.ok(node.child instanceof TerminusNode);
  });

  void describe('tree building', () => {
    void describe('and', () => {
      void it('ExpectedCallNode + ExpectedCallNode => Root -> AndNode -> Terminus', () => {
        let a = new ExpectedCallNode({
          name: 'a'
        });

        let b = new ExpectedCallNode({
          name: 'b'
        });

        let tree = new Tree(a);

        tree.and(new Tree(b));

        assert.equal(tree.toString(), '{ ROOT [{ AND {{ a, b }} [{ TERMINUS }] }] }');
      });

      void it('ExpectedCallNode + AndNode => Root -> AndNode -> Terminus', () => {
        let a = new ExpectedCallNode({
          name: 'a'
        });

        let b = new AndNode({
          name: 'b'
        });

        b.merge(new AndNode({
          name: 'c'
        }));

        let tree = new Tree(a);

        tree.and(new Tree(b));

        assert.equal(tree.toString(), '{ ROOT [{ AND {{ a, b, c }} [{ TERMINUS }] }] }');
      });

      void it('AndNode + ExpectedCallNode => Root -> AndNode -> Terminus', () => {
        let a = new AndNode({
          name: 'a'
        });

        a.merge(new AndNode({
          name: 'b'
        }));

        let c = new ExpectedCallNode({
          name: 'c'
        });

        let tree = new Tree(a);

        tree.and(new Tree(c));

        assert.equal(tree.toString(), '{ ROOT [{ AND {{ a, b, c }} [{ TERMINUS }] }] }');
      });

      void it('AndNode + AndNode => Root -> AndNode -> Terminus', () => {
        let a = new AndNode({
          name: 'a'
        });

        a.merge(new AndNode({
          name: 'b'
        }));

        let c = new AndNode({
          name: 'c'
        });

        c.merge(new AndNode({
          name: 'd'
        }));

        let tree = new Tree(a);

        tree.and(new Tree(c));

        assert.equal(tree.toString(), '{ ROOT [{ AND {{ a, b, c, d }} [{ TERMINUS }] }] }');
      });

      void it('should throw an error if current node is invalid type', () => {
        let a = new Node('a');

        let tree = new Tree(a);

        assert.throws(
          () => tree.and(new Tree(new Node('b'))),
          /Unexpected type for this node, expected AndNode or ExpectedCallNode/
        );
      });
    });

    void describe('then', () => {
      void it('ExpectedCallNode -> ExpectedCallNode => Root -> ExpectedCallNode -> ExpectedCallNode -> Terminus', () => {
        let a = new ExpectedCallNode({
          name: 'a'
        });

        let b = new ExpectedCallNode({
          name: 'b'
        });

        let tree = new Tree(a);

        tree.then(new Tree(b));

        assert.equal(tree.toString(), '{ ROOT [{ a [{ b [{ TERMINUS }] }] }] }');
      });

      void it('ExpectedCallNode -> AndNode => Root -> ExpectedCallNode -> AndNode -> Terminus', () => {
        let a = new ExpectedCallNode({
          name: 'a'
        });

        let b = new AndNode({
          name: 'b'
        });

        b.merge(new AndNode({
          name: 'c'
        }));

        let tree = new Tree(a);

        tree.then(new Tree(b));

        assert.equal(tree.toString(), '{ ROOT [{ a [{ AND {{ b, c }} [{ TERMINUS }] }] }] }');
      });

      void it('AndNode -> ExpectedCallNode => Root -> AndNode -> ExpectedCallNode -> Terminus', () => {
        let a = new AndNode({
          name: 'a'
        });

        a.merge(new AndNode({
          name: 'b'
        }));

        let c = new ExpectedCallNode({
          name: 'c'
        });

        let tree = new Tree(a);

        tree.then(new Tree(c));

        assert.equal(tree.toString(), '{ ROOT [{ AND {{ a, b }} [{ c [{ TERMINUS }] }] }] }');
      });

      void it('AndNode -> AndNode => Root -> AndNode -> AndNode -> Terminus', () => {
        let a = new AndNode({
          name: 'a'
        });

        a.merge(new AndNode({
          name: 'b'
        }));

        let c = new AndNode({
          name: 'c'
        });

        c.merge(new AndNode({
          name: 'd'
        }));

        let tree = new Tree(a);

        tree.then(new Tree(c));

        assert.equal(tree.toString(), '{ ROOT [{ AND {{ a, b }} [{ AND {{ c, d }} [{ TERMINUS }] }] }] }');
      });
    });
  });

  void describe('completedCalls / incompleteCalls', () => {
    void it('should return status of all expected calls', () => {
      let a = new ExpectedCallNode({
        name: 'a',
        completed: false
      });

      let b = new AndNode({
        name: 'b',
        completed: false
      });

      b.merge(new AndNode({
        name: 'c',
        completed: false
      }));

      let tree = new Tree(a);

      tree.then(new Tree(b));

      assert.equal(tree._calls.filter(c => c.completed).length, 0);
      assert.equal(tree._calls.filter(c => !c.completed).length, 3);

      a.expectedCall.completed = true;

      assert.equal(tree._calls.filter(c => c.completed).length, 1);
      assert.equal(tree._calls.filter(c => !c.completed).length, 2);

      b.expectedCalls[0].completed = true;

      assert.equal(tree._calls.filter(c => c.completed).length, 2);
      assert.equal(tree._calls.filter(c => !c.completed).length, 1);

      b.expectedCalls[1].completed = true;

      assert.equal(tree._calls.filter(c => c.completed).length, 3);
      assert.equal(tree._calls.filter(c => !c.completed).length, 0);
    });

    void it('should throw an error if there is an invalid node type', () => {
      let a = new Node('node');

      let tree = new Tree(a);

      let error = 'Unexpected type for node, expected AndNode or ExpectedCallNode';
      assert.throws(() => {
        tree._calls.filter(c => c.completed);
      }, new RegExp(error));
      assert.throws(() => {
        tree._calls.filter(c => !c.completed);
      }, new RegExp(error));
    });
  });

  void it('_checkCalls -> NotAllCallsOccurredError when appropriate', () => {
    let a = new ExpectedCallNode({
      name: 'a',
      required: true,
      completed: false
    });

    let b = new AndNode({
      name: 'b',
      required: true,
      completed: false
    });

    b.merge(new AndNode({
      name: 'c',
      required: false,
      completed: false
    }));

    let tree = new Tree(a);

    tree.then(new Tree(b));

    assert.throws(() => tree._checkCalls(), NotAllCallsOccurredError);

    a.expectedCall.completed = true;
    a.expectedCall.actualArgs = [];

    assert.throws(() => tree._checkCalls(), NotAllCallsOccurredError);

    b.expectedCalls[0].completed = true;
    b.expectedCalls[0].actualArgs = [];

    assert.doesNotThrow(() => tree._checkCalls());

    b.expectedCalls[1].completed = true;
    b.expectedCalls[1].actualArgs = [];

    assert.doesNotThrow(() => tree._checkCalls());
  });

  void describe('execute', () => {
    void describe('ExpectedCallNode tests', () => {
      void it('should throw an error for an unexpected call', () => {
        let a = new Mock('a');
        let b = new Mock('b');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

        assert.throws(() => {
          void tree.execute(() => {
            b();
          });
        }, OutOfOrderCallError);

        assert.throws(() => {
          void tree.execute(() => {
            a();
            a();
          });
        }, UnexpectedFunctionCallError);
      });

      void it('should not throw an error for an expected call', () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        assert.doesNotThrow(() => {
          void tree.execute(() => {
            a();
          });
        });

        tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

        assert.doesNotThrow(() => {
          void tree.execute(() => {
            a();
            b();
          });
        });
      });

      void it('should throw an error for an incomplete call', () => {
        let a = new Mock('a');
        let b = new Mock('b');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

        assert.throws(() => {
          void tree.execute(() => {
            a();
          });
        }, NotAllCallsOccurredError);
      });

      void it('should not throw an error for an optional incomplete call', () => {
        let a = new Mock('a');
        let b = new Mock('b');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], false, true))));

        assert.doesNotThrow(() => {
          void tree.execute(() => {
            a();
          });
        });

        tree = new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], false, true)));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true))));

        assert.doesNotThrow(() => {
          void tree.execute(() => {
            a();
          });
        });
      });

      void it('should throw an error for invalid arguments', () => {
        let a = new Mock('a');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        assert.throws(() => {
          void tree.execute(() => {
            a(0);
          });
        }, UnexpectedArgumentsError);
      });

      void it('should throw an error if the expected call is set up to do so', () => {
        let a = new Mock('a');
        let expectedCall = new ExpectedCall(a._class, [], true, true);

        let msg = 'error';
        expectedCall.throwValue = new Error(msg);

        let tree = new Tree(new ExpectedCallNode(expectedCall));

        let actualError;

        void tree.execute(() => {
          try {
            a();
          }
          catch(error) {
            actualError = error;
          }
        });

        assert.equal(actualError.message, msg);
      });

      void it('should invoke a callback if the expected call is set up to do so', async () => {
        let a = new Mock('a');
        let expectedCall = new ExpectedCall(a._class, [new Callback()], true, false);
        expectedCall.callbackIndex = 0;
        expectedCall.callbackArgs = [1];

        let tree = new Tree(new ExpectedCallNode(expectedCall));

        const value = await new Promise((resolve) => {
          void tree.execute(() => {
            a((v) => {
              resolve(v);
            });
          });
        });

        assert.equal(value, 1);
      });

      void it('should return a value if the expected call is set up to do so', () => {
        let a = new Mock('a');
        let expectedCall = new ExpectedCall(a._class, [], true, false);

        expectedCall.returnValue = 0;

        let tree = new Tree(new ExpectedCallNode(expectedCall));

        let actualReturnValue;
        void tree.execute(() => {
          actualReturnValue = a();
        });

        assert.equal(actualReturnValue, expectedCall.returnValue);
      });

      void describe('_ignoreOtherCalls = true', () => {
        void it('should not throw an error for an unexpected call', () => {
          let a = new Mock('a');
          let b = new Mock('b');
          let c = new Mock('c');

          let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

          tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

          tree.ignoreOtherCalls();

          assert.doesNotThrow(() => {
            void tree.execute(() => {
              a();
              c();
              b();
            });
          });
        });

        void it('should not throw an error for a partial match', () => {
          let a = new Mock('a');
          let b = new Mock('b');
          let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

          tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

          tree.ignoreOtherCalls();

          assert.doesNotThrow(() => {
            void tree.execute(() => {
              a(1);
              a();
              b();
            });
          });
        });
      });
    });

    void describe('AndNode tests', () => {
      void it('should throw an error for an unexpected call', () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let c = new Mock('c');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true)));
        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(c._class, [], true, true))));

        let t = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));
        t.and(tree);

        tree = t;

        assert.throws(() => {
          void tree.execute(() => {
            c();
          });
        }, OutOfOrderCallError);

        assert.throws(() => {
          void tree.execute(() => {
            a();
            a();
          });
        }, UnexpectedFunctionCallError);
      });

      void it('should not throw an error for an expected call', () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        assert.doesNotThrow(() => {
          void tree.execute(() => {
            a();
          });
        });

        tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

        assert.doesNotThrow(() => {
          void tree.execute(() => {
            a();
            b();
          });
        });
      });

      void it('should throw an error for an incomplete call', () => {
        let a = new Mock('a');
        let b = new Mock('b');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

        assert.throws(() => {
          void tree.execute(() => {
            a();
          });
        }, NotAllCallsOccurredError);
      });

      void it('should not throw an error for an optional incomplete call', () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let c = new Mock('c');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));
        tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(c._class, [], false, true))));

        assert.doesNotThrow(() => {
          void tree.execute(() => {
            a();
            b();
          });
        });

        tree = new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true)));
        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(c._class, [], false, true))));

        let t = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));
        t.and(tree);

        tree = t;

        assert.doesNotThrow(() => {
          void tree.execute(() => {
            a();
            b();
          });
        });

        tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], false, true)));
        tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], false, true))));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(c._class, [], true, true))));

        assert.doesNotThrow(() => {
          void tree.execute(() => {
            c();
          });
        });
      });

      void it('should throw an error for invalid arguments', () => {
        let a = new Mock('a');
        let b = new Mock('b');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], false, true))));

        assert.throws(() => {
          void tree.execute(() => {
            a(0);
          });
        }, UnexpectedArgumentsError);
      });

      void it('should throw an error if the expected call is set up to do so', () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let expectedCall = new ExpectedCall(a._class, [], true, true);

        let msg = 'error';
        expectedCall.throwValue = new Error(msg);

        let tree = new Tree(new ExpectedCallNode(expectedCall));
        tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], false, true))));

        let actualError;

        void tree.execute(() => {
          try {
            a();
          }
          catch(error) {
            actualError = error;
          }
        });

        assert.equal(actualError.message, msg);
      });

      void it('should invoke a callback if the expected call is set up to do so', async () => {
        let a = new Mock('a');
        let b = new Mock('b');

        let expectedCallA = new ExpectedCall(a._class, [], true, false);
        expectedCallA.returnValue = 1;

        let expectedCallB = new ExpectedCall(b._class, [new Callback()], false, true);
        expectedCallB.callbackIndex = 0;
        expectedCallB.callbackArgs = [1];

        let tree = new Tree(new ExpectedCallNode(expectedCallB));
        tree.then(new Tree(new ExpectedCallNode(expectedCallA)));

        const value = await tree.execute(() => {
          return new Promise((r) => {
            b((value) => {
              r(a() + value);
            });
          });
        });

        assert.equal(value, 2);
      });

      void it('should return a value if the expected call is set up to do so', () => {
        let a = new Mock('a');
        let expectedCall = new ExpectedCall(a._class, [], true, false);

        expectedCall.returnValue = 0;

        let tree = new Tree(new ExpectedCallNode(expectedCall));

        let actualReturnValue;
        void tree.execute(() => {
          actualReturnValue = a();
        });

        assert.equal(actualReturnValue, expectedCall.returnValue);
      });

      void describe('_ignoreOtherCalls = true', () => {
        void it('should not throw an error for an unexpected call', () => {
          let a = new Mock('a');
          let b = new Mock('b');
          let c = new Mock('c');

          let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

          tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

          tree.ignoreOtherCalls();

          assert.doesNotThrow(() => {
            void tree.execute(() => {
              a();
              c();
              b();
            });
          });
        });

        void it('should not throw an error for a partial match', () => {
          let a = new Mock('a');
          let b = new Mock('b');
          let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

          tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

          tree.ignoreOtherCalls();

          assert.doesNotThrow(() => {
            void tree.execute(() => {
              a(1);
              a();
              b();
            });
          });
        });
      });
    });

    void describe('TerminusNode tests', () => {
      void it('should throw an error for an unexpected call', () => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        assert.throws(() => {
          void tree.execute(() => {
            a();
            a();
          });
        }, UnexpectedFunctionCallError);
      });

      void it('should not throw an error if _ignoreOtherCalls is true', () => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.ignoreOtherCalls();

        assert.doesNotThrow(() => {
          void tree.execute(() => {
            a();
            a();
          });
        });
      });
    });

    void describe('errors', () => {
      void it('should throw an error if the thunk throws an exception', () => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        assert.throws(() => {
          void tree.execute(() => {
            a();
            throw new Error('expected error');
          });
        }, (err) => err instanceof Error && err.message === 'expected error');
      });

      void it('should return an error if the callback thunk throws an exception', async () => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        try {
          await tree.execute(() => {
            return new Promise((resolve) => {
              let cb = (callback) => {
                a();
                throw new Error('expected error');
              };

              cb(() => resolve());
            });
          });
          assert.fail('Expected error to be thrown');
        } catch(error) {
          assert.equal(error.message, 'expected error');
        }
      });

      void it('should return an error if the promise thunk throws an exception', async () => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        try {
          await tree.execute(() => {
            return new Promise(() => {
              throw new Error('expected error');
            })
              .catch((error) => {
                throw error;
              });
          });
          assert.fail('Expected error to be thrown');
        } catch(error) {
          assert.equal(error.message, 'expected error');
        }
      });

      void it('should throw the mach error for sync code', () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        assert.throws(() => {
          void tree.execute(() => {
            b();
          });
        }, UnexpectedFunctionCallError);
      });

      void it('should throw the mach error for callback code', async () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        try {
          await tree.execute(() => {
            return new Promise((resolve) => {
              let f = ((callback) => {
                b();
                callback();
              });

              f(() => {
                resolve();
              });
            });
          });
          assert.fail('Expected error to be thrown');
        } catch(error) {
          assert.ok(error instanceof UnexpectedFunctionCallError);
        }
      });

      void it('should throw the mach error for promise code', async () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        try {
          await tree.execute(() => {
            return new Promise((resolve) => {
              b();
              resolve();
            });
          });
          assert.fail('Expected error to be thrown');
        } catch(error) {
          assert.ok(error instanceof UnexpectedFunctionCallError);
        }
      });
    });

    void describe('Async tests', () => {
      void it('should return a promise', async () => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        let p = tree.execute(() => {
          return new Promise((resolve) => {
            a();
            resolve();
          });
        });

        assert.ok(p instanceof Promise);

        await p;
      });

      void it('should provide access to the return value of a promise', async () => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));
        let answer = 42;

        const v = await tree.execute(() => {
          return new Promise((resolve) => {
            a();
            resolve(answer);
          });
        });

        assert.equal(v, answer);
      });

      void it('should allow callbacks', async () => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        await tree.execute(() => {
          return new Promise((resolve) => {
            let cb = (callback) => {
              a();
              callback();
            };

            cb(() => resolve());
          });
        });
      });

      void it('should provide access to the return value of a callback', async () => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));
        let answer = 42;

        const v = await tree.execute(() => {
          return new Promise((resolve) => {
            let cb = (callback) => {
              a();
              callback();
            };

            cb(() => resolve(answer));
          });
        });

        assert.equal(v, answer);
      });
    });
  });
});
