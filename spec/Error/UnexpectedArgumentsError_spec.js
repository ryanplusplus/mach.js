'use strict';

describe('UnexpectedArgumentsError', () => {
  let UnexpectedArgumentsError = require('../../src/Error/UnexpectedArgumentsError.js');

  it('should stringify correctly without arguments', () => {
    expect(new UnexpectedArgumentsError({
      name: 'foo'
    }, [], [], []).message).toEqual('Unexpected arguments () provided to function foo');
  });

  it('should stringify correctly with arguments', () => {
    expect(new UnexpectedArgumentsError({
      name: 'foo'
    }, [0, 1], [], []).message).toEqual('Unexpected arguments (0, 1) provided to function foo');
  });
});
