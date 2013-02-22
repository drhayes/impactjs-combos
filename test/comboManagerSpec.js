/*global require: true, global: true, describe: true, beforeEach: true,
  it: true, EventChain: true */
var chai = require('chai');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

var expect = chai.expect;

// Fake the Impact global namespace with good enough definitions.
var ig = global.ig = {
  // Properties used by eventChain.
  system: {
    tick: 0
  },
  // Impact module definition stuff.
  module: function() {
    return this;
  },
  requires: function() {
    return this;
  },
  defines: function(definition) {
    definition();
  }
};

// The module declares ComboManager globally.
var ComboManager = require('../comboManager.js').ComboManager;

describe('ComboManager', function() {
  it('should be defined', function() {
    expect(ComboManager).to.be.a('function');
  });

  describe('add', function() {
    var comboManager;
    var moves = ['up', 'up', 'down', 'down'];
    var cb;

    beforeEach(function() {
      comboManager = new ComboManager();
    });

    it('should be a function', function() {
      expect(comboManager.add).to.be.a('function');
    });

    it('should return a handle after adding', function() {
      var handle = comboManager.add(moves, 1000, cb);
      expect(handle).to.be.ok;
    });
  });
});