const deckModule = require('./deck');

module.exports = {
  initPlayers(room, deck) {
    let players = [];

    for (const uid of room.players) {
      players.push({
        uid: uid,
        score: 0,
        handicap: {accident: false, breakdown: false, limit: false, puncture: false, red: false},
        bonus: {tank: false, increvable: false, priority: false, as: false},
        hand: [
          deckModule.pick(deck),
          deckModule.pick(deck),
          deckModule.pick(deck),
          deckModule.pick(deck),
          deckModule.pick(deck),
          deckModule.pick(deck)
        ]
      })
    }
    return (players);
  }
};
