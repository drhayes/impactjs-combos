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
  // Fake input stuff.
  input: {
    pressed: function() {}
  },
  // Fake Timer stuff.
  Timer: function() {},
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
    var deltaStub;

    beforeEach(function() {
      // Fake the timer as well.
      deltaStub = sinon.stub();
      sinon.stub(ig, 'Timer').returns({
        delta: deltaStub
      });
      comboManager = new ComboManager();
      cb = sinon.spy();
    });

    afterEach(function() {
      ig.Timer.restore();
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
        var interval;

        beforeEach(function() {
          deltaStub.returns(0);
          interval = 0.5;
          handle = comboManager.add(moves, interval, cb);
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

        it('should create a new tracker when matching the first move', function() {
          // Fake the input press.
          ig.input.pressed.withArgs(moves[0]).returns(true);
          expect(_.size(comboManager.trackers)).to.equal(0);
          // Invoke update.
          comboManager.update();
          // Do we have a new tracker?
          expect(_.size(comboManager.trackers)).to.equal(1);
        });

        it('should add a tracker for each combo matched', function() {
          // Add another combo.
          comboManager.add([moves[0], 'jump'], interval, cb);
          // Fake the input press.
          ig.input.pressed.withArgs(moves[0]).returns(true);
          expect(_.size(comboManager.trackers)).to.equal(0);
          // Invoke update.
          comboManager.update();
          // Do we have a new tracker?
          expect(_.size(comboManager.trackers)).to.equal(2);
        });

        it('expires old trackers during update', function() {
           // Fake the input press.
           ig.input.pressed.withArgs(moves[0]).returns(true);
           // Invoke update to create a tracker.
           comboManager.update();
           expect(_.size(comboManager.trackers)).to.equal(1);
           deltaStub.returns(interval * 2);
           ig.input.pressed.withArgs(moves[0]).returns(false);
           comboManager.update();
           expect(_.size(comboManager.trackers)).to.equal(0);
        });

        it('should call callback if inputs match combo', function() {
           ig.input.pressed.withArgs(moves[0]).returns(true);
           comboManager.update();
           ig.input.pressed.withArgs(moves[0]).returns(false);
           ig.input.pressed.withArgs(moves[1]).returns(true);
           comboManager.update();
           ig.input.pressed.withArgs(moves[1]).returns(false);
           ig.input.pressed.withArgs(moves[2]).returns(true);
           comboManager.update();
           ig.input.pressed.withArgs(moves[2]).returns(false);
           ig.input.pressed.withArgs(moves[3]).returns(true);
           comboManager.update();
           expect(cb.called).to.be(true);
        });
      });
    });
  });
});