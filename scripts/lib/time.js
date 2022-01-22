import {
  DAY
} from "./constants.js"

export const secondsAgo = (seconds) => {
  return game.time.worldTime - seconds
}

export const daysFromSeconds = (seconds) => {
  return Math.floor(seconds / DAY)
}
