'use strict';

describe('FunctionCallsString', () => {
  let FunctionCallsString = require('../../src/Error/FunctionCallsString.js');

  it('should return empty string if there are no expected calls', () => {
    expect(new FunctionCallsString([], []).toString()).toEqual('');
  });

  it('should stringify complete and incomplete calls', () => {
    expect(new FunctionCallsString([{
      name: 'foo',
      actualArgs: []
    }], [{
      name: 'bar',
      argsChecked: true,
      expectedArgs: []
    }, {
      name: 'baz',
      argsChecked: false,
      expectedArgs: []
    }]).toString()).toEqual('\nCompleted calls:\n\tfoo()\nIncomplete calls:\n\tbar()\n\tbaz(<any>)');
  });
});
