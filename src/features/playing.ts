import { CARD_NAME_TABLE, HUMAN_ID, REVOLUTION_TEXT } from "../config/contants";
import {
  GameActionsTypes,
  GameStatusTypes,
  GameStepTypes,
  LogTypes,
  useGameStoreTypes,
  useHumanStoreTypes,
} from "../store/types/storeTypes";
import { setLogData, setPlayerClass, sortHand, sortPlayer } from "./setting";
import { CardTypes, PileTypes, PlayerTypes } from "./types/featuresTypes";
import { copyPlayer, randomNumBetween } from "./utils";

export const isRevolution = async (
  players: PlayerTypes[]
): Promise<"revolution" | "gRevolution" | "continue"> => {
  const filteredPlayers = players.filter((player) => {
    const getJoker = player.hand.filter((card) => card.value === 13);
    if (getJoker.length >= 2) {
      return getJoker;
    } else {
      return false;
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

export const actionSwapCard = (
  players: PlayerTypes[],
  setPlayers: (players: Array<PlayerTypes>) => void
) => {
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

  sortHand(copiedPlayers);
  setPlayers(copiedPlayers);
};

const performLayDownCard = (
  hand: CardTypes[],
  selectedCards: CardTypes[],
  drawNum: number
): Record<"toSendCards" | "copiedHand", CardTypes[]> => {
  const toSendCards = [];
  const copiedHand = hand.map((card) => card);

  for (let i = 0; i < drawNum; i++) {
    toSendCards.push({ ...selectedCards[i] });
    const targetCardIdx = copiedHand.findIndex(
      (card) => card.id === selectedCards[i].id
    );
    copiedHand.splice(targetCardIdx, 1);
  }

  return {
    toSendCards,
    copiedHand,
  };
};

const getLaDownCardData = (pile: CardTypes[][]) => {
  return {
    value: `RANK${pile[pile.length - 1][0].value}`,
    length: pile[pile.length - 1].length,
  };
};

export const layDownCard = (
  gameStore: useGameStoreTypes,
  get: () => useGameStoreTypes,
  setLog: (logData: LogTypes) => void
): void => {
  const { players, pile, gameStatus, actions } = gameStore;
  const {
    setLeader,
    setPushPile,
    setTurn,
    setPlayerState,
    setPlayerHand,
    setLatestPlayer,
  } = actions;

  const currentPlayer = players.find(
    (player) => player.status.roundOrder === gameStatus.currentTurn
  )!;
  const { hand, className, name, id } = currentPlayer;

  const passProb = hand.length < 5 ? 0 : 7;
  let isPass = Math.floor(Math.random() * 10) > passProb ? true : false;

  if (!pile.length) {
    isPass = false;
    let randomVal = randomNumBetween(6, 11);
    let randomCards = hand.filter((card) => card.value === randomVal);

    while (!randomCards.length) {
      randomVal = randomNumBetween(2, 11);
      randomCards = hand.filter((card) => card.value === randomVal);
    }

    const randomDraw = randomNumBetween(1, randomCards.length);

    const { toSendCards, copiedHand } = performLayDownCard(
      hand,
      randomCards,
      randomDraw
    );

    setPlayerHand(id, copiedHand);
    setPushPile(toSendCards);
    setLeader(id, false);
  } else if (pile.length && !isPass) {
    const currentLeaderPlayer = players.find(
      (player) => player.status.isLeader === true
    );

    if (currentLeaderPlayer && currentLeaderPlayer.id === currentPlayer.id) {
      setLatestPlayer(id);
      return;
    }

    const latestPileCards = pile[pile.length - 1];
    const rankFulfilledCards = hand.filter(
      (card) => card.value < latestPileCards[0].value || card.value === 13
    );

    if (rankFulfilledCards.length) {
      const lengthFulfilledCards = rankFulfilledCards.reduce(
        (acc: Record<string, typeof rankFulfilledCards>, cur) => {
          const keyString = String(cur.value);

          if (!acc[keyString]) acc[keyString] = [];
          acc[keyString].push(cur);

          return acc;
        },
        {}
      );

      let finalEntryCards = [];

      for (let val in lengthFulfilledCards) {
        if (lengthFulfilledCards[val].length >= latestPileCards.length) {
          finalEntryCards.push(lengthFulfilledCards[val]);
        }
      }

      if (!finalEntryCards.length && lengthFulfilledCards["13"]) {
        // console.log("JOKER ACT");
        for (let val in lengthFulfilledCards) {
          if (
            val !== "13" &&
            lengthFulfilledCards["13"].length &&
            lengthFulfilledCards[val].length +
              lengthFulfilledCards["13"].length >=
              latestPileCards.length
          ) {
            const jokerEntry = lengthFulfilledCards[val].concat(
              lengthFulfilledCards["13"].slice(
                0,
                latestPileCards.length - lengthFulfilledCards[val].length
              )
            );

            finalEntryCards.push(jokerEntry);
          }
        }

        if (
          !finalEntryCards.length &&
          lengthFulfilledCards["13"].length >= latestPileCards.length
        ) {
          finalEntryCards.push(lengthFulfilledCards["13"]);
        }
      }

      if (finalEntryCards.length) {
        const randomDraw = randomNumBetween(0, finalEntryCards.length - 1);
        const selectedCards = finalEntryCards[randomDraw];

        const { toSendCards, copiedHand } = performLayDownCard(
          hand,
          selectedCards,
          latestPileCards.length
        );

        setPushPile(toSendCards);
        setPlayerHand(id, copiedHand);
        setLeader(id, true);
      } else {
        isPass = true;
      }
    } else {
      isPass = true;
    }
  }

  if (isPass) {
    setLog(setLogData(`${className}(${name})은 턴을 넘겼습니다.`));
  } else {
    const { value: logPileVal, length: logPileLength } = getLaDownCardData(
      get().pile
    );

    setLog(
      setLogData(`${className}(${name})은 
      ${CARD_NAME_TABLE[logPileVal].name}(${logPileVal}) 카드를 
      ${logPileLength}장 냈습니다.`)
    );
  }

  setLatestPlayer(id);
  setPlayerState(id, "waiting");

  const nextPlayer = players.find(
    (player) => player.status.roundOrder === gameStatus.currentTurn + 1
  );

  if (nextPlayer) {
    setPlayerState(nextPlayer.id, "inAction");
  } else {
    const firstPlayer = players.find(
      (player) => player.status.roundOrder === 0
    );
    setPlayerState(firstPlayer!.id, "inAction");
  }

  const getTurnVal =
    gameStatus.currentTurn + 1 >= players.length
      ? 0
      : gameStatus.currentTurn + 1;
  setTurn(getTurnVal);
};

export const playerLayDownCard = (
  gameStore: useGameStoreTypes,
  humanStore: useHumanStoreTypes,
  get: () => useGameStoreTypes,
  setLog: (logData: LogTypes) => void
): void => {
  const { players, pile, gameStatus, actions } = gameStore;
  const { cardStatus, latestAction } = humanStore;
  const {
    setLeader,
    setPushPile,
    setTurn,
    setPlayerState,
    setPlayerHand,
    setLatestPlayer,
  } = actions;

  const humanPlayer = players.find((player) => player.id === HUMAN_ID)!;
  const { hand, className } = humanPlayer;

  if (latestAction === "layDown") {
    if (!pile.length) {
      const { toSendCards, copiedHand } = performLayDownCard(
        hand,
        cardStatus.cards,
        cardStatus.selected
      );

      setPushPile(toSendCards);
      setPlayerHand(HUMAN_ID, copiedHand);
      setLeader(HUMAN_ID, false);
    } else {
      const latestPileCards = pile[pile.length - 1];

      if (
        (cardStatus.cards[0].value < latestPileCards[0].value &&
          cardStatus.selected === latestPileCards.length) ||
        cardStatus.cards.some((card) => card.value === 13)
      ) {
        const { toSendCards, copiedHand } = performLayDownCard(
          hand,
          cardStatus.cards,
          cardStatus.selected
        );

        setPushPile(toSendCards);
        setPlayerHand(HUMAN_ID, copiedHand);

        setLeader(HUMAN_ID, true);
      }
    }
  }

  if (latestAction === "passed") {
    setLog(setLogData(`당신(${className})은 턴을 넘겼습니다.`));
  } else {
    const { value: logPileVal, length: logPileLength } = getLaDownCardData(
      get().pile
    );

    setLog(
      setLogData(`당신(${className})은 
      ${CARD_NAME_TABLE[logPileVal].name}(${logPileVal}) 카드를 
      ${logPileLength}장 냈습니다.`)
    );
  }

  setLatestPlayer(HUMAN_ID);
  setPlayerState(HUMAN_ID, "waiting");

  const nextPlayer = players.find(
    (player) => player.status.roundOrder === gameStatus.currentTurn + 1
  );

  if (nextPlayer) {
    setPlayerState(nextPlayer.id, "inAction");
  } else {
    const firstPlayer = players.find(
      (player) => player.status.roundOrder === 0
    );
    setPlayerState(firstPlayer!.id, "inAction");
  }

  const getTurnVal =
    gameStatus.currentTurn + 1 >= players.length
      ? 0
      : gameStatus.currentTurn + 1;
  setTurn(getTurnVal);
};

export const getSettleRoundData = (
  playersLength: number,
  pile: PileTypes
): CardTypes[] | null => {
  if (playersLength > 1) {
    const untiePile = pile.reduce(
      (acc: Array<CardTypes>, cur: Array<CardTypes>) => {
        acc.push(...cur);
        return acc;
      },
      []
    );

    return untiePile;
  }

  return null;
};

export const setWinner = (
  players: PlayerTypes[],
  targetPlayer: PlayerTypes,
  gameStatus: GameStatusTypes,
  actions: GameActionsTypes
): void => {
  const { setResultRank, setPlayers, setPlayerState, setTurn } = actions;

  const copiedPlayers = copyPlayer(players);

  const filteredPlayers = copiedPlayers.filter(
    (player) => player.id !== targetPlayer.id
  );

  filteredPlayers
    .sort((a, b) => a.status.roundOrder - b.status.roundOrder)
    .forEach((player, idx) => {
      player.status.roundOrder = idx;

      const getNextRoundOrder =
        targetPlayer.status.roundOrder === players.length - 1
          ? 0
          : targetPlayer.status.roundOrder;

      if (player.status.roundOrder === getNextRoundOrder) {
        setPlayerState(player.id, "inAction");
      }
    });

  setResultRank([{ ...targetPlayer }]);
  setPlayers(filteredPlayers);

  const getTurnVal =
    gameStatus.currentTurn - 1 < 0 ? 0 : gameStatus.currentTurn - 1;
  setTurn(getTurnVal);
};

export const performTaxCollect = async (
  deck: CardTypes[],
  players: PlayerTypes[],
  gameStep: GameStepTypes,
  actions: GameActionsTypes,
  get: () => useGameStoreTypes,
  setLog: (logData: LogTypes) => void,
  isRevolution: "revolution" | "gRevolution" | "continue"
): Promise<void> => {
  const { setGameStep, setFirstInAction, runGame, setPlayers } = actions;

  if (gameStep === "inPlaying") return;

  setLog(setLogData(`[세금 징수 결과] ${REVOLUTION_TEXT[isRevolution]}`));

  if (isRevolution === "continue") {
    actionSwapCard(players, setPlayers);
  } else if (isRevolution === "gRevolution") {
    sortPlayer(deck, players, "gRevolution", setPlayers);
    setPlayerClass(get().players);
  }

  setGameStep("inPlaying");
  setFirstInAction();

  const isComplete = await new Promise<string>((resolve) =>
    setTimeout(() => {
      setLog(setLogData("게임이 시작됩니다."));
      return resolve("inPlaying");
    }, 2000)
  );

  if (isComplete) {
    await runGame();
  }
};

export const runHumanActionTrigger = (
  trigger: (() => void) | null,
  action: (value: (() => void) | null) => void
) => {
  if (trigger) {
    trigger();
    action(null);
  }
};
