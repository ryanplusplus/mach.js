'use strict';

describe('TerminusNode', () => {
  let TerminusNode = require('../../src/Tree/TerminusNode.js');

  it('should be named TERMINUS', () => {
    expect(new TerminusNode().name).toEqual('TERMINUS');
  });
});
