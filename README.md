# impactjs-combos [![Build Status](https://travis-ci.org/drhayes/impactjs-combos.png?branch=master)](https://travis-ci.org/drhayes/impactjs-combos)

Provides the player the ability to do combos in [ImpactJS][].

Ever wanted to put the [Konami code][konami] into your game? With this plugin, you can.

**IMPORTANT**: This plugin relies on the excellent [underscore][] library. You *must* include a reference to underscore before using this plugin!

## Overview

The basic idea: register a series of actions with the combo manager and the callback that will be invoked if the player pulls off the combo. And that's pretty much it.

## Usage

  1. Include a reference to [underscore][]. You'll likely need to
     put another script tag in your index.html file.
  2. In your game class, instantiate a combo manager:

        var game = ig.Game.extend({
          init: function() {
            // ...
            // These actions are for example only.
            // You don't have to use these keys or names.
            ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            ig.input.bind(ig.KEY.UP_ARROW, 'up');
            ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
            ig.input.bind(ig.KEY.SPACE, 'jump');

            this.comboManager = new ComboManager();
            // ...
          }
        });

  3. In your game's `update` method, call the combo manager's update:

        update: function() {
          // ...
          this.comboManager.update();
          // ...
        }

  4. Register some combos!

        ig.game.comboManager.add(['down', 'right', 'jump'], 1, function() {
          console.log('You did a combo!');
        });

And that's it. When the player does the actions down-right-jump, all within one second (the second parameter to the `add` method), then your function will be called.

## Available Methods

You'll be making combos in no time.

### `add`

    var handle = comboManager.add(listOfMoves, interval, callback);

Registers a combo with the combo manager.

Arguments:

  * **listOfMoves** A list of actions (the string you passed as the second parameter to
    a call to `ig.input.bind`). When the player executes this list in order within your
    specified interval the manager will call your callback.
  * **interval** The length of time in seconds the player has to complete the combo. If
    you want a very twitchy experience, set this to 0.5. For more staid combos, set this
    to 1.5.
  * **callback** A function that takes no arguments. The combo manager will invoke this
    function when the player successfully completes the combo in the given length of time.

Returns:

  * A handle that you may pass to `remove` to deregister the combo.

### `remove`

    comboManager.remove(handle);

Given the handle you got back from adding the combo, this method will deregister it. The combo will no longer work after this.

### `update`

    comboManager.update();

Call this method every frame and the combo manager will do its magic.

## License

Copyright (c) 2013 David Hayes

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 [impactjs]: http://impactjs.com
 [konami]: http://en.wikipedia.org/wiki/Konami_Code
 [underscore]: http://underscorejs.org
