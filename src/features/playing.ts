import { CARD_NAME_TABLE, HUMAN_ID, REVOLUTION_TEXT } from "../config/contants";
import {
  GameActionsTypes,
  GameStatusTypes,
  GameStepTypes,
  HumanCardStatusTypes,
  HumanLatestActionTypes,
  LogTypes,
} from "../store/types/storeTypes";
import { setGRevolution, setLogData, setOrder, sortHand } from "./setting";
import {
  CardTypes,
  LayDownCardType,
  PileTypes,
  PlayerTypes,
} from "./types/featuresTypes";
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

const performLayDownCard = (
  hand: CardTypes[],
  selectedCards: CardTypes[],
  drawNum: number,
) => {
  const toSendCards = [];

  for (let i = 0; i < drawNum; i++) {
    toSendCards.push({ ...selectedCards[i] });
    const targetCardIdx = hand.findIndex(
      (card) => card.id === selectedCards[i].id
    );
    hand.splice(targetCardIdx, 1);
  }

  return toSendCards;
};

const performSwitchLeader = (
  currentPlayer: PlayerTypes,
  isFirstTurn: boolean = false,
  currentLeaderPlayer?: PlayerTypes | undefined
) => {
  if (isFirstTurn && currentLeaderPlayer) {
    currentLeaderPlayer.status.isLeader = false;
  }

  currentPlayer.status.isLeader = true;
};

