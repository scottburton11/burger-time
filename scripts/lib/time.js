import {
  DAY
} from "./constants.js"

export const secondsAgo = (seconds) => {
  return game.Gametime.pc.currentTime - seconds
}

export const daysFromSeconds = (seconds) => {
  return Math.floor(seconds / DAY)
}
