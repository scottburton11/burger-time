import {
  HUNGER_LEVELS,
  HUNGER_ICONS,
} from "./constants.js"


export const hungerChatMessage = (actor, hungerIndex) => {
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

  ChatMessage.create({
    whisper: game.users.filter(user => actor.hasPerm(user, "OWNER")),
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    speaker: { actor: actor._id },
    content: chatContent,
    flavor: `Use ${game.settings.get('burger-time', 'rationName')} to satisfy your hunger.`,
    user: game.user._id
  })
}