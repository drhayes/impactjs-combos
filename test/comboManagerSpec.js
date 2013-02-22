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
  input: {
    pressed: function() {}
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
  describe('setup', function() {
    it('should be defined', function() {
      expect(ComboManager).to.be.a('function');
    });
  });

  describe('method', function() {
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

      it('should track a new combo starter', function() {
        expect(_.size(comboManager.comboStarters)).to.equal(0);
        comboManager.add(['left'], 1000, cb);
        expect(_.size(comboManager.comboStarters)).to.equal(1);
        expect(comboManager.comboStarters.left).to.be.ok;
      });

      it('should track duplicate combo starters', function() {
        expect(_.size(comboManager.comboStarters)).to.equal(0);
        comboManager.add(['left', 'right'], 1000, cb);
        comboManager.add(['left', 'up'], 1000, cb);
        expect(_.size(comboManager.comboStarters)).to.equal(1);
        expect(comboManager.comboStarters.left).to.be.ok;
        var starters = comboManager.comboStarters.left;
        expect(starters).to.have.length(2);
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

      it('should stop tracking combo starter if removed', function() {
        var handle = comboManager.add(moves, 1000, cb);
        expect(_.size(comboManager.comboStarters)).to.equal(1);
        comboManager.remove(handle);
        expect(_.size(comboManager.comboStarters)).to.equal(0);
      });
    });

    describe('update', function() {
      it('should be a function', function() {
        expect(comboManager.update).to.be.a('function');
      });

      describe('with one combo', function() {
        var handle;

        beforeEach(function() {
          handle = comboManager.add(moves, 1000, cb);
          ig.input.pressed = sinon.stub();
        });

        it('should not check if no registered combos', function() {
          // Remove the combo registered in beforeEach.
          // We need to make sure we're not iterating over a bunch
          // of combo starters if no combos are registered.
          comboManager.remove(handle);
          // Now invoke update.
          comboManager.update();
          // Validate that our stub was not called.
          expect(ig.input.pressed.called).to.not.be.ok;
        });

        it('should check that first move was pressed', function() {
          // This fakes the input press.
          ig.input.pressed.withArgs(moves[0]).returns(true);
          // Invoke update.
          comboManager.update();
          // Validate that our stub was called.
          expect(ig.input.pressed.called).to.be.ok;
        });
      });
    });
  });
});