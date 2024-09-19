import { Card, Player } from "./types";

export const setPlayer = (playerNum: number) => {
  const players: Player[] = [];

  for (let i = 0; i < playerNum; i++) {
    const playerObj: Player = {
      playerId: i < playerNum - 1 ? `Ai${i + 1}` : "Human",
      hand: [],
      order: 0,
    };
    players.push(playerObj);
  }

  return players;
};

export const createDeck = (maxRank: number) => {
  const deck: Card[] = [];

  const joker: Card = {
    rank: "JOKER",
    value: 13,
  };

  for (let i = 1; i <= maxRank; i++) {
    for (let j = 0; j < i; j++) {
      const cardObj: Card = {
        rank: `RANK${i}`,
        value: i,
      };
      deck.push(cardObj);
    }
  }

  for (let i = 0; i <= 2; i++) {
    deck.push(joker);
  }

  return deck;
};

export const shuffleDeck = (deck: Card[]) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const targetIdx = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[targetIdx]] = [deck[targetIdx], deck[i]];
  }
  return deck;
};

export const dealDeck = (
  deck: Card[],
  players: Player[],
  type: "setting" | "game"
) => {
  const copiedDeck = [...deck];
  const copiedPlayers = [...players];

  copiedPlayers.forEach((player) => {
    if (copiedDeck.length) {
      player.hand.push(copiedDeck[copiedDeck.length - 1]);
      copiedDeck.pop();
    }
  });

  if (type === "game") {
    if (copiedDeck.length > 0) dealDeck(copiedDeck, copiedPlayers, "game");
  }

  return copiedPlayers;
};

export const sortPlayer = (
  deck: Card[],
  players: Player[],
  type: "setting" | "game"
) => {
  let sortedPlayer;

  switch (type) {
    case "setting": {
      sortedPlayer = players.sort((a, b) => {
        const { value: aVal } = a.hand[0];
        const { value: bVal } = b.hand[0];

        if (aVal === bVal) {
          const cVal = deck[deck.length - 1].value;
          deck.pop();
          const dVal = deck[deck.length - 2].value;
          deck.pop();

          return cVal - dVal;
        } else {
          return aVal - bVal;
        }
      });

      sortedPlayer.forEach((player, idx) => (player.order = idx));

      break;
    }

    // case "game": {

    //   break;
    // }

    default:
      break;
  }

  return sortedPlayer as Player[];
};

export const setDelay = async (ms:number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}