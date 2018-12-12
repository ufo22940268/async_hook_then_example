const asyncHooks = require('async_hooks');
const fs = require('fs');

/**
 * use async hook to provide access to ctx without coupling services and passing through
 */
class Service {
  constructor() {
    this.eid = asyncHooks.executionAsyncId()
    this.store = {};
    this.hooks = asyncHooks.createHook({
      init: (asyncId, type, triggerAsyncId) => {
        fs.writeSync(1, `-- ${asyncId} ${type} ${triggerAsyncId} ${Object.keys(this.store).toString()}\n`);
        if (this.store[triggerAsyncId]) {
          this.store[asyncId] = this.store[triggerAsyncId];
        }
      },
      destroy: (asyncId) => {
        delete this.store[asyncId];
      },
    });
    this.enable();
  }

  async run(fn) {
    this.store[this.eid] = {};
    await fn();
  }

  set(key, value) {
    this.store[this.eid][key] = value;
  }

  get(key) {
    const state = this.store[this.eid];
    if (state) {
      return state[key];
    } else {
      return null;
    }
  }

  enable() {
    this.hooks.enable();
  }

  disable() {
    this.hooks.disable();
  }
}

module.exports = Service;
