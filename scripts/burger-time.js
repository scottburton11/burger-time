const debug = false 

CONFIG.debug.hooks = debug

import registerSettings from "./lib/settings.js"
import {
  DAY
} from "./lib/constants.js"

import {
  secondsAgo,
  daysFromSeconds
} from "./lib/time.js"

import {
  hungerLevel,
  consumeFood,
  initializeHunger,
  evaluateHunger,
  unset,
} from "./lib/hunger.js"

import { preloadTemplates } from './lib/preloadTemplates.js';
import HungerTable from './lib/hunger-table.js'

Hooks.once('init', async => {
  game.BurgerTime = BurgerTime
  BurgerTime.init()
})

Hooks.once('ready', async => {
  if (game.user.isGM && debug) {
    BurgerTime.showHungerTable()
  }
})

class BurgerTime {
  static async init() {
    console.log("Burger Time | Initialized")
    
    await registerSettings()
    await preloadTemplates()

    if (game.settings.get('burger-time', 'enabled')) {
      this.setupHooks()
    }
  }

  static setupHooks() {
    console.log("Burger Time | Setup")

    Hooks.on('ready', () => {
      this.initializeScene()
    })

    Hooks.on('preCreateToken', async (document, data, options) => {
      const actor = game.actors.get(document.data.actorId)
      console.log("Burger Time | pre Create Token", actor)
      if (!actor.hasPlayerOwner) return
      if (!game.user.isGM) return
      if (!actor.getFlag('burger-time', 'lastMealAt')) {
        initializeHunger(actor)
      }
    })

    Hooks.on('preDeleteToken', async(document, data) => {
      const actor = game.actors.get(document.data.actorId)
      console.log("Burger Time | pre Delete Token", actor)
      // this.clearHungerTimer(actor)
    })

    Hooks.on('updateWorldTime', async (seconds, elapsed) => {
      // Skip this for GMs; hunger is only evaluated by players
      if (game.user.isGM) return

      // We want to reset hunger in these two circumstances
      // We skipped backwards
      if (elapsed < 0) {
        initializeHunger(actor)
        return
      }

      // We skipped forward more than a day
      if (elapsed > DAY * 2) {
        initializeHunger(actor)
        return
      }

      game.scenes.active.data.tokens.forEach(async token => {
        const actor = game.actors.get(token.data.actorId)
        if (!actor.isOwner) return

        const seconds = actor.getFlag('burger-time', 'secondsSinceLastMeal')
        if (typeof seconds === 'undefined') return

        await actor.setFlag('burger-time', 'secondsSinceLastMeal', seconds + elapsed)
        const lastMealNotificationAt = actor.getFlag('burger-time', 'lastMealNotificationAt')
        const daysSinceLastMealNotification = daysFromSeconds(secondsAgo(lastMealNotificationAt))
        if (daysSinceLastMealNotification >= 1) {
          await evaluateHunger(actor)
        }
      })
    })

    // 0.7.x ???
    Hooks.on('preUpdateOwnedItem', async (actor, item, data, action) => {
      if (data.hasOwnProperty('sort')) return

      if (game.settings.get('burger-time', 'rationName') === item.name) {
        if (item.data.quantity === data.data.quantity + 1) {
          consumeFood(actor)
        }
      } else if (game.settings.get('burger-time', 'waterName') === item.name) {
        if (item.data.uses.value === data.data.uses.value + 1) {

        }
      }
    })

    // 0.8.x
    Hooks.on('preUpdateItem', async (item, data, options, actorId) => {
      if (data.hasOwnProperty('sort')) return

      if (game.settings.get('burger-time', 'rationName') === item.name) {
        if (item.data.data.quantity === data.data.quantity + 1) {
          await consumeFood(item.actor)
        }
      } else if (game.settings.get('burger-time', 'waterName') === item.name) {
        if (item.data.data.uses.value === data.data.uses.value + 1) {

        }
      }
    })

    Hooks.on('renderChatLog', async (app, html, data) => {
      html.on('click', "button[data-action='consumeFood']", (event) => {
        const actor = game.actors.get(event.target.dataset.actorId)
        const item = actor.getOwnedItem(event.target.dataset.itemId)
        return item.roll();
      })


    })

    Hooks.on('renderActorSheet5eCharacter', async (app, html, sheet) => {
      const el = $(html).find('.counters')
      const actor = game.actors.get(sheet.actor._id)
      el.append(`<div class='counter flexrow hunger'><h4>Hunger</h4><div class='counter-value'>${hungerLevel(actor)}</div></div>`)
    })
  }

  static initializeScene() {
    console.log("Burger Time | Initializing Scene")
    game.scenes.active.data.tokens.forEach(token => {
      const actor = game.actors.get(token.data.actorId)
      if (!actor.hasPlayerOwner) return
      if (!game.user.isGM) return
      if (!actor.getFlag('burger-time', 'lastMealAt')) {
        initializeHunger(actor)
      }
      console.log("Burger Time |", actor, actor.data.flags['burger-time'])
    })
  }

  static showHungerTable() {
    HungerTable.activate()
  }

  static async resetHunger(actor) {
    await unset(actor)
    await initializeHunger(actor)
    Hooks.call("resetHunger", actor)
  }
}