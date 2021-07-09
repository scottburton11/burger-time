import registerSettings from "./lib/settings.js"
import {
  DAY
} from "./lib/constants.js"

import {
  consumeFood,
  hungerLevel,
  initializeHunger,
  updateHunger,
  unsetHunger,
} from "./lib/hunger.js"

import { preloadTemplates } from './lib/preloadTemplates.js';
import HungerTable from './lib/hunger-table.js'

import DND5eSystem from './lib/systems/dnd5e.js'

class NoOpSystem {
  async evaluateHunger(actor) { 
    return
  }
}

Hooks.once('init', async => {
  let system

  switch (game.system.id) {
    case 'dnd5e':
      system = new DND5eSystem(game.system)
      break;
  
    default:
      system = new NoOpSystem(game.system)
      break;
  }

  // game.BurgerTime = BurgerTime
  // BurgerTime.init(system)
  game.BurgerTime = new BurgerTime(system)
  game.BurgerTime.init()
})

Hooks.once('ready', async => {
  if (game.user.isGM && false) {
    BurgerTime.showHungerTable()
  }
})

class BurgerTime {
  constructor(system) {
    this.system = system
  }
  
  async init() {
    console.log("Burger Time | Initialized")
    
    await registerSettings()
    await preloadTemplates()

    if (game.settings.get('burger-time', 'enabled')) {
      this.setupHooks()
    }
  }

  setupHooks() {
    console.log("Burger Time | Setup")

    Hooks.on('ready', () => {
      this.initializeScene()
    })

    Hooks.on('preCreateToken', async (document, data, options) => {
      const actor = game.actors.get(document.data.actorId)
      if (typeof actor === "undefined") return
      if (!actor.hasPlayerOwner) return
      if (!game.user.isGM) return
      if (!actor.getFlag('burger-time', 'lastMealAt')) {
        await initializeHunger(actor)
      }
    })

    Hooks.on('preDeleteToken', async(document, data) => {
      const actor = game.actors.get(document.data.actorId)
      // this.clearHungerTimer(actor)
    })

    Hooks.on('updateWorldTime', async (seconds, elapsed) => {
      if (!game.user.isGM) return

      // We want to reset hunger in these two circumstances
      // We skipped backwards
      if (elapsed < 0) {
        await initializeHunger(actor)
        return
      }

      // We skipped forward more than a day
      if (elapsed > DAY * 2) {
        await initializeHunger(actor)
        return
      }

      const activeUsers = game.users.filter(user => user.active && !user.isGM)

      game.scenes.active.data.tokens.forEach(async token => {
        const actor = game.actors.get(token.data.actorId)
        if (typeof actor === 'undefined') return
        if (!actor.hasPlayerOwner) return

        let activeUser;

        activeUser = activeUsers.find(user => actor.testUserPermission(user, "OWNER"))

        if (!activeUser) return

        await updateHunger(actor, elapsed)

        this.system.evaluateHunger(actor)
      })
    })
    
    // 0.7.x ???
    Hooks.on('preUpdateOwnedItem', async (actor, item, data, action) => {
      if (data.hasOwnProperty('sort')) return

      if (game.settings.get('burger-time', 'rationName') === item.name) {
        if (item.data.quantity === data.data.quantity + 1) {
          consumeFood(actor)
        }
      } 
      // else if (game.settings.get('burger-time', 'waterName') === item.name) {
      //   if (item.data.uses.value === data.data.uses.value + 1) {

      //   }
      // }
    })

    // 0.8.x
    Hooks.on('preUpdateItem', async (item, data, options, actorId) => {
      if (data.hasOwnProperty('sort')) return

      if (game.settings.get('burger-time', 'rationName') === item.name) {
        if (item.data.data.quantity === data.data.quantity + 1) {
          await consumeFood(item.actor)
        }
      } 
      // else if (game.settings.get('burger-time', 'waterName') === item.name) {
      //   if (item.data.data.uses.value === data.data.uses.value + 1) {

      //   }
      // }
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

  initializeScene() {
    console.log("Burger Time | Initializing Scene")
    game.scenes.active.data.tokens.forEach(async (token) => {
      const actor = game.actors.get(token.data.actorId)
      if (typeof actor === "undefined") return
      if (!actor.hasPlayerOwner) return
      if (!game.user.isGM) return
      if (!actor.getFlag('burger-time', 'lastMealAt')) {
        await initializeHunger(actor)
      }
    })
  }

  showHungerTable() {
    HungerTable.activate()
  }

  async resetHunger(actor) {
    await unsetHunger(actor)
    await initializeHunger(actor)
    Hooks.call("resetHunger", actor)
  }
}