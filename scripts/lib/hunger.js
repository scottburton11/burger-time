import {
  DEFAULT_HUNGER_LEVEL,
  HUNGER_LEVELS,
} from './constants.js'

import {
  daysFromSeconds,
  secondsAgo
} from './time.js'

import {
  hungerChatMessage
} from "./chat.js"

export const hungerIndex = (daysSinceLastMeal) => {
  return Math.max(DEFAULT_HUNGER_LEVEL - daysSinceLastMeal, 0)
}

export const hungerLevel = (actor) => {
  return HUNGER_LEVELS[hungerIndex(daysFromSeconds(Number(actor.getFlag('burger-time', 'secondsSinceLastMeal'))))] || "Unknown"
}

export const evaluateHunger = async (actor) => {
  const daysSinceLastMeal = daysFromSeconds(Number(actor.getFlag('burger-time', 'secondsSinceLastMeal')))

  const exhaustionLevel = Math.min((4 - hungerIndex(daysSinceLastMeal)), game.settings.get('burger-time', 'maxExhaustion'))
  if (hungerIndex(daysSinceLastMeal) <= 3) {
    await addOrUpdateHungerEffect(actor, exhaustionLevel)
  }

  hungerChatMessage(actor, hungerIndex(daysSinceLastMeal))
  actor.setFlag('burger-time', 'lastMealNotificationAt', game.Gametime.pc.currentTime)

  Hooks.call('evaluateHunger', actor)
}

export const addOrUpdateHungerEffect = async (actor, exhaustionLevel) => {
  const activeEffectConfig = {
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
  let effect;
  const hungerEffects = activeHungerEffectsFor(actor)
  if (hungerEffects.length == 0) {
    effect = ActiveEffect.create(activeEffectConfig, actor)
    const applied = await effect.create()
    actor.setFlag('burger-time', 'hungerActiveEffect', applied._id)
  } else {
    effect = hungerEffects[0]
    actor.updateEmbeddedEntity("ActiveEffect", Object.assign(effect.data, activeEffectConfig))
  }

  Hooks.call('addOrUpdateHungerEffect', actor, effect)
}

export const activeHungerEffectsFor = (actor) => {
  return actor.effects.filter(effect => effect.data.flags['burger-time'] && effect.data.flags['burger-time']['effect'] === 'hunger')
}

export const consumeFood = (actor) => {
  removeHungerEffects(actor)
  initializeHunger(actor)
  
  Hooks.call('consumeFood', actor)
}
  
export const removeHungerEffects = (actor) => {
  actor.effects.forEach(effect => {
    if (effect.data.label === "Hunger") {
      effect.delete()
    }
  })
  actor.setFlag('burger-time', 'hungerActiveEffect', null)
}

export const initializeHunger = async (actor) => {
  const now = game.Gametime.pc.currentTime
  await actor.setFlag('burger-time', 'secondsSinceLastMeal', 0)
  await actor.setFlag('burger-time', 'lastMealAt', now)
  await actor.setFlag('burger-time', 'lastMealNotificationAt', now)
  await actor.setFlag('burger-time', 'lastDrinkAt', now)
}

export const unset = (actor) => {
  for (const key in actor.data.flags['burger-time']) {
    actor.unsetFlag('burger-time', key)
  }
}
