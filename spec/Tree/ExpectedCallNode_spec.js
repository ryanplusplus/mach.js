'use strict';

describe('ExpectedCallNode', () => {
  let ExpectedCallNode = require('../../src/Tree/ExpectedCallNode.js');

  it('should be named after it\'s expected call', () => {
    expect(new ExpectedCallNode({
      name: 'foo'
    }).name).toEqual('foo');
  });
});
