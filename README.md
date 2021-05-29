![](https://img.shields.io/badge/Foundry-v0.7.10-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/scottburton11/burger-time/latest/module.zip)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fburger-time&colorB=4aa94a)

# Burger Time

Dungeons & Dragons 5e Hunger rules for Foundry VTT, simplified.

According to the [SRD 5th Edition Starvation Rules](https://www.5esrd.com/gamemastering/hazards/starvation/), a character needs 1 pound of food per day or should suffer 1 level of exhaustion.

Burger Time automates hunger checks for players, reminding them via private message to eat.
## How It Works
Burger Time requires [About Time](https://gitlab.com/tposney/about-time) to track active player time. It uses world time, and only affects active players. 

### Time Between Meals
BurgerTime tracks time since a player last ate, and reminds them every 24 hours of their current hunger status. 

It expects that you're running About Time's world timer and that world time is running:
```
game.Gametime.startRunning()
```
Time between meals is only tracked for active players –– removing a token from the active scene stops the hunger timer, and hunger isn't tracked for logged-out players. Players will never starve because they missed a session or two. 
### Consuming Food
Players can use food as you would any other item –- by clicking the "roll" icon next to the item in their character sheet. BurgerTime will detect that food was used.

When a player eats, the following happens:

* Their `lastMealAt` timer is reset
* Any hunger effects added by BurgerTime are removed
* Their hunger clock is reset

GMs can set the food item name (default "Rations").
### Hunger
Burger Time maintains an ActiveEffect for players afflicted by hunger. It adds a level of exhaustion for each 24 hour period beyond their hunger threshold, up to a maximum (default 2).

## Troubleshooting
Since hunger timers depend on the game's world time, players won't see any notifications unless the game clock advances. There are a few ways this can happen:

* The [game timer is actively running](https://gitlab.com/tposney/about-time/-/blob/master/GettingStarted.md#time-passing), using `game.Gametime.startRunning()`. This is how Burger Time is designed to be used.
* You manually advance the clock, using About Time's clock widget, `game.advanceTime()`, or some other method.

Burger Time may behave weirdly if the clock has never run. When in doubt, use the `resetHunger` method (below) to reinitialize an actor. 
## GM Macros
The following useful macros are available for GMs:
* `BurgerTime.resetHunger(actor)` - Resets all BurgerTime flags, and removes any ActiveEffects.
* `BurgerTime.showHungerTable()` - Show a table of all active actors and their hunger status.
## Requirements

* [About Time](https://gitlab.com/tposney/about-time)
* [D&D 5e System]()

## Changelog

