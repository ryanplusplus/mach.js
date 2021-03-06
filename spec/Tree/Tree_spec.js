'use strict';

describe('Tree', () => {
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

  it('should have a node when initialized', () => {
    let node = new ExpectedCallNode({
      name: 'foo'
    });

    let tree = new Tree(node);

    expect(tree._root.child)
      .toEqual(node);
    expect(node.child instanceof TerminusNode)
      .toBe(true);
  });

  describe('tree building', () => {
    describe('and', () => {
      it('ExpectedCallNode + ExpectedCallNode => Root -> AndNode -> Terminus', () => {
        let a = new ExpectedCallNode({
          name: 'a'
        });

        let b = new ExpectedCallNode({
          name: 'b'
        });

        let tree = new Tree(a);

        tree.and(new Tree(b));

        expect(tree.toString())
          .toEqual('{ ROOT [{ AND {{ a, b }} [{ TERMINUS }] }] }');
      });

      it('ExpectedCallNode + AndNode => Root -> AndNode -> Terminus', () => {
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

        expect(tree.toString())
          .toEqual('{ ROOT [{ AND {{ a, b, c }} [{ TERMINUS }] }] }');
      });

      it('AndNode + ExpectedCallNode => Root -> AndNode -> Terminus', () => {
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

        expect(tree.toString())
          .toEqual('{ ROOT [{ AND {{ a, b, c }} [{ TERMINUS }] }] }');
      });

      it('AndNode + AndNode => Root -> AndNode -> Terminus', () => {
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

        expect(tree.toString())
          .toEqual('{ ROOT [{ AND {{ a, b, c, d }} [{ TERMINUS }] }] }');
      });

      it('should throw an error if current node is invalid type', () => {
        let a = new Node('a');

        let tree = new Tree(a);

        expect(() => tree.and(new Tree(new Node('b'))))
          .toThrowError('Unexpected type for this node, expected AndNode or ExpectedCallNode');
      });
    });

    describe('then', () => {
      it('ExpectedCallNode -> ExpectedCallNode => Root -> ExpectedCallNode -> ExpectedCallNode -> Terminus', () => {
        let a = new ExpectedCallNode({
          name: 'a'
        });

        let b = new ExpectedCallNode({
          name: 'b'
        });

        let tree = new Tree(a);

        tree.then(new Tree(b));

        expect(tree.toString())
          .toEqual('{ ROOT [{ a [{ b [{ TERMINUS }] }] }] }');
      });

      it('ExpectedCallNode -> AndNode => Root -> ExpectedCallNode -> AndNode -> Terminus', () => {
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

        expect(tree.toString())
          .toEqual('{ ROOT [{ a [{ AND {{ b, c }} [{ TERMINUS }] }] }] }');
      });

      it('AndNode -> ExpectedCallNode => Root -> AndNode -> ExpectedCallNode -> Terminus', () => {
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

        expect(tree.toString())
          .toEqual('{ ROOT [{ AND {{ a, b }} [{ c [{ TERMINUS }] }] }] }');
      });

      it('AndNode -> AndNode => Root -> AndNode -> AndNode -> Terminus', () => {
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

        expect(tree.toString())
          .toEqual('{ ROOT [{ AND {{ a, b }} [{ AND {{ c, d }} [{ TERMINUS }] }] }] }');
      });
    });
  });

  describe('completedCalls / incompleteCalls', () => {
    it('should return status of all expected calls', () => {
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

      expect(tree._calls.filter(c => c.completed).length)
        .toEqual(0);
      expect(tree._calls.filter(c => !c.completed).length)
        .toEqual(3);

      a.expectedCall.completed = true;

      expect(tree._calls.filter(c => c.completed).length)
        .toEqual(1);
      expect(tree._calls.filter(c => !c.completed).length)
        .toEqual(2);

      b.expectedCalls[0].completed = true;

      expect(tree._calls.filter(c => c.completed).length)
        .toEqual(2);
      expect(tree._calls.filter(c => !c.completed).length)
        .toEqual(1);

      b.expectedCalls[1].completed = true;

      expect(tree._calls.filter(c => c.completed).length)
        .toEqual(3);
      expect(tree._calls.filter(c => !c.completed).length)
        .toEqual(0);
    });

    it('should throw an error if there is an invalid node type', () => {
      let a = new Node('node');

      let tree = new Tree(a);

      let error = 'Unexpected type for node, expected AndNode or ExpectedCallNode';
      expect(() => tree._calls.filter(c => c.completed))
        .toThrowError(error);
      expect(() => tree._calls.filter(c => !c.completed))
        .toThrowError(error);
    });
  });

  it('_checkCalls -> NotAllCallsOccurredError when appropriate', () => {
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

    expect(() => tree._checkCalls())
      .toThrowError(NotAllCallsOccurredError);

    a.expectedCall.completed = true;
    a.expectedCall.actualArgs = [];

    expect(() => tree._checkCalls())
      .toThrowError(NotAllCallsOccurredError);

    b.expectedCalls[0].completed = true;
    b.expectedCalls[0].actualArgs = [];

    expect(() => tree._checkCalls())
      .not.toThrowError(NotAllCallsOccurredError);

    b.expectedCalls[1].completed = true;
    b.expectedCalls[1].actualArgs = [];

    expect(() => tree._checkCalls())
      .not.toThrowError(NotAllCallsOccurredError);
  });

  describe('execute', () => {
    describe('ExpectedCallNode tests', () => {
      it('should throw an error for an unexpected call', () => {
        let a = new Mock('a');
        let b = new Mock('b');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

        expect(() => {
            tree.execute(() => {
              b();
            });
          })
          .toThrowError(OutOfOrderCallError);

        expect(() => {
            tree.execute(() => {
              a();
              a();
            });
          })
          .toThrowError(UnexpectedFunctionCallError);
      });

      it('should not throw an error for an expected call', () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        expect(() => {
            tree.execute(() => {
              a();
            });
          })
          .not.toThrowError(UnexpectedFunctionCallError);

        tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

        expect(() => {
            tree.execute(() => {
              a();
              b();
            });
          })
          .not.toThrowError(UnexpectedFunctionCallError);
      });

      it('should throw an error for an incomplete call', () => {
        let a = new Mock('a');
        let b = new Mock('b');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

        expect(() => {
            tree.execute(() => {
              a();
            });
          })
          .toThrowError(NotAllCallsOccurredError);
      });

      it('should not throw an error for an optional incomplete call', () => {
        let a = new Mock('a');
        let b = new Mock('b');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], false, true))));

        expect(() => {
            tree.execute(() => {
              a();
            });
          })
          .not.toThrowError(NotAllCallsOccurredError);

        tree = new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], false, true)));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true))));

        expect(() => {
            tree.execute(() => {
              a();
            });
          })
          .not.toThrowError(NotAllCallsOccurredError);
      });

      it('should throw an error for invalid arguments', () => {
        let a = new Mock('a');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        expect(() => {
            tree.execute(() => {
              a(0);
            });
          })
          .toThrowError(UnexpectedArgumentsError);
      });

      it('should throw an error if the expected call is set up to do so', () => {
        let a = new Mock('a');
        let expectedCall = new ExpectedCall(a._class, [], true, true);

        let msg = 'error';
        expectedCall.throwValue = new Error(msg);

        let tree = new Tree(new ExpectedCallNode(expectedCall));

        let actualError;

        tree.execute(() => {
          try {
            a();
          }
          catch(error) {
            actualError = error;
          }
        });

        expect(actualError.message)
          .toEqual(msg);
      });

      it('should invoke a callback if the expected call is set up to do so', (done) => {
        let a = new Mock('a');
        let expectedCall = new ExpectedCall(a._class, [new Callback()], true, false);
        expectedCall.callbackIndex = 0;
        expectedCall.callbackArgs = [1];

        let tree = new Tree(new ExpectedCallNode(expectedCall));

        new Promise((resolve) => {
            tree.execute(() => {
              a((value) => {
                resolve(value);
              });
            });
          })
          .catch(fail)
          .then((value) => {
            expect(value).toEqual(1);
            done();
          });
      });

      it('should return a value if the expected call is set up to do so', () => {
        let a = new Mock('a');
        let expectedCall = new ExpectedCall(a._class, [], true, false);

        expectedCall.returnValue = 0;

        let tree = new Tree(new ExpectedCallNode(expectedCall));

        let actualReturnValue;
        tree.execute(() => {
          actualReturnValue = a();
        });

        expect(actualReturnValue)
          .toEqual(expectedCall.returnValue);
      });

      describe('_ignoreOtherCalls = true', () => {
        it('should not throw an error for an unexpected call', () => {
          let a = new Mock('a');
          let b = new Mock('b');
          let c = new Mock('c');

          let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

          tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

          tree._ignoreOtherCalls = true;

          expect(() => {
              tree.execute(() => {
                a();
                c();
                b();
              });
            })
            .not.toThrow(UnexpectedFunctionCallError);
        });

        it('should not throw an error for a partial match', () => {
          let a = new Mock('a');
          let b = new Mock('b');
          let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

          tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

          tree._ignoreOtherCalls = true;

          expect(() => {
              tree.execute(() => {
                a(1);
                a();
                b();
              });
            })
            .not.toThrow(UnexpectedArgumentsError);
        });
      });
    });

    describe('AndNode tests', () => {
      it('should throw an error for an unexpected call', () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let c = new Mock('c');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true)));
        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(c._class, [], true, true))));

        let t = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));
        t.and(tree);

        tree = t;

        expect(() => {
            tree.execute(() => {
              c();
            });
          })
          .toThrowError(OutOfOrderCallError);

        expect(() => {
            tree.execute(() => {
              a();
              a();
            });
          })
          .toThrowError(UnexpectedFunctionCallError);
      });

      it('should not throw an error for an expected call', () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        expect(() => {
            tree.execute(() => {
              a();
            });
          })
          .not.toThrowError(UnexpectedFunctionCallError);

        tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

        expect(() => {
            tree.execute(() => {
              a();
              b();
            });
          })
          .not.toThrowError(UnexpectedFunctionCallError);
      });

      it('should throw an error for an incomplete call', () => {
        let a = new Mock('a');
        let b = new Mock('b');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

        expect(() => {
            tree.execute(() => {
              a();
            });
          })
          .toThrowError(NotAllCallsOccurredError);
      });

      it('should not throw an error for an optional incomplete call', () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let c = new Mock('c');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));
        tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(c._class, [], false, true))));

        expect(() => {
            tree.execute(() => {
              a();
              b();
            });
          })
          .not.toThrowError(NotAllCallsOccurredError);

        tree = new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true)));
        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(c._class, [], false, true))));

        let t = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));
        t.and(tree);

        tree = t;

        expect(() => {
            tree.execute(() => {
              a();
              b();
            });
          })
          .not.toThrowError(NotAllCallsOccurredError);

        tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], false, true)));
        tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], false, true))));

        tree.then(new Tree(new ExpectedCallNode(new ExpectedCall(c._class, [], true, true))));

        expect(() => {
            tree.execute(() => {
              c();
            });
          })
          .not.toThrowError(NotAllCallsOccurredError);
      });

      it('should throw an error for invalid arguments', () => {
        let a = new Mock('a');
        let b = new Mock('b');

        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], false, true))));

        expect(() => {
            tree.execute(() => {
              a(0);
            });
          })
          .toThrowError(UnexpectedArgumentsError);
      });

      it('should throw an error if the expected call is set up to do so', () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let expectedCall = new ExpectedCall(a._class, [], true, true);

        let msg = 'error';
        expectedCall.throwValue = new Error(msg);

        let tree = new Tree(new ExpectedCallNode(expectedCall));
        tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], false, true))));

        let actualError;

        tree.execute(() => {
          try {
            a();
          }
          catch(error) {
            actualError = error;
          }
        });

        expect(actualError.message)
          .toEqual(msg);
      });

      it('should invoke a callback if the expected call is set up to do so', (done) => {
        let a = new Mock('a');
        let b = new Mock('b');

        let expectedCallA = new ExpectedCall(a._class, [], true, false);
        expectedCallA.returnValue = 1;

        let expectedCallB = new ExpectedCall(b._class, [new Callback()], false, true);
        expectedCallB.callbackIndex = 0;
        expectedCallB.callbackArgs = [1];

        let tree = new Tree(new ExpectedCallNode(expectedCallB));
        tree.then(new Tree(new ExpectedCallNode(expectedCallA)));

        new Promise((resolve) => {
            tree.execute(() => {
                return new Promise((r) => {
                  b((value) => {
                    r(a() + value);
                  });
                });
              })
              .then(resolve);
          })
          .catch(fail)
          .then((value) => {
            expect(value).toEqual(2);
            done();
          });
      });

      it('should return a value if the expected call is set up to do so', () => {
        let a = new Mock('a');
        let expectedCall = new ExpectedCall(a._class, [], true, false);

        expectedCall.returnValue = 0;

        let tree = new Tree(new ExpectedCallNode(expectedCall));

        let actualReturnValue;
        tree.execute(() => {
          actualReturnValue = a();
        });

        expect(actualReturnValue)
          .toEqual(expectedCall.returnValue);
      });

      describe('_ignoreOtherCalls = true', () => {
        it('should not throw an error for an unexpected call', () => {
          let a = new Mock('a');
          let b = new Mock('b');
          let c = new Mock('c');

          let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

          tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

          tree._ignoreOtherCalls = true;

          expect(() => {
              tree.execute(() => {
                a();
                c();
                b();
              });
            })
            .not.toThrow(UnexpectedFunctionCallError);
        });

        it('should not throw an error for a partial match', () => {
          let a = new Mock('a');
          let b = new Mock('b');
          let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

          tree.and(new Tree(new ExpectedCallNode(new ExpectedCall(b._class, [], true, true))));

          tree._ignoreOtherCalls = true;

          expect(() => {
              tree.execute(() => {
                a(1);
                a();
                b();
              });
            })
            .not.toThrow(UnexpectedArgumentsError);
        });
      });
    });

    describe('TerminusNode tests', () => {
      it('should throw an error for an unexpected call', () => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        expect(() => {
            tree.execute(() => {
              a();
              a();
            });
          })
          .toThrowError(UnexpectedFunctionCallError);
      });

      it('should not throw an error if _ignoreOtherCalls is true', () => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree._ignoreOtherCalls = true;

        expect(() => {
            tree.execute(() => {
              a();
              a();
            });
          })
          .not.toThrowError(UnexpectedFunctionCallError);
      });
    });

    describe('errors', () => {
      it('should throw an error if the thunk throws an exception', () => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        expect(() => {
            tree.execute(() => {
              a();
              throw new Error('expected error');
            });
          })
          .toThrowError(Error, 'expected error');
      });

      it('should return an error if the callback thunk throws an exception', (done) => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.execute(() => {
          return new Promise((resolve) => {
              let cb = (callback) => {
                a();

                throw new Error('expected error');
                callback(); // jshint ignore:line
              };

              cb(() => resolve());
            })
            .catch((error) => {
              expect(error.message)
                .toEqual('expected error');
              done();
            });
        });
      });

      it('should return an error if the promise thunk throws an exception', (done) => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.execute(() => {
            return new Promise(() => {
                throw new Error('expected error');
              })
              .catch((error) => {
                throw error;
              });
          }).then(() => {
            done();
          })
          .catch((error) => {
            expect(error.message)
              .toEqual('expected error');
            done();
          });
      });

      it('should throw the mach error for sync code', () => {
        let a = new Mock('a');
        let b = new Mock('b');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        expect(() => {
          tree.execute(() => {
            b();
          });
        }).toThrowError(UnexpectedFunctionCallError);
      });

      it('should throw the mach error for callback code', (done) => {
        let a = new Mock('a');
        let b = new Mock('b');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.execute(() => {
          return new Promise((resolve) => {
            let f = ((callback) => {
              b();
              callback();
            });

            f(() => {
              resolve();
            });
          });
        }).catch((error) => {
          expect(error instanceof UnexpectedFunctionCallError).toBe(true);
          done();
        });
      });

      it('should throw the mach error for promise code', (done) => {
        let a = new Mock('a');
        let b = new Mock('b');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.execute(() => {
          return new Promise((resolve) => {
            b();
            resolve();
          });
        }).catch((error) => {
          expect(error instanceof UnexpectedFunctionCallError).toBe(true);
          done();
        });
      });
    });

    describe('Async tests', () => {
      it('should return a promise', (done) => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        let p = tree.execute(() => {
          return new Promise((resolve) => {
            a();
            resolve();
          });
        });

        expect(p instanceof Promise)
          .toBe(true);

        p.then(() => done());
      });

      it('should provide access to the return value of a promise', (done) => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));
        let answer = 42;

        tree.execute(() => {
          return new Promise((resolve) => {
            a();
            resolve(answer);
          });
        }).then((v) => {
          expect(v).toEqual(answer);
          done();
        });
      });

      it('should allow callbacks', (done) => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));

        tree.execute(() => {
            return new Promise((resolve) => {
              let cb = (callback) => {
                a();
                callback();
              };

              cb(() => resolve());
            });
          })
          .then(() => done());
      });

      it('should provide access to the return value of a callback', (done) => {
        let a = new Mock('a');
        let tree = new Tree(new ExpectedCallNode(new ExpectedCall(a._class, [], true, true)));
        let answer = 42;

        tree.execute(() => {
            return new Promise((resolve) => {
              let cb = (callback) => {
                a();
                callback();
              };

              cb(() => resolve(answer));
            });
          })
          .then((v) => {
            expect(v).toEqual(answer);
            done();
          });
      });
    });
  });
});
