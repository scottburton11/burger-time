import { localize } from './utils.js'

export const hungerChatMessage = (actor, chatContent) => {

  ChatMessage.create({
    whisper: game.users.filter(user => actor.testUserPermission(user)),
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    speaker: { actor: actor._id },
    content: chatContent,
    flavor: `${localize('use').titleCase()} ${game.settings.get('burger-time', 'rationName')} ${localize('chat.to_satisfy_your_hunger')}.`,
    user: game.user._id
  })
}
