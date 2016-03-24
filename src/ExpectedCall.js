'use strict';

class ExpectedCall {
  constructor(mock, args, required, checkArgs) {
    this._mock = mock;
    this._completed = false;
    this._strictlyOrdered = false;
    this._checkArgs = checkArgs;
    this._required = required;
  }

  complete(args) {
    this._completed = true;
    this._actualArgs = args;
  }

  get isComplete() {
    return this._completed;
  }

  get isRequired() {
    return this._required;
  }

  get argsChecked() {
    return this._checkArgs;
  }

  matchesFunction(mock) {
    return mock == this._mock;
  }

  matchesArguments(args) {
    if (!this._checkArgs) {
      return true;
    }

    if (args.length !== this._expectedArgs.length) {
      return false;
    }

    for (let i = 0; i < args.length; i++) {
      // FIXME: machAny, machSame
      if (this._expectedArgs[i] === machAny) {} else if (machSame.isPrototypeOf(this._expectedArgs[i])) {
        if (!this._expectedArgs[i].matcher(args[i], this._expectedArgs[i].val)) {
          return false;
        }
      } else if (args[i] !== this._expectedArgs[i]) {
        return false;
      }
    }

    return true;
  }

  matches(mock, args) {
    return this.matchesFunction(mock) && this.matchesArguments(args);
  }

  set returnValue(newReturnValue) {
    this._returnValue = newReturnValue;
  }

  get returnValue() {
    return this._returnValue;
  }

  set throwValue(newThrowValue) {
    this._throwValue = throwValue;
  }
  get throwValue() {
    return this._throwValue;
  }

  get expectedArgs() {
    return this._expectedArgs;
  }

  get actualArgs() {
    return this._actualArgs;
  }

  get name() {
    return this._mock._name;
  }

  clone() {
    let clone = new ExpectedCall(this._mock, this._expectedArgs, this._required, this._checkArgs);
    clone.setReturnValue(this._returnValue);
    // TODO: throwValue, other fields?
    // are we aiming for shallow copy?
    return clone;
  }

  requireStrictOrdering() {
    this._strictlyOrdered = true;
  }

  get strictlyOrdered() {
    return this._strictlyOrdered;
  }
}

module.exports = ExpectedCall;
