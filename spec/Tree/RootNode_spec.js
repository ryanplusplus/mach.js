'use strict';

describe('RootNode', () => {
  let RootNode = require('../../src/Tree/RootNode.js');

  it('should be named ROOT', () => {
    expect(new RootNode().name).toEqual('ROOT');
  });
});
