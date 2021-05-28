CONFIG.debug.hooks = true

import registerSettings from "./lib/settings.js"
import {
  HUNGER_LEVELS,
  HUNGER_ICONS,
  DEFAULT_HUNGER_LEVEL,
  DAY
} from "./lib/constants.js"

Hooks.once('init', async => {
  BurgerTime.init()
})

class BurgerTime {
  static async init() {
    console.log("Burger Time | Initialized")

    await registerSettings()

    if (game.settings.get('burger-time', 'enabled')) {
      this.setupHooks()
    }
  }

  static setupHooks() {
    console.log("Burger Time | Setup")

    Hooks.on('ready', () => {
      this.initializeScene()
    })

    Hooks.on('preCreateToken', async (scene, token, args) => {
      const actor = game.actors.get(token.actorId)
      console.log("Burger Time | pre Create Token", actor)
      if (!actor.hasPlayerOwner) return
      if (!game.user.isGM) return
      if (!actor.getFlag('burger-time', 'lastMealAt')) {
        BurgerTime.initializeHunger(actor)
      }
    })

    Hooks.on('preDeleteToken', async(scene, token) => {
      const actor = game.actors.get(token.actorId)
      console.log("Burger Time | pre Delete Token", actor)
      // this.clearHungerTimer(actor)
    })

    Hooks.on('updateWorldTime', async (seconds, elapsed) => {
      // Skip this for GMs; hunger is only evaluated by players
      if (game.user.isGM) return

      // We want to reset hunger in these two circumstances
      // We skipped backwards
      if (elapsed < 0) {
        BurgerTime.initializeHunger(actor)
        return
      }

      // We skipped forward more than a day
      if (elapsed > DAY * 2) {
        BurgerTime.initializeHunger(actor)
        return
      }

      game.scenes.active.data.tokens.forEach(token => {
        const actor = game.actors.get(token.actorId)
        if (!actor.owner) return
        if (!actor.getFlag('burger-time', 'lastMealAt')) return

        actor.setFlag('burger-time', 'secondsSinceLastMeal', actor.getFlag('burger-time', 'secondsSinceLastMeal') + elapsed)
        const lastMealNotificationAt = actor.getFlag('burger-time', 'lastMealNotificationAt')
        const daysSinceLastMealNotification = BurgerTime.daysFromSeconds(BurgerTime.secondsAgo(lastMealNotificationAt))
        if (daysSinceLastMealNotification >= 1) {
          this.evaluate_hunger(actor)
        }
      })

    })

    Hooks.on('preUpdateOwnedItem', async (actor, item, data, action) => {
      if (data.hasOwnProperty('sort')) return

      if (game.settings.get('burger-time', 'rationName') === item.name) {
        if (item.data.quantity === data.data.quantity + 1) {
          BurgerTime.consumeFood(actor)
        }
      } else if (game.settings.get('burger-time', 'waterName') === item.name) {
        if (item.data.uses.value === data.data.uses.value + 1) {

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
      const daysSinceLastMeal = BurgerTime.daysFromSeconds(BurgerTime.secondsAgo(Number(actor.getFlag('burger-time', 'lastMealAt'))))
      const hungerIndex = BurgerTime.hungerIndex(daysSinceLastMeal)
      const hungerLevel = HUNGER_LEVELS[hungerIndex]
      el.append(`<div class='counter flexrow hunger'><h4>Hunger</h4><div class='counter-value'>${hungerLevel}</div></div>`)
    })
  }

  static initializeScene() {
    console.log("Burger Time | Initializing Scene")
    game.scenes.active.data.tokens.forEach(token => {
      const actor = game.actors.get(token.actorId)
      if (!actor.hasPlayerOwner) return
      if (!game.user.isGM) return
      if (!actor.getFlag('burger-time', 'lastMealAt')) {
        BurgerTime.initializeHunger(actor)
      }
      console.log("Burger Time |", actor, actor.data.flags['burger-time'])
    })
  }
  
  static async evaluate_hunger(actor) {
    // const daysSinceLastMeal = BurgerTime.daysFromSeconds(BurgerTime.secondsAgo(Number(actor.getFlag('burger-time', 'lastMealAt'))))
    const daysSinceLastMeal = BurgerTime.daysFromSeconds(Number(actor.getFlag('burger-time', 'secondsSinceLastMeal')))

    const hungerIndex = BurgerTime.hungerIndex(daysSinceLastMeal)
    const exhaustionLevel = Math.min((4 - hungerIndex), game.settings.get('burger-time', 'maxExhaustion'))
    if (hungerIndex <= 3) await BurgerTime.addOrUpdateHungerEffect(actor, exhaustionLevel)

    BurgerTime.hungerChatMessage(actor, hungerIndex)
    actor.setFlag('burger-time', 'lastMealNotificationAt', game.Gametime.pc.currentTime)
  }

  static secondsAgo(seconds) {
    return game.Gametime.pc.currentTime - seconds
  }

  static daysFromSeconds(seconds) {
    return Math.round(seconds / DAY)
  }

  static hungerIndex(daysSinceLastMeal) {
    return Math.max(DEFAULT_HUNGER_LEVEL - daysSinceLastMeal, 0)
  }

  static async addOrUpdateHungerEffect(actor, exhaustionLevel) {
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
    const hungerEffects = this.activeHungerEffectsFor(actor)
    if (hungerEffects.length == 0) {
      const effect = ActiveEffect.create(activeEffectConfig, actor)
      const applied = await effect.create()
      actor.setFlag('burger-time', 'hungerActiveEffect', applied._id)
    } else {
      const effect = hungerEffects[0]
      actor.updateEmbeddedEntity("ActiveEffect", Object.assign(effect, activeEffectConfig))
    }
  }

  static hungerChatMessage(actor, hungerIndex) {
    const lastMealAt = game.Gametime.DTf({ seconds: Number(actor.getFlag('burger-time', 'lastMealAt')) })

    let rations
    rations = actor.data.items.find(item => item.name === game.settings.get('burger-time', 'rationName'))
    
    const actionHtml = rations ? `Use ${game.settings.get('burger-time', 'rationName')} to regain your strength.` : `Find ${game.settings.get('burger-time', 'rationName')} soon!`

    const buttonsHtml = rations ? `<button data-action='consumeFood' data-item-id='${rations._id}' data-actor-id='${actor._id}'>Eat Now</button>` : `<button class='disabled'>No Rations</button>`

    const chatContent = `<div class='dnd5e chat-card'>
      <div class='card-header flexrow'>
        <img src="${HUNGER_ICONS[hungerIndex]}" title="Rations" width="36" height="36">
        <h3>You are ${HUNGER_LEVELS[hungerIndex]}</h3>
      </div>
      <div class='card-content'>
        <p>
          You haven't eaten since <strong>${lastMealAt.longDate().date}</strong> at <strong>${lastMealAt.longDate().time}</strong>.
        </p>
        <p>
          ${actionHtml}
        </p>
      </div>
      <div class='card-buttons'>
        ${buttonsHtml}
      </div>
      <div class='card-footer'>
        <span>${HUNGER_LEVELS[hungerIndex]}</span>
        <span>Last Meal: ${lastMealAt.shortDate().time} on ${lastMealAt.shortDate().date}</span>
        <span>Rations: ${rations ? rations.data.quantity : `None`}</span>
      </div>
    </div>`

    const message = ChatMessage.create({
      whisper: game.users.filter(user => actor.hasPerm(user, "OWNER")),
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      speaker: { actor: actor._id },
      content: chatContent,
      flavor: `Use ${game.settings.get('burger-time', 'rationName')} to satisfy your hunger.`,
      user: game.user._id
    })
  }

  static activeHungerEffectsFor(actor) {
    return actor.effects.filter(effect => effect.data.flags['burger-time'] && effect.data.flags['burger-time']['effect'] === 'hunger')
  }

  static consumeFood(actor) {
    this.removeHungerEffects(actor)
    this.initializeHunger(actor)
  }
  
  static removeHungerEffects(actor) {
    actor.effects.forEach(effect => {
      if (effect.data.label === "Hunger") {
        effect.delete()
      }
    })
    actor.setFlag('burger-time', 'hungerActiveEffect', null)
  }

  static resetHungerTimer(actor) {
    this.clearHungerTimer(actor)
    this.scheduleHungerTimer(actor)
  }

  static scheduleHungerTimer(actor) {
    const seconds = game.Gametime.pc.currentTime + DAY
    const timer = game.Gametime.doAt({ seconds: seconds }, (args) => { 
      BurgerTime.evaluate_hunger(args) 
    }, actor)
    actor.setFlag('burger-time', 'mealTimerId', timer)
  }

  static clearHungerTimer(actor) {
    if (actor.getFlag('burger-time', 'mealTimerId')) {
      game.Gametime.clearTimeout(actor.getFlag('burger-time', 'mealTimerId'))
      actor.unsetFlag('burger-time', 'mealTimerId')
    }
  }

  static initializeHunger(actor) {
    const now = game.Gametime.pc.currentTime
    actor.setFlag('burger-time', 'secondsSinceLastMeal', 0)
    actor.setFlag('burger-time', 'lastMealAt', now)
    actor.setFlag('burger-time', 'lastMealNotificationAt', now)
    actor.setFlag('burger-time', 'lastDrinkAt', now)
  }

  static unset(actor) {
    for (const key in actor.data.flags['burger-time']) {
      actor.unsetFlag('burger-time', key)
    }
  }
}