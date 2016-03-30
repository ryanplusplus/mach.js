'use strict';

describe('Same', () => {
  let Same = require('../src/Same.js');

  it('should have the right value', () => {
    var value = 0;
    expect(new Same(value).value).toEqual(value);
  });

  it('should default matcher to _.isEqual', () => {
    var same = new Same(0);

    expect(same.matcher).not.toBeUndefined();

    expect(same.matcher.length).toEqual(2);
    expect(same.matcher(0, 0)).toBe(true);
    expect(same.matcher(0, 1)).toBe(false);
  });

  it('should have specified matcher', () => {
    var matcher = (a, b) => {
      return a !== b;
    };

    var same = new Same(0, matcher);

    expect(same.matcher.length).toEqual(2);
    expect(same.matcher(0, 1)).toBe(true);
    expect(same.matcher(0, 0)).toBe(false);
  });
});
