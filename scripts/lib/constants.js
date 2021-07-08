const HUNGER_LEVELS = [
  'starving',
  'famished',
  'ravenous',
  'hungry',
  'packish',
  'satisfied',
  'full',
  'stuffed'
]

const HUNGER_ICONS = [
  'systems/dnd5e/icons/skills/affliction_03.jpg',
  "systems/dnd5e/icons/items/inventory/monster-head.jpg",
  'systems/dnd5e/icons/skills/blood_07.jpg',
  'icons/commodities/claws/claw-bear-brown-grey.webp',
  'icons/consumables/food/plate-fish-bowl-bones-brown.webp',
  'systems/dnd5e/icons/skills/light_07.jpg',
  'systems/dnd5e/icons/items/inventory/teeth.jpg',
  'systems/dnd5e/icons/items/inventory/piggybank.jpg',
]

const DEFAULT_HUNGER_LEVEL = 5

const SECOND = 1
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

export {
  HUNGER_LEVELS,
  HUNGER_ICONS,
  DEFAULT_HUNGER_LEVEL,
  SECOND,
  MINUTE,
  HOUR,
  DAY,
}