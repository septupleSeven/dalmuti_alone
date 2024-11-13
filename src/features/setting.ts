import { HUMAN_ID, PLAYER_NAME_TABLE } from "../config/contants";
import { HandGroupTypes } from "../pages/Home/types/HomeTypes";
import {
  HumanCardStatusTypes,
  LogTypes,
} from "../store/types/storeTypes";
import { CardTypes, PlayerTypes } from "./types/featuresTypes";
import { copyDeck, copyPlayer } from "./utils";

export const setPlayer = (playerNum: number):PlayerTypes[] => {
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

export const createDeck = (maxRank: number):CardTypes[] => {
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

// ! ==================== 수정됨 (immer.js) / 검토 완
export const shuffleDeck = (deck: CardTypes[]):void => {
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

// ! ==================== 수정됨 (immer.js) / 검토 완
export const dealDeck = (
  deck: CardTypes[],
  players: PlayerTypes[],
  type: "setting" | "game"
):void => {

  if (type === "game") {
    while (deck.length > 0) {
      distributeCards(players, deck);
    }
  } else {
    distributeCards(players, deck);
  }
};

// ! ==================== 수정됨 (immer.js) / 검토 완
export const sortPlayer = (
  deck: CardTypes[],
  players: PlayerTypes[],
  type: "setting" | "game" | "gRevolution"
):void => {

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
      players
      .reverse()
      .forEach((player, idx) => {
        player.status.roundOrder = idx;
        player.order = idx;
      });

      break;
    }
    default:
      break;
  }

};

// ! ==================== 수정됨 (immer.js) / 검토 완
export const sortHand = (players: PlayerTypes[]):void => {
  players.forEach((player) => {
    player.hand.sort((a, b) => a.value - b.value);
  });
};

// ! ==================== 수정됨 (immer.js) / 검토 완
export const setPlayerClass = (players: PlayerTypes[]):void => {
  players.forEach((player) => {
    player.className = `${PLAYER_NAME_TABLE[`ORDER${player.order}`].name}`;
  });
};



// ! ==================== 현재 안쓰임
export const setReadyForPlay = (players: PlayerTypes[], isCopy?: boolean) => {
  // let copiedPlayers;

  // if (isCopy) {
  //   copiedPlayers = copyPlayer(players);
  // } else {
  //   copiedPlayers = players;
  // }

  // const handSortedPlayers = sortHand(copiedPlayers);
  // const grantedPlayers = setPlayerClass(handSortedPlayers);

  // return grantedPlayers;
};






export const clearHand = (players: PlayerTypes[]) => {
  const copiedPlayers = copyPlayer(players);
  copiedPlayers.forEach((player) => (player.hand = []));

  return copiedPlayers;
};





// ! ==================== 수정됨 (immer.js) / 검토 완, 로직이 복잡해서 복사 필요해보임
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









// ! ==================== 수정됨 (immer.js)
export const setGRevolution = (
  deck: CardTypes[],
  players: PlayerTypes[],
  isCopy?: boolean // 바뀐 방식에 따라 삭제
) => {
  // let copiedPlayers;

  // if (isCopy) {
  //   copiedPlayers = copyPlayer(players);
  // } else {
  //   copiedPlayers = players;
  // }

  // const sortedPlayers = sortPlayer(deck, players, "gRevolution");
  // const grantedPlayers = setPlayerClass(sortedPlayers);

  sortPlayer(deck, players, "gRevolution");
  setPlayerClass(players);

};


export const setPlayerCardStatus = (
  group: HandGroupTypes,
  value?: string
): {
  rank: string;
  value: number;
  cards: Omit<CardTypes, "rank">[];
  selected: number;
} => {
  const copiedGroup = Object.assign({}, group);
  const { rank, cards } = copiedGroup;
  const numVal = value ? Number(value) : 0;

  return {
    rank: rank,
    value: cards[0].value,
    cards: cards,
    selected: numVal,
  };
};

export const setJokerCombine = (
  cardStatus: HumanCardStatusTypes,
  value: number
) => {
  const copiedCards = cardStatus.cards.map((card) => card);
  const copiedJokers = cardStatus.jokerPicked.map((card) => card);
  const jokerNeeds = copiedJokers.slice(0, value);
  copiedCards.push(...jokerNeeds);

  return copiedCards;
};

export const setDelay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const setLogData = (value:string):LogTypes => {
  const now = new Date();
  const getLocaleTime = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  
  return {
    contents: value,
    time: `[${getLocaleTime}]`
  }

}