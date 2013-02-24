/*global ig: true, _: true */
ig.module(
  'game.system.comboManager'
)
.requires(
  'impact.impact',
  'impact.input'
)
.defines((function(global) {

  'use strict';

  var actions = [];

  // Intercept calls to ig.input.bind and ig.input.bindTouch so we know what
  // actions to look for in the ComboManager.
  ig.Input.inject({
    bind: function(key, action) {
      actions.push(action);
      this.parent(key, action);
    },
    bindTouch: function(selector, action) {
      actions.push(action);
      this.parent(selector, action);
    }
  });

  global.ComboManager = function() {
    this.actions = actions;
    this.combos = {};
    this.timer = new ig.Timer();
    this.inputStream = [];

    // Register a combo with the combo manager. 'moves' is an array of inputs
    // that, pressed in succession, represent a combo. 'interval' is the time
    // in seconds that the player has to make the combo; for example, with an
    // interval of 1.5 the player has 1.5 seconds from the first keypress to
    // the last to complete the combo. 'callback' is invoked if the combo
    // completes successfully.
    // Returns a handle that you can use to remove a combo afterwards.
    this.add = function(moves, interval, callback) {
      var handle = _.uniqueId('combo-manager-');
      // Register the combo itself.
      this.combos[handle] = {
        moves: moves,
        joinedMoves: moves.join('|'),
        interval: interval,
        callback: callback
      };
      // Return the handle for later removal.
      return handle;
    };

    // Invoke this method with the handle returned by add to de-register
    // a combo.
    this.remove = function(handle) {
      // Which combo are we removing?
      var combo = this.combos[handle];
      if (!combo) {
        // Invalid handle, early exit.
        return;
      }
      // Delete the combo itself.
      delete this.combos[handle];
    };

    // Meant to be called within context of ComboManager.
    // Pushes the action onto the input stream if the action
    // is currently pressed.
    var updateStreamIfPressed = function(action) {
      if (ig.input.pressed(action)) {
        this.inputStream.push(action);
      }
    };

    // Call this method every frame to check for combos!
    this.update = function() {
      // Iterate over the known actions, seeing if any were pressed.
      _.each(this.actions, updateStreamIfPressed, this);
      // Iterate over the combos checking to see if any hit.
      var cache = {};
      _.each(this.combos, function(combo) {
        var slice = _.last(this.inputStream, combo.moves.length);
        if (slice.join('|') === combo.joinedMoves) {
          combo.callback();
        }
      }, this);
    };
  };

}).bind(this, this));
