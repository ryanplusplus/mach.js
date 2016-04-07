'use strict';

describe('UnexpectedFunctionCallError', () => {
  let UnexpectedFunctionCallError = require('../../src/Error/UnexpectedFunctionCallError.js');

  it('should stringify correctly without arguments', () => {
    expect(new UnexpectedFunctionCallError({
      name: 'foo'
    }, [], [], []).message).toEqual('Unexpected function call foo()');
  });

  it('should stringify correctly with arguments', () => {
    expect(new UnexpectedFunctionCallError({
      name: 'foo'
    }, [0, 1], [], []).message).toEqual('Unexpected function call foo(0, 1)');
  });
});
