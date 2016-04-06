'use strict';

describe('MockObject', () => {
  let MockObject = require('../src/MockObject.js');

  it('should be allowed to be anonymous', () => {
    let a = {
      foo: 'foo',
      bar: function() {
        return 'bar';
      }
    };
    
    let mockObject = new MockObject(a);
    
    expect(mockObject.foo).toEqual('foo');
    expect(mockObject.bar._name).toEqual('<anonymous>.bar');
  });
  
  it('should have the name specified', () => {
    let a = {
      foo: 'foo',
      bar: function() {
        return 'bar';
      }
    };
    
    let mockObject = new MockObject(a, 'a');
    
    expect(mockObject.foo).toEqual('foo');
    expect(mockObject.bar._name).toEqual('a.bar');
  });
});
