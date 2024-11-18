import { HUMAN_ID, PLAYER_NAME_TABLE } from "../config/contants";
import { LogTypes } from "../store/types/storeTypes";
import { CardTypes, PlayerTypes } from "./types/featuresTypes";
import { copyPlayer } from "./utils";

export const setPlayer = (playerNum: number): PlayerTypes[] => {
  const players: PlayerTypes[] = [];

  for (let i = 0; i < playerNum; i++) {
    const playerObj: PlayerTypes = {
      id: i < playerNum - 1 ? `Ai${i + 1}` : HUMAN_ID,
      get name() {
        return this.id === HUMAN_ID ? "YOU" : `COM${i + 1}`;
      },
      className: "",
      hand: [],
      order: i,
      status: {
        gameState: "waiting",
        isLeader: false,
        roundOrder: 0,
      },
    };
    players.push(playerObj);
  }

  return players;
};

export const createDeck = (maxRank: number): CardTypes[] => {
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

  for (let i = 0; i <= 1; i++) {
    const joker: CardTypes = {
      id: `CID13-${i}`,
      rank: "JOKER",
      value: 13,
    };
    deck.push(joker);
  }

  return deck;
};

export const shuffleDeck = (deck: CardTypes[]): void => {
  for (let i = deck.length - 1; i > 0; i--) {
    const targetIdx = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[targetIdx]] = [deck[targetIdx], deck[i]];
  }
};

const distributeCards = (players: PlayerTypes[], deck: CardTypes[]) => {
  for (let i = 0; i < players.length; i++) {
    if (deck.length) {
      players[i].hand.push(deck.pop()!);
    }
  }
};

export const dealDeck = (
  deck: CardTypes[],
  players: PlayerTypes[],
  type: "setting" | "game"
): void => {
  if (type === "game") {
    while (deck.length > 0) {
      distributeCards(players, deck);
    }
  } else {
    distributeCards(players, deck);
  }
};

export const sortPlayer = (
  deck: CardTypes[],
  players: PlayerTypes[],
  type: "setting" | "game" | "gRevolution",
  setPlayers?: (players: Array<PlayerTypes>) => void
): void => {
  switch (type) {
    case "setting": {
      players.sort((a, b) => {
        const { value: aVal } = a.hand[0];
        const { value: bVal } = b.hand[0];

        if (aVal === bVal) {
          let cVal;
          let dVal;

          do {
            if (deck.length < 2) {
              return 0;
            }
            cVal = deck.pop()!.value;
            dVal = deck.pop()!.value;
          } while (cVal !== dVal);

          return cVal - dVal;
        } else {
          return aVal - bVal;
        }
      });

      players.forEach((player, idx) => {
        player.status.roundOrder = idx;
        player.order = idx;
      });

      break;
    }
    case "gRevolution": {
      const copiedPlayers = copyPlayer(players).reverse()
      
      copiedPlayers.forEach((player, idx) => {
        player.status.roundOrder = idx;
        player.order = idx;
      });

      if (setPlayers) setPlayers(copiedPlayers);
      break;
    }
    default:
      break;
  }
};

export const sortHand = (players: PlayerTypes[]): void => {
  players.forEach((player) => {
    player.hand.sort((a, b) => a.value - b.value);
  });
};

export const setOrder = (players: PlayerTypes[], type: "setting" | "game") => {
  const copiedPlayers = copyPlayer(players);

  if (type === "setting") {
    copiedPlayers.forEach((player) => {
      player.status.roundOrder = player.order;
    });
  }

  if (type === "game") {
    const getLeaderIdx = copiedPlayers.findIndex(
      (player) => player.status.isLeader === true
    );
    const slicedPlayersA = copiedPlayers.slice(getLeaderIdx);
    const slicedPlayersB = copiedPlayers.slice(0, getLeaderIdx);
    const rearrangedPlayers = [...slicedPlayersA, ...slicedPlayersB];

    rearrangedPlayers.forEach((player, idx) => {
      const targetPlayer = copiedPlayers.find(
        (cPlayer) => cPlayer.id === player.id
      );
      if (targetPlayer) {
        targetPlayer.status.roundOrder = idx;
      }

      if (targetPlayer?.status.isLeader) {
        targetPlayer.status.gameState = "inAction";
      }

      player.status.isLeader = false;
    });
  }

  return copiedPlayers;
};

export const setPlayerGameState = (players: PlayerTypes[]) => {
  const copiedPlayers = copyPlayer(players);
  const firstPlayer = copiedPlayers.find((el) => el.order === 0);

  if (firstPlayer) {
    firstPlayer.status.gameState = "inAction";
  }

  return copiedPlayers;
};

export const setLogData = (value: string): LogTypes => {
  const now = new Date();
  const getLocaleTime = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return {
    contents: value,
    time: `[${getLocaleTime}]`,
  };
};
