import {
  DEFAULT_HUNGER_LEVEL,
  HUNGER_LEVELS,
  HUNGER_ICONS,
} from './constants.js'

export const hungerLevel = (daysHungry) => {
  const level = HUNGER_LEVELS[hungerIndex(daysHungry)] || "unknown"
  return game.i18n.localize(`BURGER_TIME.hunger.${level}`)
}

export const hungerIcon = (daysHungry) => {
  return HUNGER_ICONS[hungerIndex(daysHungry)]
}

export const hungerIndex = (daysHungry) => {
  return Math.max(DEFAULT_HUNGER_LEVEL - daysHungry, 0)
}

export const updateHunger = async (actor, elapsed) => {
  const seconds = actor.getFlag('burger-time', 'secondsSinceLastMeal')
  if (typeof seconds === 'undefined') return

  await actor.setFlag('burger-time', 'secondsSinceLastMeal', seconds + elapsed)

  Hooks.call('updateHunger', actor)
}

export const activeHungerEffectsFor = (actor) => {
  return actor.effects.filter(effect => effect.data.flags['burger-time'] && effect.data.flags['burger-time']['effect'] === 'hunger')
}

export const addOrUpdateHungerEffect = async (actor, activeEffectConfig) => {
  let effect;
  const hungerEffects = activeHungerEffectsFor(actor)
  if (hungerEffects.length == 0) {
    effect = await actor.createEmbeddedEntity('ActiveEffect', activeEffectConfig)
    await actor.setFlag('burger-time', 'hungerActiveEffect', effect.id)
  } else {
    effect = hungerEffects[0]
    actor.updateEmbeddedEntity("ActiveEffect", Object.assign(effect.data, activeEffectConfig))
  }

  Hooks.call('addOrUpdateHungerEffect', actor, effect)
}

export const consumeFood = async (actor) => {
  await removeHungerEffects(actor)
  await initializeHunger(actor)
  
  Hooks.call('consumeFood', actor)
}
  
export const removeHungerEffects = async (actor) => {
  actor.effects.forEach(effect => {
    if (effect.data.label === "Hunger") {
      effect.delete()
    }
  })
  await actor.setFlag('burger-time', 'hungerActiveEffect', null)
  Hooks.call('removeHungerEffects', actor)
}

export const initializeHunger = async (actor) => {
  const now = game.Gametime.pc.currentTime
  await Promise.all([
    actor.setFlag('burger-time', 'secondsSinceLastMeal', 0),
    actor.setFlag('burger-time', 'lastMealAt', now),
    actor.setFlag('burger-time', 'lastMealNotificationAt', now),
    actor.setFlag('burger-time', 'lastDrinkAt', now),
  ])
  Hooks.call('initializeHunger', actor)
}

export const unsetHunger = async (actor) => {
  for (const key in actor.data.flags['burger-time']) {
    await actor.unsetFlag('burger-time', key)
  }
  Hooks.call('unsetHunger', actor)
}
