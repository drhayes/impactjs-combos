/*global ig: true */
ig.module(
  'game.system.comboManager'
)
.requires(
  'impact.impact'
)
.defines((function(global) {

  'use strict';

  global.ComboManager = function() {
    var handleId = 0;

    var genHandle = function() {
      return 'combo-manager-' + handleId++;
    };

    this.add = function(moves, interval, callback) {
      var handle = genHandle();
      return handle;
    };
  };

}).bind(this, this));
