import { localize } from './utils.js'

export const hungerChatMessage = (actor, chatContent) => {

  const recipients = game.users.filter((user) => {
      return actor.testUserPermission(user, foundry.CONST.DOCUMENT_PERMISSION_LEVELS['OBSERVER'])
    }).map(user => user.id)
  
  ChatMessage.create({
    whisper: recipients,
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    speaker: { actor: actor.id },
    content: chatContent,
    flavor: `${localize('use').titleCase()} ${game.settings.get('burger-time', 'rationName')} ${localize('chat.to_satisfy_your_hunger')}.`,
    user: game.user.id
  })
}
