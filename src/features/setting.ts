import { CardTypes, PlayerTypes } from "./settingTypes";

export const setPlayer = (playerNum: number) => {
  const players: PlayerTypes[] = [];

  for (let i = 0; i < playerNum; i++) {
    const playerObj: PlayerTypes = {
      id: i < playerNum - 1 ? `Ai${i + 1}` : "Human",
      get name () {
        return this.id === "Human" ? "YOU" : `COM${i + 1}`;
      },
      hand: [],
      order: i,
    };
    players.push(playerObj);
  }

  return players;
};

export const createDeck = (maxRank: number) => {
  const deck: CardTypes[] = [];

  for (let i = 1; i <= maxRank; i++) {
    for (let j = 0; j < i; j++) {
      const cardObj: CardTypes = {
        id: `CID${i}-${j}`,
        rank: `RANK${i}`,
        value: i,
      };
      deck.push(cardObj);
    }
  }

  for (let i = 0; i <= 2; i++) {
    const joker: CardTypes = {
      id: `CID13-${i}`,
      rank: "JOKER",
      value: 13,
    };
    deck.push(joker);
  }

  return deck;
};

export const shuffleDeck = (deck: CardTypes[]) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const targetIdx = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[targetIdx]] = [deck[targetIdx], deck[i]];
  }
  return deck;
};

export const dealDeck = (
  deck: CardTypes[],
  players: PlayerTypes[],
  type: "setting" | "game"
) => {
  const copiedDeck = deck.map(card => ({...card}));
  const copiedPlayers = players.map(player => ({
    ...player,
    hand: [...player.hand]
  }));

  const distributeCards = (players: PlayerTypes[], deck: CardTypes[]) => {
    for (let i = 0; i < players.length; i++) {
      if (deck.length) {
        players[i].hand.push(deck.pop()!);
      }
    }
  };

  if (type === "game") {
    
    while(copiedDeck.length > 0){
      distributeCards(copiedPlayers, copiedDeck);
    }

  }else {
    distributeCards(copiedPlayers, copiedDeck);
  }

  return {
    players: copiedPlayers as PlayerTypes[],
    deck: copiedDeck as CardTypes[]
  };
};

export const sortPlayer = (
  deck: CardTypes[],
  players: PlayerTypes[],
  type: "setting" | "game"
) => {
  let sortedPlayer;
  let copiedDeck:CardTypes[];

  switch (type) {
    case "setting": {
      copiedDeck = deck.map(card => ({...card}));
      sortedPlayer = players.map(player => ({
        ...player,
        hand: [...player.hand]
      }));

      sortedPlayer.sort((a, b) => {
        const { value: aVal } = a.hand[0];
        const { value: bVal } = b.hand[0];

        if (aVal === bVal) {
          const cVal = copiedDeck.pop()!.value;
          const dVal = copiedDeck.pop()!.value;

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

  return sortedPlayer as PlayerTypes[];
};

export const clearHand = (players: PlayerTypes[]) => {
  const copiedPlayers = players.map(player => ({
    ...player,
    hand: [...player.hand]
  }));

  copiedPlayers.forEach(
    (player) => player.hand = []
  )  

  return copiedPlayers;
};

export const setDelay = async (ms:number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}