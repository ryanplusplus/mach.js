'use strict';

class Permutations {
  static permute(items) {
    items = items || [];

    return Permutations._permute(items);
  }

  static _permute(items) {
    if (items.length === 0) {
      return [];
    }

    let permutations = [];

    for (let item of items) {
      let perms = Permutations._permute(items.filter(i => i !== item));

      if (perms.length > 0) {
        for (let p of perms) {
          permutations.push([item].concat(p));
        }
      } else {
        permutations.push([item]);
      }
    }

    return permutations;
  }
}

module.exports = Permutations;
