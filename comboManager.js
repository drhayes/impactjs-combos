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
    this.comboStarters = {};
    this.trackers = {};

    this.add = function(moves, interval, callback) {
      var handle = _.uniqueId('combo-manager-');
      // Register the combo itself.
      this.combos[handle] = {
        moves: moves,
        interval: interval,
        callback: callback
      };
      // Track the start of the combo so we know what to check
      // for in update.
      var firstMove = moves[0];
      var starters = this.comboStarters[firstMove];
      if (!starters) {
        starters = [];
        this.comboStarters[firstMove] = starters;
      }
      starters.push(handle);
      // Return the handle for later removal.
      return handle;
    };

    this.remove = function(handle) {
      // Which combo are we removing?
      var combo = this.combos[handle];
      if (!combo) {
        // Invalid handle, early exit.
        return;
      }
      // Deregister the combo starter.
      var firstMove = combo.moves[0];
      var starters = this.comboStarters[firstMove];
      starters = _.without(starters, handle);
      // If there are no more combos that start with this input then
      // remove the combo starter value entirely.
      if (starters.length === 0) {
        delete this.comboStarters[firstMove];
      }
      // Delete the combo itself.
      delete this.combos[handle];
    };

    this.update = function() {
      // Iterate through the known combo starters.
      _.each(this.comboStarters, function(handles, firstMove) {
        if (ig.input.pressed(firstMove)) {
          // Add a new tracker for each handle.
          _.each(handles, function(handle) {
            var trackerId = _.uniqueId('tracker-');
            this.trackers[trackerId] = {
              handle: handle
            };
          }, this);
        }
      }, this);
    };
  };

}).bind(this, this));
