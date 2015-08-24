module.exports = {
  mockFunction: function mockFunction() {
    var thing = function theMock() {}

    thing.shouldBeCalled = function shouldBeCalledWith() {
      return {
        when: function when() {}
      }
    }

    return thing;
  }
}
