'use strict';

describe('FunctionCallsString', () => {
  let FunctionCallsString = require('../../src/Error/FunctionCallsString.js');

  it('should return empty string if there are no expected calls', () => {
    expect(new FunctionCallsString([], [])
        .toString())
      .toEqual('');
  });

  it('should stringify calls', () => {
    expect(new FunctionCallsString([{
          name: 'foo',
          actualArgs: [],
          completed: true
        }, {
          name: 'bar',
          checkArgs: true,
          expectedArgs: [],
          completed: false
        }, {
          name: 'baz',
          checkArgs: false,
          expectedArgs: [],
          completed: false
        }])
        .toString())
      .toEqual('\nCompleted calls:\n\tfoo()\nIncomplete calls:\n\tbar()\n\tbaz(<any>)');
  });
});
