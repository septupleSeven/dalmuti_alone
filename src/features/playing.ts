import { useGameStore } from "../store/store";
import { copyPlayer, setDelay, sortHand } from "./setting";
import { CardTypes, PlayerTypes } from "./settingTypes";

// export const runGame = async (
//     players: PlayerTypes[],
//     turnInfo: "firstInit" | number,
//     setTurn: (value?: number) => void
// ) => {

//     await setNextTurn(players, turnInfo, setTurn);

// }

export const isRevolution = async (
  players: PlayerTypes[]
): Promise<"revolution" | "gRevolution" | "continue"> => {
  const copiedPlayers = copyPlayer(players);

  const filteredPlayers = copiedPlayers.filter((player) => {
    const getJoker = player.hand.filter((card) => card.value === 13);
    if(getJoker.length >= 2){
        return getJoker;
    }
  });

  return await new Promise((resolve) => {
    let result:"revolution" | "gRevolution" | "continue" = "continue";

    if (filteredPlayers.length) {
      result = "revolution";

      if (filteredPlayers[0].order === players.length - 1) {
        result = "gRevolution";
      }
    }

    return resolve(result);
  });
};

export const actionSwapCard = (players: PlayerTypes[]) => {
  const copiedPlayers = copyPlayer(players);

  copiedPlayers.forEach((player) => {
    const filteredHand = player.hand.filter((card) => card.value !== 13);

    switch (player.order) {
      case 0:
        {
          const targetA = player.hand.findIndex(
            (card) => card.id === filteredHand[filteredHand.length - 2].id
          );
          const targetB = player.hand.findIndex(
            (card) => card.id === filteredHand[filteredHand.length - 1].id
          );
          const exchangeTarget = [
            { ...player.hand[targetA] },
            { ...player.hand[targetB] },
          ];

          [player.hand[targetA], player.hand[targetB]] = [
            copiedPlayers[copiedPlayers.length - 1].hand[0],
            copiedPlayers[copiedPlayers.length - 1].hand[1],
          ];

          copiedPlayers[copiedPlayers.length - 1].hand.splice(0, 2);
          copiedPlayers[copiedPlayers.length - 1].hand.push(...exchangeTarget);
        }
        break;
      case 1:
        {
          const targetA = player.hand.findIndex(
            (card) => card.id === filteredHand[filteredHand.length - 1].id
          );
          const exchangeTarget = [{ ...player.hand[targetA] }];

          [player.hand[targetA]] = [
            copiedPlayers[copiedPlayers.length - 2].hand[0],
          ];

          copiedPlayers[copiedPlayers.length - 2].hand.splice(0, 1);
          copiedPlayers[copiedPlayers.length - 2].hand.push(...exchangeTarget);
        }
        break;
    }
  });

  return sortHand(copiedPlayers);
};

export const setNextTurn = (
  players: PlayerTypes[],
  currentTurn: number
): {
  nextTurn: number;
  nextPlayers: PlayerTypes[];
} => {
  const copiedPlayers = copyPlayer(players);

  if (copiedPlayers[currentTurn + 1]) {
    copiedPlayers[currentTurn + 1].state = "inAction";
  } else {
    copiedPlayers[0].state = "inAction";
  }

  return {
    nextTurn: currentTurn + 1 >= players.length ? 0 : currentTurn + 1,
    nextPlayers: copiedPlayers,
  };
};
