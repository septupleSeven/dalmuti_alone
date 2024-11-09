import { useGameStore } from "../store/store";
import { setDelay, sortHand } from "./setting";
import { CardTypes, LayDownCardType, PlayerTypes } from "./types/featuresTypes";
import { copyDeck, copyPlayer, randomNumBetween } from "./utils";

export const isRevolution = async (
  players: PlayerTypes[]
): Promise<"revolution" | "gRevolution" | "continue"> => {
  const copiedPlayers = copyPlayer(players);

  const filteredPlayers = copiedPlayers.filter((player) => {
    const getJoker = player.hand.filter((card) => card.value === 13);
    if (getJoker.length >= 2) {
      return getJoker;
    }
  });

  return await new Promise((resolve) => {
    let result: "revolution" | "gRevolution" | "continue" = "continue";

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

export const layDownCard = (
  players: PlayerTypes[],
  pile: Array<CardTypes>[],
  currentTurn: number
): LayDownCardType => {
  const copiedPlayers = copyPlayer(players);
  const copiedPile = copyDeck(pile, "pile");

  let isPass = Math.floor(Math.random() * 10) > 7 ? true : false;

  const currentPlayer = copiedPlayers.find(
    (player) => player.order === currentTurn
  )!;

  const { hand } = currentPlayer;

  if (!pile.length) {
    isPass = false;
    let randomVal = randomNumBetween(6, 11);
    let randomCards = hand.filter((card) => card.value === randomVal);

    while (!randomCards.length) {
      randomVal = randomNumBetween(2, 11);
      randomCards = hand.filter((card) => card.value === randomVal);
    }

    const randomDraw = randomNumBetween(1, randomCards.length);
    const toSendCards = [];

    for (let i = 0; i < randomDraw; i++) {
      toSendCards.push({ ...randomCards[i] });
      const targetCardIdx = hand.findIndex(
        (card) => card.id === randomCards[i].id
      );
      hand.splice(targetCardIdx, 1);
    }

    copiedPile.push(toSendCards);
    currentPlayer.status.isLeader = true;
  } else if(pile.length && !isPass) {
    const currentLeaderPlayer = copiedPlayers.find(
      (player) => player.status.isLeader === true
    )!;

    const latestPileCards = copiedPile[copiedPile.length - 1];
    const pickedCards = hand.filter(
      (card) => card.value < latestPileCards[0].value
    );

    if (pickedCards.length) {
      const groupedCards = pickedCards.reduce(
        (acc: Record<string, typeof pickedCards>, cur) => {
          const keyString = String(cur.value);
          if (!acc[keyString]) {
            acc[keyString] = [];
          }
          acc[keyString].push(cur);

          return acc;
        },
        {}
      );

      let entryCards = [];

      for (let val in groupedCards) {
        if (groupedCards[val].length >= latestPileCards.length) {
          entryCards.push(groupedCards[val]);
        }
      }

      if (entryCards.length) {
        const randomDraw = randomNumBetween(0, entryCards.length - 1);
        const selectedCards = entryCards[randomDraw];

        const toSendCards = [];

        for (let i = 0; i < latestPileCards.length; i++) {
          toSendCards.push(selectedCards[i]);
          const targetCardIdx = hand.findIndex(
            (card) => card.id === selectedCards[i].id
          );
          hand.splice(targetCardIdx, 1);
        }

        copiedPile.push(toSendCards);
        currentLeaderPlayer.status.isLeader = false;
        currentPlayer.status.isLeader = true;
      } else {
        isPass = true;
      }
    } else {
      isPass = true;
    }
  }

  if (isPass) {
    console.log("Pass ACT");
    return {
      result: "pass",
      ...setNextTurn(copiedPlayers, currentTurn),
    };
  } else {
    console.log("LayDown ACT");
    return {
      result: "layDown",
      copiedPile: copiedPile,
      ...setNextTurn(copiedPlayers, currentTurn),
    };
  }
};

export const setNextTurn = (
  players: PlayerTypes[],
  currentTurn: number
): {
  nextTurn: number;
  nextPlayers: PlayerTypes[];
} => {
  const copiedPlayers = copyPlayer(players);

  copiedPlayers[currentTurn].status.gameState = "turnEnd";

  if (copiedPlayers[currentTurn + 1]) {
    copiedPlayers[currentTurn + 1].status.gameState = "inAction";
  } else {
    copiedPlayers[0].status.gameState = "inAction";
  }

  return {
    nextTurn: currentTurn + 1 >= players.length ? 0 : currentTurn + 1,
    nextPlayers: copiedPlayers,
  };
};
