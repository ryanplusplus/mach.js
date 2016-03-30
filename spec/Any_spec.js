'use strict';

describe('Any', () => {
  let Any = require('../src/Any.js');

  it('toString should return the correct value', () => {
    expect(new Any().toString()).toEqual('<any>');
  });
});
