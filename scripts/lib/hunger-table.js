import {
  hungerLevel
} from "./hunger.js"

import {
  daysFromSeconds,
  secondsAgo
} from './time.js'

import {
  HOUR
} from './constants.js'

let hungerTable;
export default class HungerTable extends Application {
  constructor(object = {}, options = null) {
    super(object, options)
  }

  static activate(system) {
    if (hungerTable) {
      hungerTable.render(true)
    } else {
      hungerTable = new HungerTable()
      hungerTable.system = system
      Hooks.on('evaluateHunger', async () => { hungerTable.render(true) })
      Hooks.on('addOrUpdateHungerEffect', async () => { hungerTable.render(false) })
      Hooks.on('removeHungerEffects', async () => { hungerTable.render(true) })
      Hooks.on('consumeFood', async () => { hungerTable.render(true) })
      Hooks.on('updateHunger', async () => { hungerTable.render(true) })
      Hooks.on('resetHunger', async () => { hungerTable.render(true) })
      Hooks.on('initializeHunger', async () => { hungerTable.render(true) })
      Hooks.on('unsetHunger', async () => { hungerTable.render(true) })
      Hooks.on('createActor', async () => { hungerTable.render(true) })
      Hooks.on('updateWorldTime', async () => { hungerTable.render(true) })
  
      hungerTable.render(true)
    }
    return hungerTable
  }

  getData() {
    return {
      actors: game.actors.filter(actor => actor.hasPlayerOwner).map(a => {
        const actor = game.actors.get(a.id)
        return {
          name: actor.name, 
          lastMealAt: this.formattedDate(actor.getFlag('burger-time', 'lastMealAt')),
          lastNotified: this.formattedDate(actor.getFlag('burger-time', 'lastMealNotificationAt')),
          daysSinceLastNotified: daysFromSeconds(secondsAgo(actor.getFlag('burger-time', 'lastMealNotificationAt'))),
          secondsSinceLastMeal: actor.getFlag('burger-time', 'secondsSinceLastMeal'),
          hoursSinceLastMeal: Math.round((actor.getFlag('burger-time', 'secondsSinceLastMeal') / HOUR) * 100)/100,
          hunger: hungerLevel(this.system.daysHungryForActor(actor)),
        }
      })
    }
  }

  formattedDate(seconds) {
    if (!seconds) return ''
    return SimpleCalendar.api.timestampToDate(seconds)
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.template = "modules/burger-time/templates/hunger_table.html";
    options.minimizable = true;
    options.resizable = true;
    options.title = "Hunger";
    return options;
  }
}