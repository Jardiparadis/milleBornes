const shuffleArray = require('shuffle-array');

module.exports = {

  fillDeck(deck, card, nbr) {
    for (let i = 0; i !== nbr; ++i) {
      deck.push(card);
    }
  },

  initDeck() {
    let deck = [];

    this.fillDeck(deck, '25', 10);
    this.fillDeck(deck, '50', 10);
    this.fillDeck(deck, '75', 10);
    this.fillDeck(deck, '100', 12);
    this.fillDeck(deck, '200', 4);
    this.fillDeck(deck, 'accident', 3);
    this.fillDeck(deck, 'as', 1);
    this.fillDeck(deck, 'breakdown', 3);
    this.fillDeck(deck, 'gasoline', 6);
    this.fillDeck(deck, 'green', 14);
    this.fillDeck(deck, 'increvable', 1);
    this.fillDeck(deck, 'limit', 4);
    this.fillDeck(deck, 'priority', 1);
    this.fillDeck(deck, 'puncture', 3);
    this.fillDeck(deck, 'red', 5);
    this.fillDeck(deck, 'repair', 6);
    this.fillDeck(deck, 'stop_limit', 6);
    this.fillDeck(deck, 'tank', 1);
    this.fillDeck(deck, 'wheel', 6);
    return (shuffleArray(deck));
  },

  pick(deck) {
    let card = deck[0];
    deck.splice(0, 1);
    return (card);
  }
};
