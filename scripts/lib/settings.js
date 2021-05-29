const registerSettings = async () => {
  await game.settings.register('burger-time', 'enabled', {
    name: "Enable Burger Time",
    hint: "All player-controlled actors will be subject to hunger rules",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  })

  await game.settings.register('burger-time', 'rationsPerDay', {
    name: "Rations Per Day",
    hint: "Each actor consumes this number of rations per day",
    scope: "world",
    config: true,
    type: Number,
    default: 1,
  })

  // await game.settings.register('burger-time', 'thirstEnabled', {
  //   name: "[COMING SOON] Enable Thirst",
  //   hint: "Also subject players to water rules; players will need to drink water and maintain waterskins",
  //   scope: "world",
  //   config: true,
  //   type: Boolean,
  //   default: true,
  // })

  // await game.settings.register('burger-time', 'waterPerDay', {
  //   name: "Water Per Day",
  //   hint: "Each actor consumes this amount of water per day in charges",
  //   scope: "world",
  //   config: true,
  //   type: Number,
  //   default: 1,
  // })

  await game.settings.register('burger-time', 'maxExhaustion', {
    name: "Max Exhaustion to apply",
    hint: "Apply no more than this many levels of exhaustion due to hunger and thirst",
    scope: "world",
    config: true,
    type: Number,
    default: 2,
  })

  await game.settings.register('burger-time', 'rationName', {
    name: "Ration Name",
    hint: "Use this item name for rations",
    scope: "world",
    config: true,
    type: String,
    default: "Rations",
  })

//   await game.settings.register('burger-time', 'waterName', {
//     name: "Waterskin Name",
//     hint: "Use this item name for waterskins",
//     scope: "world",
//     config: true,
//     type: String,
//     default: "Waterskin",
//   })
// }

export default registerSettings