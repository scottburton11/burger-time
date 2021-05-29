import {
  hungerIndex,
  hungerLevel
} from "./hunger.js"

import {
  daysFromSeconds,
  secondsAgo
} from './time.js'

import {
  HOUR
} from './constants.js'

export default class HungerTable extends Application {
  constructor(object = {}, options = null) {
    super(object, options)
  }

  getData() {
    return {
      actors: game.actors.map(a => {
        const actor = game.actors.get(a._id)
        return {
          name: actor.name, 
          lastMealAt: this.formattedDate(actor.getFlag('burger-time', 'lastMealAt')),
          lastNotified: this.formattedDate(actor.getFlag('burger-time', 'lastMealNotificationAt')),
          daysSinceLastNotified: daysFromSeconds(secondsAgo(actor.getFlag('burger-time', 'lastMealNotificationAt'))),
          secondsSinceLastMeal: actor.getFlag('burger-time', 'secondsSinceLastMeal'),
          hoursSinceLastMeal: Math.round((actor.getFlag('burger-time', 'secondsSinceLastMeal') / HOUR) * 100)/100,
          hunger: hungerLevel(actor),
        }
      })
    }
  }

  formattedDate(seconds) {
    if (!seconds) return ''
    return game.Gametime.DTf({ seconds }).shortDate()
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