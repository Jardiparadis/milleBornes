module.exports = {

  "25": (cardOwner) => {
    console.log(25);
    console.log('lol');
    cardOwner.score += 25;
  },

  "50": (cardOwner) => {
    console.log(50);
    console.log('lol');
    cardOwner.score += 50;
  },

  "75": (cardOwner) => {
    console.log(75);
    console.log('lol');
    cardOwner.score += 75;
  },

  "100": (cardOwner) => {
    console.log(100);
    console.log('lol');
    cardOwner.score += 100;
  },

  "200": (cardOwner) => {
    console.log(200);
    console.log('lol');
    cardOwner.score += 200;
  },

  "accident": (cardOwner, target) => {
    target.handicap.accident = true;
  },

  "as": (cardOwner, target) => {
    cardOwner.bonus.as = true;
  },

  "breakdown": (cardOwner, target) => {
    target.handicap.breakdown = true;
  },

  "gasoline": (cardOwner) => {
    cardOwner.handicap.breakdown = false;
  },

  "green": (cardOwner) => {
    cardOwner.handicap.red = false;
  },

  "increvable": (cardOwner) => {
    cardOwner.bonus.increvable = true;
  },

  "limit": (cardOwner, target) => {
    target.handicap.limit = true;
  },

  "priority": (cardOwner) => {
    cardOwner.bonus.priority = true;
  },

  "puncture": (cardOwner, target) => {
    target.handicap.puncture = true;
  },

  "red": (cardOwner, target) => {
    target.handicap.red = true;
  },

  "repair": (cardOwner, target) => {
    target.handicap.accident = false;
  },

  "stop_limit": (cardOwner, target) => {
    cardOwner.handicap.limit = false;
  },

  "tank": (cardOwner, target) => {
    cardOwner.bonus.tank = true;
  },

  "wheel": (cardOwner, target) => {
    cardOwner.handicap.puncture = false;
  },
};

/*
* TODO cards effect
* TODO enemy player dropable
* TODO Display bonus/malus for player
* TODO handle disconnection
* TODO add name to player
* TODO win condition
* TODO block access to full room
* TODO remove empty room
* TODO must wait for at least 2 players to start
* TODO unbind all event handler when changing views
* TODO add the trash
* */
