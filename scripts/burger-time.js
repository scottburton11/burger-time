import registerSettings from "./lib/settings.js"
import {
  DAY
} from "./lib/constants.js"

import {
  consumeFood,
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
      // if (!actor.hasPlayerOwner) return
      if (!game.user.isGM) return
      if (!actor.getFlag('burger-time', 'lastMealAt')) {
        await initializeHunger(actor)
      }
    })

    Hooks.on('preDeleteToken', async(document, data) => {
      const actor = game.actors.get(document.data.actorId)
      // this.clearHungerTimer(actor)
    })

    let _sessionTime = 0;
    const EVAL_FREQUENCY = 30;

    Hooks.on('updateWorldTime', async (seconds, elapsed) => {
      _sessionTime += elapsed;
      if (_sessionTime < EVAL_FREQUENCY) return
      _sessionTime = 0;

      if (!game.scenes.active) return
      if (!game.user.isGM) return

      const activeUsers = game.users.filter(user => user.active && !user.isGM)

      game.scenes.active.data.tokens.forEach(async token => {
        const actor = game.actors.get(token.data.actorId)
        // We want to skip non-actors and non-player controlled characters
        if (typeof actor === 'undefined') return
        if (!actor.hasPlayerOwner) return

        // We want to reset hunger in these two circumstances
        // We skipped backwards by more than 5m
        if (elapsed < -300) {
          await initializeHunger(actor)
          return
        }

        // We skipped forward more than a day
        if (elapsed > DAY * 2) {
          await initializeHunger(actor)
          return
        }

        // We also want to skip any player who is not logged in if skipMissingPlayers is on
        let activeUser;
        activeUser = activeUsers.find(user => actor.testUserPermission(user, "OWNER"))
        if (!activeUser && game.settings.get('burger-time', 'skipMissingPlayers')) return

        await updateHunger(actor, elapsed)

        await this.system.evaluateHunger(actor)
      })
    })
    
    Hooks.on('preUpdateItem', async (item, change) => {
      if (change.hasOwnProperty('sort')) return

      if (game.settings.get('burger-time', 'rationName') === item.name) {
        if (item.data.data.uses.value === change.data.uses.value + 1) {
          const actor = await game.actors.get(item.actor.id);
          await consumeFood(actor)
        }
      } 
      // else if (game.settings.get('burger-time', 'waterName') === item.name) {
      //   if (item.data.data.uses.value === data.data.uses.value + 1) {

      //   }
      // }
    })

    Hooks.on('renderChatLog', async (app, html, data) => {
      html.on('click', "button[data-action='consumeFood']", (event) => {
        const actor = game.actors.get(event.target.dataset.actorId);
        const item = actor.items.get(event.target.dataset.itemId);
        return item.roll();
      })
    })
  }

  initializeScene() {
    console.log("Burger Time | Initializing Scene")
    if (!game.scenes.active) return
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
    HungerTable.activate(this.system)
  }

  async resetHunger(actor) {
    await unsetHunger(actor)
    await initializeHunger(actor)
    Hooks.call("resetHunger", actor)
  }
}