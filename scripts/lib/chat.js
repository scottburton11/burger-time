import {
  HUNGER_LEVELS,
  HUNGER_ICONS,
} from "./constants.js"


const localize = (key) => {
  return game.i18n.localize(`BURGER_TIME.${key}`)
}

export const hungerChatMessage = (actor, hungerIndex) => {
  const lastMealAt = game.Gametime.DTf({ seconds: Number(actor.getFlag('burger-time', 'lastMealAt')) })

  let rations
  rations = actor.data.items.find(item => item.name === game.settings.get('burger-time', 'rationName'))

  const actionHtml = rations ? `${localize('use').titleCase()} ${game.settings.get('burger-time', 'rationName')} ${localize('chat.to_regain_your_strength')}.` : `Find ${game.settings.get('burger-time', 'rationName')} soon!`

  const buttonsHtml = rations ? `<button data-action='consumeFood' data-item-id='${rations._id}' data-actor-id='${actor._id}'>Eat Now</button>` : `<button class='disabled'>No Rations</button>`

  const hunger = localize(`hunger.${HUNGER_LEVELS[hungerIndex]}`)
  
  const chatContent = `<div class='dnd5e chat-card'>
      <div class='card-header flexrow'>
        <img src="${HUNGER_ICONS[hungerIndex]}" title="Rations" width="36" height="36">
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

  ChatMessage.create({
    whisper: game.users.filter(user => actor.hasPerm(user, "OWNER")),
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    speaker: { actor: actor._id },
    content: chatContent,
    flavor: `${localize('use').titleCase()} ${game.settings.get('burger-time', 'rationName')} ${localize('chat.to_satisfy_your_hunger')}.`,
    user: game.user._id
  })
}