export const layDownCard = (
  players: PlayerTypes[],
  pile: PileTypes,
  currentTurn: number,
  setLog: (logData:LogTypes) => void,
): LayDownCardType => {
  const copiedPlayers = copyPlayer(players);
  const copiedPile = copyDeck(pile, "pile");

  let isPass = Math.floor(Math.random() * 10) > 7 ? true : false;

  const currentPlayer = copiedPlayers.find(
    (player) => player.status.roundOrder === currentTurn
  )!;
  const { hand, className, name } = currentPlayer;

  if (!pile.length) {
    isPass = false;
    let randomVal = randomNumBetween(6, 11);
    let randomCards = hand.filter((card) => card.value === randomVal);

    while (!randomCards.length) {
      randomVal = randomNumBetween(2, 11);
      randomCards = hand.filter((card) => card.value === randomVal);
    }

    const randomDraw = randomNumBetween(1, randomCards.length);

    const toSendCards = performLayDownCard(hand, randomCards, randomDraw);

    copiedPile.push(toSendCards);
    performSwitchLeader(currentPlayer);
  } else if (pile.length && !isPass) {
    const currentLeaderPlayer = copiedPlayers.find(
      (player) => player.status.isLeader === true
    );

    if (currentLeaderPlayer && currentLeaderPlayer.id === currentPlayer.id) {
      return {
        result: "roundEnd",
        latestPlayer: currentLeaderPlayer.id,
      };
    }

    const latestPileCards = copiedPile[copiedPile.length - 1];
    const pickedCards = hand.filter(
      (card) => card.value < latestPileCards[0].value || card.value === 13
    );

    if (pickedCards.length) {
      const groupedCards = pickedCards.reduce(
        (acc: Record<string, typeof pickedCards>, cur) => {
          const keyString = String(cur.value);

          if (!acc[keyString]) acc[keyString] = [];
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

      if (!entryCards.length && groupedCards["13"]) {
        // console.log("JOKER ACT");
        for (let val in groupedCards) {
          if (
            val !== "13" &&
            groupedCards["13"].length &&
            groupedCards[val].length + groupedCards["13"].length >=
              latestPileCards.length
          ) {
            const jokerEntry = groupedCards[val].concat(
              groupedCards["13"].slice(
                0,
                latestPileCards.length - groupedCards[val].length
              )
            );

            entryCards.push(jokerEntry);
          }
        }

        if (
          !entryCards.length &&
          groupedCards["13"].length >= latestPileCards.length
        ) {
          entryCards.push(groupedCards["13"]);
        }
      }

      if (entryCards.length) {
        const randomDraw = randomNumBetween(0, entryCards.length - 1);
        const selectedCards = entryCards[randomDraw];

        const toSendCards = performLayDownCard(
          hand,
          selectedCards,
          latestPileCards.length
        );

        copiedPile.push(toSendCards);
        performSwitchLeader(currentPlayer, true, currentLeaderPlayer);
      } else {
        isPass = true;
      }
    } else {
      isPass = true;
    }
  }

  if (isPass) {
    console.log("Action: Pass ACT");
    setLog(setLogData(`${className}(${name})은 턴을 넘겼습니다.`));
    return {
      result: "pass",
      ...setNextTurn(copiedPlayers, currentTurn),
    };
  } else {
    console.log(
      "Action: LayDown ACT | value is =>",
      copiedPile[copiedPile.length - 1][0].value,
      " / length is =>",
      copiedPile[copiedPile.length - 1].length
    );

    const getLayDownCardData = {
      value: `RANK${copiedPile[copiedPile.length - 1][0].value}`,
      length: copiedPile[copiedPile.length - 1].length
    }
    setLog(setLogData(`${className}(${name})은 
      ${CARD_NAME_TABLE[`${getLayDownCardData.value}`].name}(${getLayDownCardData.value}) 카드를 
      ${getLayDownCardData.length}장 냈습니다.`));
    return {
      result: "layDown",
      copiedPile: copiedPile,
      ...setNextTurn(copiedPlayers, currentTurn),
    };
  }
};

export const playerLayDownCard = (
  players: PlayerTypes[],
  pile: Array<CardTypes>[],
  currentTurn: number,
  cardStatus: HumanCardStatusTypes,
  actionType: HumanLatestActionTypes,
  setLog: (logData:LogTypes) => void,
): LayDownCardType => {
  const copiedPlayers = copyPlayer(players);
  const copiedPile = copyDeck(pile, "pile");
  const copiedCardStatus = Object.assign({}, cardStatus);

  const humanPlayer = copiedPlayers.find((player) => player.id === HUMAN_ID)!;
  const { hand, className } = humanPlayer;

  if (actionType === "layDown") {
    const currentLeaderPlayer = copiedPlayers.find(
      (player) => player.status.isLeader === true
    );

    if (!pile.length) {
      const toSendCards = performLayDownCard(
        hand,
        copiedCardStatus.cards,
        copiedCardStatus.selected
      );

      copiedPile.push(toSendCards);
      performSwitchLeader(humanPlayer);
    } else {
      const latestPileCards = copiedPile[copiedPile.length - 1];

      if (
        (copiedCardStatus.cards[0].value < latestPileCards[0].value &&
          copiedCardStatus.selected === latestPileCards.length) ||
        copiedCardStatus.cards.some((card) => card.value === 13)
      ) {
        console.log("Human => ", copiedPlayers);
        const toSendCards = performLayDownCard(
          hand,
          copiedCardStatus.cards,
          copiedCardStatus.selected
        );

        copiedPile.push(toSendCards);
        performSwitchLeader(humanPlayer, true, currentLeaderPlayer);
      }
    }
  }

  if (actionType === "passed") {
    console.log("Action: Pass ACT");
    setLog(setLogData(`당신(${className})은 턴을 넘겼습니다.`));
    return {
      result: "pass",
      ...setNextTurn(copiedPlayers, currentTurn),
    };
  }

  console.log(
    "Action: LayDown ACT | value is =>",
    copiedPile[copiedPile.length - 1][0].value,
    " / length is =>",
    copiedPile[copiedPile.length - 1].length
  );
  const getLayDownCardData = {
    value: `RANK${copiedPile[copiedPile.length - 1][0].value}`,
    length: copiedPile[copiedPile.length - 1].length
  }
  setLog(setLogData(`당신(${className})은 
    ${CARD_NAME_TABLE[`${getLayDownCardData.value}`].name}(${getLayDownCardData.value}) 카드를 
    ${getLayDownCardData.length}장 냈습니다.`));
  return {
    result: "layDown",
    copiedPile: copiedPile,
    ...setNextTurn(copiedPlayers, currentTurn),
  };
};

export const setNextTurn = (
  players: PlayerTypes[],
  currentTurn: number
): {
  latestPlayer: string;
  nextTurn: number;
  nextPlayers: PlayerTypes[];
} => {
  const copiedPlayers = copyPlayer(players);

  const currentPlayer = copiedPlayers.find(
    (player) => player.status.gameState === "inAction"
  )!;
  currentPlayer.status.gameState = "waiting";

  const nextPlayer = copiedPlayers.find(
    (player) => player.status.roundOrder === currentTurn + 1
  );

  // console.log("setNextTurn currentPlayer => ", currentPlayer)
  // console.log("setNextTurn nextPlayer => ", nextPlayer)

  if (nextPlayer) {
    nextPlayer.status.gameState = "inAction";
  } else {
    const firstPlayer = copiedPlayers.find(
      (player) => player.status.roundOrder === 0
    );

    if (firstPlayer) {
      firstPlayer.status.gameState = "inAction";
    }
  }

  return {
    latestPlayer: currentPlayer.id,
    nextTurn: currentTurn + 1 >= players.length ? 0 : currentTurn + 1,
    nextPlayers: copiedPlayers,
  };
};

export const getSettleRoundData = (
  players: PlayerTypes[],
  pile: PileTypes,
  deck: CardTypes[]
) => {
  const copiedPlayers = copyPlayer(players);
  const copiedDeck = deck.length ? copyDeck(deck, "deck") : [];

  if (copiedPlayers.length > 1) {
    const rearrangedPlayers = setOrder(copiedPlayers, "game");
    const untiePile = pile.reduce(
      (acc: Array<CardTypes>, cur: Array<CardTypes>) => {
        acc.push(...cur);
        return acc;
      },
      []
    );
    copiedDeck.push(...untiePile);

    return {
      rearrangedPlayers: rearrangedPlayers,
      clearPile: [],
      updatedDeck: copiedDeck,
    };
  }
};

export const setWinner = (
  players: PlayerTypes[],
  targetPlayer: PlayerTypes,
  gameStatus: GameStatusTypes
) => {
  const copiedPlayers = copyPlayer(players);
  const copiedTargetPlayer = Object.assign({}, targetPlayer);
  const filteredPlayers = copiedPlayers.filter(
    (player) => player.id !== copiedTargetPlayer.id
  );
  const copiedResultRank = [...gameStatus.resultRank];

  filteredPlayers
    .sort((a, b) => a.status.roundOrder - b.status.roundOrder)
    .forEach((player, idx) => {
      player.status.roundOrder = idx;

      const getNextRoundOrder = 
      copiedTargetPlayer.status.roundOrder === (copiedPlayers.length - 1)
      ? 0 : copiedTargetPlayer.status.roundOrder;

      if (player.status.roundOrder === getNextRoundOrder) {
        player.status.gameState = "inAction";
      }
    });

  copiedResultRank.push(copiedTargetPlayer);

  // console.log(filteredPlayers);
  // console.log(copiedResultRank);

  return {
    remainedPlayers: filteredPlayers,
    updatedResultRank: copiedResultRank,
    currentTurn:
      gameStatus.currentTurn - 1 < 0 ? 0 : gameStatus.currentTurn - 1,
  };
};

export const performTaxCollect = async (
  deck: CardTypes[],
  players: PlayerTypes[],
  gameStep: GameStepTypes,
  actions: GameActionsTypes,
  setLog: (logData:LogTypes) => void,
  isRevolution: "revolution" | "gRevolution" | "continue"
) => {
  const { setGameStep, setGameState, setPlayers, runGame } = actions;

  if (gameStep === "inPlaying") return;

  setLog(setLogData(`[세금 징수 결과] ${REVOLUTION_TEXT[isRevolution]}`));

  if (isRevolution === "continue") {
    console.log("Tax Collect result => continue");
    setPlayers(actionSwapCard(players));
  } else if (isRevolution === "gRevolution") {
    console.log("Tax Collect result => gRevolution");
    setPlayers(setGRevolution(deck, players, true));
  } else if (isRevolution === "revolution") {
    console.log("Tax Collect result => revolution");
  }

  setGameStep("inPlaying");
  setGameState();

  const isComplete = await new Promise<string>((resolve) =>
    setTimeout(() => {
      setLog(setLogData("게임이 시작됩니다."))
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
