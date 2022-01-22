![](https://img.shields.io/badge/Foundry-v0.7.10-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/scottburton11/burger-time/latest/module.zip)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fburger-time&colorB=4aa94a)

# Burger Time

Dungeons & Dragons 5e Hunger rules for Foundry VTT, automated.

According to the [SRD 5th Edition Starvation Rules](https://www.5esrd.com/gamemastering/hazards/starvation/), a character needs 1 pound of food per day or should suffer Exhaustion.

Burger Time automates hunger checks for players, reminding them via private message to eat. By default, it assumes players are using the SRD "Rations" item, and allows players to decide when to eat.

![Hunger Chat Message](https://user-images.githubusercontent.com/12917/120086001-b71f3a00-c091-11eb-8e3c-72787bc006f8.png)

## Why?
Keeping track of hunger is such a chore that most GMs (myself included) ignore it altogether, or treat it as part of a Long Rest routine. 

For most types of campaigns, you should probably ignore hunger (like you would ignore encumberance); it takes players out of a fast-moving narrative and feels pedantic. 

However, some kinds of campaigns really benefit from survival rules – particularly hex crawls, dungeon crawls, survival campaigns and anything where the players have a lot of agency. Keeping track of food, water, torches and other adventuring equipment is key to storytelling in these circumstances, and Burger Time allows you to do that with minimal GM effort.
## How It Works
Burger Time requires [About Time](https://gitlab.com/tposney/about-time) to track active player time. It uses world time, and only affects active players. 

Hunger is tracked at the Actor level, and all Tokens associated with the Actor share the same Hunger level. 

Time between meals is only tracked for active players –– removing a token from the active scene stops the hunger timer, and hunger isn't tracked for logged-out players. Players will never starve because they missed a session or two. 
### Time Between Meals
Burger Time tracks time since a player last ate, and reminds them every 24 hours of their current hunger status. 

It expects that you're running About Time's world timer and that world time is running:
```
game.Gametime.startRunning()
```
When a scene is activated, Burger Time will try to start tracking hunger on all of the scene's player-controlled actors. Likewise, when a GM drags a token into a scene, that it begins to track that actor's hunger if it isn't already. 

Hunger is tracked in the following circumstances:

* An Actor is player-controlled
* It's in an active scene
* The player is playing
* Time is advancing, either manually or with the game clock running

When the game clock is skips ahead by more than 24 hours, or when it skips backwards by any amount, the players are assumed to have eaten – Actor hunger is reset, and any hunger effects are removed. This allows the GM to use game calendar for narrative storytelling purposes without starving players. 
### Consuming Food
Players can use food as you would any other item – by clicking the "roll" icon next to the item in their character sheet. Burger Time will detect that food was used.

When a player eats, the following happens:

* Their `lastMealAt` timer is reset
* Any hunger effects added by Burger Time are removed
* Their hunger clock is reset

GMs can set the food item name (default "Rations").
### Hunger
Burger Time maintains an ActiveEffect for players afflicted by hunger. It adds a level of Exhaustion for each 24 hour period beyond their hunger threshold, up to a maximum (default 2).

![Hunger Active Effect](https://user-images.githubusercontent.com/12917/120086017-d3bb7200-c091-11eb-8f95-a451edf1777f.png)

Burger Time spots the player (and the GM) one 24-hour period without food without penalty; players can go from "Satisfied" to "A Bit Peckish" without gaining Exhaustion. When their hunger reaches "Hungry", Burger Time will apply one stack of Hunger, and increase the level of Exhaustion by one when they reach "Ravenous". By default, no more than 2 levels of Exhaustion are applied - you can change this to up to 4 to continue to apply stacks of Exhaustion at the "Ravenous" and "Starving" phases.

Burger Time's Hunger effect only applies Exhaustion; it does not further automate any rules that involve it. To accomplish that, this guide to [enhancing the Exhaustion condition with MidiQol](https://www.foundryvtt-hub.com/guide/under-the-hood-enhancing-Exhaustion-condition/) should do the trick.
## Troubleshooting
Since hunger timers depend on the game's world time, players won't see any notifications unless the game clock advances. There are a few ways this can happen:

* The [game timer is actively running](https://gitlab.com/tposney/about-time/-/blob/master/GettingStarted.md#time-passing), using `game.Gametime.startRunning()`. This is how Burger Time is designed to be used.
* You manually advance the clock, using About Time's clock widget, `game.advanceTime()`, or some other method.

If you are a GM, and no players are logged in, you won't see any hunger messages unless you uncheck "Don't make missing players hungry", which is on by default. 

Only tokens assigned to players as "OWNER" are evaluated.

Burger Time may behave weirdly if the clock has never run. When in doubt, set the game clock, then use the `resetHunger` method (below) to reinitialize an actor. 
## GM Macros
The following useful macros are available for GMs:
* `game.BurgerTime.resetHunger(actor)` - Resets all Burger Time flags, and removes any ActiveEffects.
* `game.BurgerTime.showHungerTable()` - Show a table of all active actors and their hunger status.
## Requirements

* [About Time](https://gitlab.com/tposney/about-time)
* [D&D 5e System]()

## Acknowledgements

Thanks to these amazing folks for bug reports, feature recommendations and testing support:
* [@deraviin](https://github.com/deraviin)
* [@Jonwh25](https://github.com/Jonwh25)
* [@jesucar3](https://github.com/jesucar3)
* [@aprusik](https://github.com/aprusik)
* [@SR5060](https://github.com/SR5060)
* [@Heljspe](https://github.com/Heljspe)
* [@valhallatoys](https://github.com/valhallatoys)

Keep em coming!