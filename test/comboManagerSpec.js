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
  // The ComboManager overrides bind and bindTouch, so we need to fake up
  // the extend method on Input to verify that it is intercepting the
  // right stuff.
  Input: {
    inject: sinon.stub()
  },
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

    it('should have well-defined initial state', function() {
      var cm = new ComboManager();
      expect(cm.actions).to.be.a('array');
      expect(cm.combos).to.be.a('object');
      expect(cm.timer).to.be.a('object');
      expect(cm.inputStream).to.be.a('array');
    });

    it('should intercept bind and bindTouch', function() {
      expect(ig.Input.inject.called).to.equal(true);
      var call = ig.Input.inject.getCall(0);
      var definition = call.args[0];
      // Verify that it is trying to do something with bind and bindTouch.
      expect(definition.bind).to.be.a('function');
      expect(definition.bindTouch).to.be.a('function');
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
      // Register those moves.
      comboManager.actions = _.uniq(moves);
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

    describe('update', function() {
      it('should be a function', function() {
        expect(comboManager.update).to.be.a('function');
      });

      describe('input tracking', function() {
        it('should register keystrokes on update', function() {
          // Track some actions.
          comboManager.actions = ['catpants', 'doggyhat', 'horsepoo'];
          ig.input.pressed = sinon.stub();
          // Inputs interspersed with updates.
          ig.input.pressed.withArgs('doggyhat').returns(true);
          comboManager.update();
          ig.input.pressed.withArgs('doggyhat').returns(false);
          ig.input.pressed.withArgs('catpants').returns(true);
          comboManager.update();
          // catpants * 2
          comboManager.update();
          ig.input.pressed.withArgs('catpants').returns(false);
          ig.input.pressed.withArgs('horsepoo').returns(true);
          comboManager.update();
          // Validate the input stream.
          expect(comboManager.inputStream).to.deep.equal(
            ['doggyhat', 'catpants', 'catpants', 'horsepoo']);
        });
      });

      describe('with one combo', function() {
        var handle;
        var interval;

        var doCombo = function() {
          _.each(moves, function(move, index) {
            if (index > 0) {
              ig.input.pressed.withArgs(moves[index - 1]).returns(false);
            }
            ig.input.pressed.withArgs(moves[index]).returns(true);
            comboManager.update();
          });
        };

        beforeEach(function() {
          deltaStub.returns(0);
          interval = 0.5;
          handle = comboManager.add(moves, interval, cb);
          ig.input.pressed = sinon.stub();
        });

        it('should call callback if inputs match combo', function() {
          doCombo();
          expect(cb.called).to.equal(true);
        });

        it('should only call callback once on match', function() {
          doCombo();
          ig.input.pressed.withArgs(moves[moves.length - 1]).returns(false);
          comboManager.update();
          expect(cb.calledOnce).to.be.ok;
        });
      });
    });
  });
});