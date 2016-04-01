'use strict';

describe('Permutations', () => {
  let Permutations = require('../../src/Tree/Permutations.js');

  it('should return an array of length 0 if items is undefined', () => {
    expect(Permutations.permute().length).toEqual(0);
  });

  it('should return an array of length 0 if items has 0 items', () => {
    expect(Permutations.permute([]).length).toEqual(0);
  });

  it('should return an array of length 1 if items has 1 item', () => {
    expect(Permutations.permute([0]).length).toEqual(1);
  });

  it('should return an array of length 2 if items has 2 items', () => {
    expect(Permutations.permute([0, 1]).length).toEqual(2);
  });

  it('should return an array of length 6 if items has 3 items', () => {
    expect(Permutations.permute([0, 1, 2]).length).toEqual(6);
  });

  it('should return an array of length 24 if items has 4 items', () => {
    expect(Permutations.permute([0, 1, 2, 3]).length).toEqual(24);
  });
});
