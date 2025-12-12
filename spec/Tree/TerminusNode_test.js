'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');

void describe('TerminusNode', () => {
  let TerminusNode = require('../../src/Tree/TerminusNode.js');

  void it('should be named TERMINUS', () => {
    assert.strictEqual(new TerminusNode().name, 'TERMINUS');
  });
});
