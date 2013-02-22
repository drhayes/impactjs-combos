/*global require: true, global: true, describe: true, beforeEach: true,
  it: true, ComboManager: true */
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var _ = require('underscore');

// Get Chai to use the sinon adapter.
chai.use(sinonChai);

var expect = chai.expect;

// Expose underscore globally.
global._ = _;

// Fake the Impact global namespace with good enough definitions.
var ig = global.ig = {
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
  describe('setup', function() {
    it('should be defined', function() {
      expect(ComboManager).to.be.a('function');
    });
  });

  describe('usage', function() {
    var comboManager;
    var moves = ['up', 'up', 'down', 'down'];
    var cb;

    beforeEach(function() {
      comboManager = new ComboManager();
      cb = sinon.spy();
    });

    describe('add', function() {
      it('should be a function', function() {
        expect(comboManager.add).to.be.a('function');
      });

      it('should return a handle after adding', function() {
        var handle = comboManager.add(moves, 1000, cb);
        expect(handle).to.be.ok;
      });

      it('should register a combo', function() {
        expect(_.size(comboManager.combos)).to.equal(0);
        var handle = comboManager.add(moves, 1000, cb);
        expect(_.size(comboManager.combos)).to.equal(1);
      });
    });

    describe('remove', function() {
      it('should be a function', function() {
        expect(comboManager.remove).to.be.a('function');
      });

      it('should remove combos added by add', function() {
        var handle = comboManager.add(moves, 1000, cb);
        expect(_.size(comboManager.combos)).to.equal(1);
        comboManager.remove(handle);
        expect(_.size(comboManager.combos)).to.equal(0);
      });

      it('should not blow up if given invalid handle', function() {
        comboManager.remove('thing');
      });
    });
  });
});