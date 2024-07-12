'use strict';

describe('ArgumentsString', () => {
  let ArgumentsString = require('../../src/Error/ArgumentsString.js');
  let Same = require('../../src/Same.js');

  it('should return an empty string for no args', () => {
    expect(new ArgumentsString([]).toString()).toEqual('');
  });

  it('should extract value from Same', () => {
    expect(new ArgumentsString([new Same(0)]).toString()).toEqual('0');
  });

  it('should convert undefined into a string', () => {
    expect(new ArgumentsString([undefined]).toString()).toEqual('undefined');
  });

  it('should convert null into a string', () => {
    expect(new ArgumentsString([null]).toString()).toEqual('null');
  });

  it('should convert array into a string', () => {
    expect(new ArgumentsString([
      [0, 1, 2]
    ]).toString()).toEqual('[0, 1, 2]');
  });

  it('should put quotes on strings', () => {
    expect(new ArgumentsString(['0']).toString()).toEqual('\'0\'');
  });

  it('should combine multiple arguments into a single string', () => {
    expect(new ArgumentsString([0, '1', [2, '3', null], undefined])
      .toString()).toEqual('0, \'1\', [2, \'3\', null], undefined');
  });

  it('should automatically convert into a string', () => {
    let argsString = new ArgumentsString([0]);
    expect('' + argsString).toEqual('0');
    expect(argsString + '').toEqual('0');
  });

  it('should handle undefined', () => {
    let argsString = new ArgumentsString({sam: undefined, ryan: 1000});
    expect('' + argsString).toEqual('{"sam": "undefined", "ryan": 1000});
  });
});
