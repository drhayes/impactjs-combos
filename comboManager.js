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

    this.timer = new ig.Timer();

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

    // Invoke this method with the handle returned by add to de-register
    // a combo.
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

    // Meant to execute within the context of a ComboManager instance.
    // Given a list of combo handles and the first move for each, check
    // if the corresponding input was pressed and, if so, create a new tracker.
    var maybeCreateTrackers = function(handles, firstMove) {
      if (ig.input.pressed(firstMove)) {
        // Add a new tracker for each handle.
        _.each(handles, function(handle) {
          var trackerId = _.uniqueId('tracker-');
          this.trackers[trackerId] = {
            handle: handle,
            timestamp: this.timer.delta()
          };
        }, this);
      }
    };

    // Meant to execute within the context of a ComboManager instance.
    // Given a tracker (and its ID) this method will remove it from the
    // global list if that tracker has expired according to the
    // ComboManager's timer.
    // It will then check the tracker's current index and see if that
    // input has been pressed. If so, the index will be advanced.
    // If the index is greater than the length of the matching combo's moves
    // then this combo has fired.
    var processTracker = function(tracker, trackerId) {
      var interval = this.combos[tracker.handle].interval;
      if (this.timer.delta() - tracker.timestamp > interval) {
        delete this.trackers[trackerId];
        return;
      }
      var index = tracker.index;
      if (index === void 0) {
        index = 0;
      }
      var combo = this.combos[tracker.handle];
      var move = combo.moves[index];
      if (ig.input.pressed(move)) {
        tracker.index = index + 1;
      }
      if (tracker.index >= combo.moves.length) {
        // COMBO!
        combo.callback();
      }
    };

    // Call this method every frame to check for combos!
    this.update = function() {
      // Did the player press any keys that we should track as possible combos?
      _.each(this.comboStarters, maybeCreateTrackers, this);
      // Process the trackers.
      _.each(this.trackers, processTracker, this);
    };
  };

}).bind(this, this));
