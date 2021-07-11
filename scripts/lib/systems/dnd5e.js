import {
  secondsAgo,
  daysFromSeconds
} from "../time.js"

import {
  hungerChatMessage
} from "../chat.js"

import {
  hungerLevel,
  hungerIcon,
  addOrUpdateHungerEffect
} from "../hunger.js"

import { localize } from '../utils.js'

export default class DND5eSystem {
  constructor(system) {
    this.system = system

    Hooks.on('renderActorSheet5eCharacter', async (app, html, sheet) => {
      const el = $(html).find('.counters')
      const actor = game.actors.get(sheet.actor._id)
      el.append(`<div class='counter flexrow hunger'><h4>Hunger</h4><div class='counter-value'>${hungerLevel(this.daysHungryForActor(actor))}</div></div>`)
    })
  }
  
  async evaluateHunger(actor) {
    const lastMealNotificationAt = actor.getFlag('burger-time', 'lastMealNotificationAt')
    const daysSinceLastMealNotification = daysFromSeconds(secondsAgo(lastMealNotificationAt))
    if (daysSinceLastMealNotification >= 1) {
      const daysHungry = this.daysHungryForActor(actor)
      
      if (daysHungry > 0) {
        const config = this.activeEffectConfig(actor, daysHungry)
        await addOrUpdateHungerEffect(actor, config)
      }
  
      const chatContent = this.chatContent(actor, daysHungry)

      hungerChatMessage(actor, chatContent)
      await actor.setFlag('burger-time', 'lastMealNotificationAt', game.Gametime.pc.currentTime)
      Hooks.call('evaluateHunger', actor)
    }
  }

  daysHungryForActor(actor) {
    const daysSinceLastMeal = daysFromSeconds(Number(actor.getFlag('burger-time', 'secondsSinceLastMeal')))
    const hungerTolerance = Math.max(actor.data.data.abilities.con.mod, 1)
    const daysHungry = Math.max(daysSinceLastMeal - hungerTolerance, 0)
    return daysHungry
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

  chatContent(actor, daysHungry) {
    const lastMealAt = game.Gametime.DTf({ seconds: Number(actor.getFlag('burger-time', 'lastMealAt')) })

    let rations
    rations = actor.data.items.find(item => item.name === game.settings.get('burger-time', 'rationName'))

    const actionHtml = rations ? `${localize('use').titleCase()} ${game.settings.get('burger-time', 'rationName')} ${localize('chat.to_regain_your_strength')}.` : `Find ${game.settings.get('burger-time', 'rationName')} soon!`

    const buttonsHtml = rations ? `<button data-action='consumeFood' data-item-id='${rations._id}' data-actor-id='${actor._id}'>Eat Now</button>` : `<button class='disabled'>No Rations</button>`

    const hunger = hungerLevel(daysHungry)

    const chatContent = `<div class='dnd5e chat-card'>
      <div class='card-header flexrow'>
        <img src="${hungerIcon(daysHungry)}" title="Rations" width="36" height="36">
        <h3>${localize('chat.you_are')} ${hunger}</h3>
      </div>
      <div class='card-content'>
        <p>
          ${localize('chat.eaten_since')} <strong>${lastMealAt.longDate().date}</strong> ${localize('at')} <strong>${lastMealAt.longDate().time}</strong>.
        </p>
        <p>
          ${actionHtml}
        </p>
      </div>
      <div class='card-buttons'>
        ${buttonsHtml}
      </div>
      <div class='card-footer'>
        <span>${hunger}</span>
        <span>Last Meal: ${lastMealAt.shortDate().time} ${localize('on')} ${lastMealAt.shortDate().date}</span>
        <span>Rations: ${rations ? rations.data.data.quantity : localize('none').titleCase()}</span>
      </div>
    </div>`
    
    return chatContent
  }
}