/*global ig: true, _: true */
ig.module(
  'game.system.comboManager'
)
.requires(
  'impact.impact'
)
.defines((function(global) {

  'use strict';

  global.ComboManager = function() {
    this.combos = {};

    this.add = function(moves, interval, callback) {
      var handle = _.uniqueId('combo-manager-');
      this.combos[handle] = {
        moves: moves,
        interval: interval,
        callback: callback
      };
      return handle;
    };

    this.remove = function(handle) {
      delete this.combos[handle];
    };
  };

}).bind(this, this));
