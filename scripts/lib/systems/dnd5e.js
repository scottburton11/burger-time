import {
  secondsAgo,
  daysFromSeconds
} from "../time.js"

import {
  hungerChatMessage
} from "../chat.js"

import {
  hungerIndex,
  addOrUpdateHungerEffect
} from "../hunger.js"

export default class DND5eSystem {
  constructor(system) {
    this.system = system
  }
  
  async evaluateHunger(actor) {
    const lastMealNotificationAt = actor.getFlag('burger-time', 'lastMealNotificationAt')
    const daysSinceLastMealNotification = daysFromSeconds(secondsAgo(lastMealNotificationAt))
    if (daysSinceLastMealNotification >= 1) {
      const daysSinceLastMeal = daysFromSeconds(Number(actor.getFlag('burger-time', 'secondsSinceLastMeal')))
  
      const exhaustionLevel = Math.min((4 - hungerIndex(daysSinceLastMeal)), game.settings.get('burger-time', 'maxExhaustion'))
      if (hungerIndex(daysSinceLastMeal) <= 3) {
        const config = this.activeEffectConfig(actor, exhaustionLevel)
        await addOrUpdateHungerEffect(actor, config)
      }
  
      hungerChatMessage(actor, hungerIndex(daysSinceLastMeal))
      await actor.setFlag('burger-time', 'lastMealNotificationAt', game.Gametime.pc.currentTime)
      Hooks.call('evaluateHunger', actor)
    }
  }
  
  activeEffectConfig(actor, exhaustionLevel) {
    return {
      label: "Hunger",
      icon: "icons/sundries/misc/teeth-dentures.webp",
      origin: actor.uuid,
      changes: [
        {
          key: 'data.attributes.exhaustion',
          value: exhaustionLevel,
          mode: 2,
        }
      ],
      transfer: false,
      flags: {
        'burger-time': {
          effect: 'hunger'
        }
      }
    }
  }
}