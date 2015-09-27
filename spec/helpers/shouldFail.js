beforeEach(function() {
  shouldFail = function shouldFail(thunk) {
    try {
      thunk();
      fail('expected failure did not occur');
    } catch (e) {}
  }

  shouldFailWith = function shouldFailWith(expectedFailure, thunk) {
    try {
      thunk();
      fail('expected failure did not occur');
    } catch (e) {
      expect(e.message.toString()).toContain(expectedFailure);
    }
  }

  shouldFailWithExactly = function shouldFailWith(expectedFailure, thunk) {
    try {
      thunk();
      fail('expected failure did not occur');
    } catch (e) {
      expect(e.message.toString()).toBe(expectedFailure);
    }
  }
});
