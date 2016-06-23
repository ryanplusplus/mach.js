'use strict';

describe('Callback', () => {
  let Callback = require('../src/Callback.js');

  it('toString should return the correct value', () => {
    expect(new Callback().toString()).toEqual('<callback>');

    expect(String(new Callback())).toEqual('<callback>');
  });
});
