'use strict';

describe('Tree', () => {
  let Tree = require('../../src/Tree/Tree.js');

  it('should have a root and a terminus after initialization', () => {
    expect(new Tree().toString()).toEqual('{ ROOT [{ TERMINUS }] }');
  });

  it('then should add a new ExpectedCallNode', () => {
    let expectation = {
      _expectedCalls: {
        last: () => {
          return {
            name: 'foo'
          };
        }
      }
    };

    let tree = new Tree();

    tree.then(expectation);

    expect(tree.toString()).toEqual('{ ROOT [{ foo [{ TERMINUS }] }] }');

    tree.then(expectation);

    expect(tree.toString()).toEqual('{ ROOT [{ foo [{ foo [{ TERMINUS }] }] }] }');
  });

  it('and should add a new ExpectedCallNode', () => {
    let foo = {
      _expectedCalls: {
        last: () => {
          return {
            name: 'foo'
          };
        }
      }
    };

    let bar = {
      _expectedCalls: {
        last: () => {
          return {
            name: 'bar'
          };
        }
      }
    };

    let baz = {
      _expectedCalls: {
        last: () => {
          return {
            name: 'baz'
          };
        }
      }
    };

    let tree = new Tree();

    tree.then(foo);

    expect(tree.toString()).toEqual('{ ROOT [{ foo [{ TERMINUS }] }] }');

    tree.and(bar);

    expect(tree.toString()).toEqual('{ ROOT [{ ROOT [{ foo [{ bar [{ TERMINUS [{ TERMINUS }] }] }] }, { bar [{ foo [{ TERMINUS [{ TERMINUS }] }] }] }] }] }');

    tree.and(baz);

    expect(tree.toString()).toEqual('{ ROOT [{ ROOT [{ foo [{ bar [{ baz [{ TERMINUS [{ TERMINUS }] }] }] }, { baz [{ bar [{ TERMINUS [{ TERMINUS }] }] }] }] }, { bar [{ foo [{ baz [{ TERMINUS [{ TERMINUS }] }] }] }, { baz [{ foo [{ TERMINUS [{ TERMINUS }] }] }] }] }, { baz [{ foo [{ bar [{ TERMINUS [{ TERMINUS }] }] }] }, { bar [{ foo [{ TERMINUS [{ TERMINUS }] }] }] }] }] }] }');
  });
});
