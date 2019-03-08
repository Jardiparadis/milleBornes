function hasOneOfTheseBonus(playerToCheck, bonusToCheck) {
  for (const bonus of bonusToCheck) {
    if (playerToCheck.bonus[bonus] === true) {
      return (true);
    }
  }
  return (false);
}

function hasOneOfTheseHandicap(playerToCheck, handicapToCheck) {
  for (const handicap of handicapToCheck) {
    if (playerToCheck.handicap[handicap] === true) {
      return (true);
    }
  }
  return (false);
}

function setRed(target) {
  if (!target)
    return false;
  if (target.handicap.red === true || target.bonus.priority === true) {
    return (false);
  }
  target.handicap.red = true;
  return (true);
}

module.exports = {

  "25": (cardOwner) => {
    let forbiddenState = ['red', 'accident', 'puncture', 'accident'];

    if (cardOwner.bonus.priority === true) {
      forbiddenState.splice(1, 1);
    }
    if (hasOneOfTheseHandicap(cardOwner, forbiddenState) === true) {
      return (false);
    }
    cardOwner.score += 25;
    return (true);
  },

  "50": (cardOwner) => {
    let forbiddenState = ['red', 'accident', 'puncture', 'accident'];

    if (cardOwner.bonus.priority === true) {
      forbiddenState.splice(1, 1);
    }
    if (hasOneOfTheseHandicap(cardOwner, forbiddenState) === true) {
      return (false);
    }
    cardOwner.score += 50;
    return (true);
  },

  "75": (cardOwner) => {
    let forbiddenState = ['red', 'limit', 'accident', 'puncture', 'breakdown'];

    if (cardOwner.bonus.priority === true) {
      forbiddenState.splice(1, 2);
    }
    if (hasOneOfTheseHandicap(cardOwner, forbiddenState) === true) {
      return (false);
    }
    cardOwner.score += 75;
    return (true);
  },

  "100": (cardOwner) => {
    let forbiddenState = ['red', 'limit', 'accident', 'puncture', 'breakdown'];

    if (cardOwner.bonus.priority === true) {
      forbiddenState.splice(1, 2);
    }
    if (hasOneOfTheseHandicap(cardOwner, forbiddenState) === true) {
      return (false);
    }
    cardOwner.score += 100;
    return (true);
  },

  "200": (cardOwner) => {
    let forbiddenState = ['red', 'limit', 'accident', 'puncture', 'breakdown'];

    if (cardOwner.bonus.priority === true) {
      forbiddenState.splice(1, 2);
    }
    if (hasOneOfTheseHandicap(cardOwner, forbiddenState) === true) {
      return (false);
    }
    cardOwner.score += 200;
    return (true);
  },

  "accident": (cardOwner, target) => {
    if (!target)
      return false;
    if (target.handicap.accident === true || target.bonus.as === true) {
      return (false);
    }
    target.handicap.accident = true;
    return (true);
  },

  "as": (cardOwner) => {
    cardOwner.bonus.as = true;
    cardOwner.handicap.accident = false;
    return (true);
  },

  "breakdown": (cardOwner, target) => {
    if (!target)
      return false;
    if (target.handicap.breakdown === true || target.bonus.tank === true) {
      return (false);
    }
    target.handicap.breakdown = true;
    return (true);
  },

  "gasoline": (cardOwner) => {
    if (cardOwner.handicap.breakdown === false) {
      return (false);
    }
    cardOwner.handicap.breakdown = false;
    setRed(cardOwner);
    return (true);
  },

  "green": (cardOwner) => {
    if (cardOwner.handicap.red === false) {
      return (false);
    }
    cardOwner.handicap.red = false;
    return (true);
  },

  "increvable": (cardOwner) => {
    cardOwner.bonus.increvable = true;
    cardOwner.handicap.puncture = false;
    return (true);
  },

  "limit": (cardOwner, target) => {
    if (!target)
      return false;
    if (target.handicap.limit === true || target.bonus.priority === true) {
      return (false);
    }
    target.handicap.limit = true;
    return (true);
  },

  "priority": (cardOwner) => {
    cardOwner.bonus.priority = true;
    cardOwner.handicap.red = false;
    cardOwner.handicap.limit = false;
    return (true);
  },

  "puncture": (cardOwner, target) => {
    if (!target)
      return false;
    if (target.handicap.puncture === true || target.bonus.increvable === true) {
      return (false);
    }
    target.handicap.puncture = true;
    return (true);
  },

  "red": (cardOwner, target) => {
    if (!target)
      return false;
    if (target.handicap.red === true || target.bonus.priority === true) {
      return (false);
    }
    target.handicap.red = true;
    return (true);
  },

  "repair": (cardOwner) => {
    if (cardOwner.handicap.accident === false) {
      return (false);
    }
    cardOwner.handicap.accident = false;
    setRed(cardOwner);
    return (true);
  },

  "stop_limit": (cardOwner) => {
    if (cardOwner.handicap.limit === false) {
      return (false);
    }
    cardOwner.handicap.limit = false;
    return (true);
  },

  "tank": (cardOwner) => {
    cardOwner.bonus.tank = true;
    cardOwner.handicap.breakdown = false;
    return (true);
  },

  "wheel": (cardOwner) => {
    if (cardOwner.handicap.puncture === false) {
      return (false);
    }
    cardOwner.handicap.puncture = false;
    setRed(cardOwner);
    return (true);
  },
};

/*
* TODO block access to full room
* TODO remove empty room
* TODO must wait for at least 2 players to start
* TODO unbind all event handler when changing views
* */
