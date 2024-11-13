import { CARD_NAME_TABLE, HUMAN_ID, REVOLUTION_TEXT } from "../config/contants";
import {
  GameActionsTypes,
  GameStatusTypes,
  GameStepTypes,
  HumanCardStatusTypes,
  HumanLatestActionTypes,
  LogTypes,
  useGameStoreTypes,
  useHumanStoreTypes,
} from "../store/types/storeTypes";
import { setGRevolution, setLogData, setOrder, sortHand } from "./setting";
import {
  CardTypes,
  LayDownCardType,
  PileTypes,
  PlayerTypes,
} from "./types/featuresTypes";
import { copyDeck, copyPlayer, randomNumBetween } from "./utils";

// ! ==================== 수정됨 (immer.js)
export const isRevolution = async (
  players: PlayerTypes[]
): Promise<"revolution" | "gRevolution" | "continue"> => {

  const filteredPlayers = players.filter((player) => {
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


// ! ==================== 수정됨 (immer.js)
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

  // return sortHand(copiedPlayers);
  sortHand(copiedPlayers);
  setPlayers(copiedPlayers);
};

// ! ==================== 수정됨 (immer.js)
const performLayDownCard = (
  hand: CardTypes[],
  selectedCards: CardTypes[],
  drawNum: number,
):Record<"toSendCards" | "copiedHand", CardTypes[]> => {
  const toSendCards = [];
  const copiedHand = [...hand]

  for (let i = 0; i < drawNum; i++) {
    toSendCards.push({ ...selectedCards[i] });
    const targetCardIdx = hand.findIndex(
      (card) => card.id === selectedCards[i].id
    );
    copiedHand.splice(targetCardIdx, 1);
  }

  return {
    toSendCards,
    copiedHand
  };
};

const getLaDownCardData = (
  pile: CardTypes[][],
) => {
  return {
    value: `RANK${pile[pile.length - 1][0].value}`,
    length: pile[pile.length - 1].length
  }
}



//   currentPlayer.status.isLeader = true;
// };

// ! ==================== 수정됨 (immer.js)
export const layDownCard = (
  // players: PlayerTypes[],
  // pile: PileTypes,
  // currentTurn: number,
  gameStore: useGameStoreTypes,
  get: () => useGameStoreTypes,
  // humanStore: useHumanStoreTypes,
  setLog: (logData:LogTypes) => void,
): void => {
  const { players, pile, gameStatus, actions } = gameStore;
  const { setLeader, setPushPile, setTurn, setPlayerState, setPlayerHand, setLatestPlayer } = actions;

  // const copiedPlayers = copyPlayer(players);
  // const copiedPile = copyDeck(pile, "pile");

  let isPass = Math.floor(Math.random() * 10) > 7 ? true : false;

  const currentPlayer = players.find(
    (player) => player.status.roundOrder === gameStatus.currentTurn
  )!;
  const { hand, className, name, id } = currentPlayer;

  if (!pile.length) {
    isPass = false;
    let randomVal = randomNumBetween(6, 11);
    let randomCards = hand.filter((card) => card.value === randomVal);

    while (!randomCards.length) {
      randomVal = randomNumBetween(2, 11);
      randomCards = hand.filter((card) => card.value === randomVal);
    }

    const randomDraw = randomNumBetween(1, randomCards.length);

    // const toSendCards = performLayDownCard(hand, randomCards, randomDraw);ㅁㅁ
    const { toSendCards, copiedHand } = performLayDownCard(hand, randomCards, randomDraw);
    // copiedPile.push(toSendCards);

    setLatestPlayer(id);
    setPlayerHand(id, copiedHand);
    setPushPile(toSendCards);
    setLeader(id, false);
    
    // performSwitchLeader(currentPlayer);
  } else if (pile.length && !isPass) {

    // const currentLeaderPlayer = copiedPlayers.find(
    //   (player) => player.status.isLeader === true
    // );
    const currentLeaderPlayer = players.find(
      (player) => player.status.isLeader === true
    );

    if (currentLeaderPlayer && currentLeaderPlayer.id === currentPlayer.id) {
      // return {
      //   result: "roundEnd",
      //   latestPlayer: currentLeaderPlayer.id,
      // };
      setLatestPlayer(currentLeaderPlayer.id);
      return;
    }

    // const latestPileCards = copiedPile[copiedPile.length - 1];
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
            lengthFulfilledCards[val].length + lengthFulfilledCards["13"].length >=
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

        // copiedPile.push(toSendCards);
        // performSwitchLeader(currentPlayer, true, currentLeaderPlayer);

        setLatestPlayer(id);
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
    // console.log("Action: Pass ACT");
    setLog(setLogData(`${className}(${name})은 턴을 넘겼습니다.`));
    // return {
    //   result: "pass",
    //   ...setNextTurn(copiedPlayers, currentTurn),
    // };
  } else {
    // console.log(
    //   "Action: LayDown ACT | value is =>",
    //   copiedPile[copiedPile.length - 1][0].value,
    //   " / length is =>",
    //   copiedPile[copiedPile.length - 1].length
    // );

    // const getLayDownCardData = {
    //   value: `RANK${pile[pile.length - 1][0].value}`,
    //   length: pile[pile.length - 1].length
    // }
    const { value:logPileVal, length: logPileLength } = getLaDownCardData(get().pile);
    
    setLog(setLogData(`${className}(${name})은 
      ${CARD_NAME_TABLE[logPileVal].name}(${logPileVal}) 카드를 
      ${logPileLength}장 냈습니다.`));

    // return {
    //   result: "layDown",
    //   copiedPile: copiedPile,
    //   ...setNextTurn(copiedPlayers, currentTurn),
    // };
  }

  setPlayerState(id, "waiting");

  const nextPlayer = players.find(
    (player) => player.status.roundOrder === gameStatus.currentTurn + 1
  );

  if(nextPlayer){    
    setPlayerState(nextPlayer.id, "inAction");
  }else{
    const firstPlayer = players.find(
      (player) => player.status.roundOrder === 0
    );
    setPlayerState(firstPlayer!.id, "inAction");
  }

  const getTurnVal = (gameStatus.currentTurn + 1) >= players.length 
  ? 0 
  : gameStatus.currentTurn + 1;
  setTurn(getTurnVal)
};

// ! ==================== 수정됨 (immer.js)
export const playerLayDownCard = (
  // players: PlayerTypes[],
  // pile: Array<CardTypes>[],
  // currentTurn: number,
  gameStore: useGameStoreTypes,
  humanStore: useHumanStoreTypes,
  // humanCardStatus: HumanCardStatusTypes,
  // humanActionType: HumanLatestActionTypes,
  get: () => useGameStoreTypes,
  setLog: (logData:LogTypes) => void,
):void => {
  const { players, pile, gameStatus, actions } = gameStore;
  const { cardStatus, latestAction } = humanStore;
  const { setLeader, setPushPile, setTurn, setPlayerState, setPlayerHand } = actions;

  // const copiedPlayers = copyPlayer(players);
  // const copiedPile = copyDeck(pile, "pile");
  // const copiedCardStatus = Object.assign({}, cardStatus); // 쓸모 없어 보임

  // const humanPlayer = copiedPlayers.find((player) => player.id === HUMAN_ID)!;
  const humanPlayer = players.find((player) => player.id === HUMAN_ID)!;
  const { hand, className } = humanPlayer;





  // IF 카드 낼 떄
  if (latestAction === "layDown") {
    // 현재 리드하고 있는 플레이어 찾기 / 이거 setLeader 사용 시 삭제해야함
    // const currentLeaderPlayer = copiedPlayers.find(
    //   (player) => player.status.isLeader === true
    // );
    // const currentLeaderPlayer = players.find(
    //   (player) => player.status.isLeader === true
    // );

    if (!pile.length) {
      // pile 에 보낼 카드 모음 이건 배열 필요할듯
      const { toSendCards, copiedHand } = performLayDownCard(
        hand,
        cardStatus.cards,
        cardStatus.selected
      );


      // copiedPile.push(toSendCards); // 여기 게임스토어 사용해야함
      // pile.push(toSendCards); // 여기서 파일 직접 변경


      // 게임스토어 액션으로 대체하는 것을 권장
      // performSwitchLeader(humanPlayer); // 직접 변경 시 일단 인간 플레이어 수정

      setPushPile(toSendCards);
      setPlayerHand(HUMAN_ID, copiedHand);
      setLeader(HUMAN_ID, false);

    } else {
      // const latestPileCards = copiedPile[copiedPile.length - 1];
      const latestPileCards = pile[pile.length - 1];

      if (
        (cardStatus.cards[0].value < latestPileCards[0].value &&
          cardStatus.selected === latestPileCards.length) ||
          cardStatus.cards.some((card) => card.value === 13)
      ) {
        // console.log("Human => ", copiedPlayers);
        const { toSendCards, copiedHand } = performLayDownCard(
          hand,
          cardStatus.cards,
          cardStatus.selected
        );

        // copiedPile.push(toSendCards);
        setPushPile(toSendCards);
        setPlayerHand(HUMAN_ID, copiedHand);

        // pile.push(toSendCards); // 교체 시 setPile 대체 가능
        // performSwitchLeader(humanPlayer, true, currentLeaderPlayer); // 직접 변경 시 일단 인간 플레이어 수정
        setLeader(HUMAN_ID, true);
      }
    }
  }

  if (latestAction === "passed") {
    // console.log("Action: Pass ACT");
    setLog(setLogData(`당신(${className})은 턴을 넘겼습니다.`));
    // return {
    //   result: "pass",
    //   ...setNextTurn(copiedPlayers, currentTurn),
    // };
  }

  // console.log(
  //   "Action: LayDown ACT | value is =>",
  //   copiedPile[copiedPile.length - 1][0].value,
  //   " / length is =>",
  //   copiedPile[copiedPile.length - 1].length
  // );
  // const getLayDownCardData = {
  //   value: `RANK${pile[pile.length - 1][0].value}`,
  //   length: pile[pile.length - 1].length
  // }

  const { value:logPileVal, length: logPileLength } = getLaDownCardData(get().pile);
    
  setLog(setLogData(`당신(${className})은 
    ${CARD_NAME_TABLE[logPileVal].name}(${logPileVal}) 카드를 
    ${logPileLength}장 냈습니다.`));


  // return {
  //   result: "layDown",
  //   copiedPile: copiedPile,
  //   ...setNextTurn(copiedPlayers, currentTurn),
  // };

  // setNextTurn(copiedPlayers, currentTurn) // 패쓰나 카드 제출 둘의 공통 적인 실행함수가 될듯
  
  setPlayerState(HUMAN_ID, "waiting");

  const nextPlayer = players.find(
    (player) => player.status.roundOrder === gameStatus.currentTurn + 1
  );

  if(nextPlayer){    
    setPlayerState(nextPlayer.id, "inAction");
  }else{
    const firstPlayer = players.find(
      (player) => player.status.roundOrder === 0
    );
    setPlayerState(firstPlayer!.id, "inAction");
  }

  const getTurnVal = (gameStatus.currentTurn + 1) >= players.length 
  ? 0 
  : gameStatus.currentTurn + 1;
  setTurn(getTurnVal)
};




// ! ==================== 현재 안쓰임
export const setNextTurn = (// 여기서 현재 플레이어 waiting, 다음 플레이어 InAction, 현재 턴 값 변경 하고 있음
  players: PlayerTypes[],
  currentTurn: number
): void => {
  // const copiedPlayers = copyPlayer(players); // 복사 중복되고 있음

  // const currentPlayer = copiedPlayers.find(
  //   (player) => player.status.gameState === "inAction"
  // )!;
  const currentPlayer = players.find(
    (player) => player.status.gameState === "inAction"
  )!; // 현재 InAction인 플레이어 조회
  currentPlayer.status.gameState = "waiting"; // 현재 InAction인 플레이어 웨이팅으로

  // const nextPlayer = copiedPlayers.find(
  //   (player) => player.status.roundOrder === currentTurn + 1
  // );
  const nextPlayer = players.find(
    (player) => player.status.roundOrder === currentTurn + 1
  ); // 다음 플레이어

  // console.log("setNextTurn currentPlayer => ", currentPlayer)
  // console.log("setNextTurn nextPlayer => ", nextPlayer)

  if (nextPlayer) {// 다음 플레이어 조회
    nextPlayer.status.gameState = "inAction"; // 다음 플레이어 InAction
  } else {// 없으면 0번으로
    // const firstPlayer = copiedPlayers.find(
    //   (player) => player.status.roundOrder === 0
    // );
    const firstPlayer = players.find(
      (player) => player.status.roundOrder === 0
    );

    if (firstPlayer) {
      firstPlayer.status.gameState = "inAction"; // 첫 플레이어로 InAction
    }
  }

  currentTurn = currentTurn + 1 >= players.length ? 0 : currentTurn + 1;

  // return {
  //   latestPlayer: currentPlayer.id,
  //   nextTurn: currentTurn + 1 >= players.length ? 0 : currentTurn + 1,
  //   nextPlayers: copiedPlayers,
  // };
};



// ! ==================== 수정됨 (immer.js)
export const getSettleRoundData = (
  playersLength: number,
  pile: PileTypes,
):(CardTypes[] | null) => {
  // const copiedPlayers = copyPlayer(players);
  // const copiedDeck = deck.length ? copyDeck(deck, "deck") : [];

  if (playersLength > 1) {

    // const rearrangedPlayers = setOrder(players, "game");

    const untiePile = pile.reduce(
      (acc: Array<CardTypes>, cur: Array<CardTypes>) => {
        acc.push(...cur);
        return acc;
      },
      []
    );

    // copiedDeck.push(...untiePile);ㅁ

    return untiePile;
  }

  return null;
};


// ! ==================== 수정됨 (immer.js)
export const setWinner = (
  players: PlayerTypes[],
  targetPlayer: PlayerTypes,
  gameStatus: GameStatusTypes,
  actions: GameActionsTypes
):void => {
  // const copiedPlayers = copyPlayer(players);
  // const copiedTargetPlayer = Object.assign({}, targetPlayer);
  // const filteredPlayers = copiedPlayers.filter(
  //   (player) => player.id !== copiedTargetPlayer.id
  // );

  const { setResultRank, setPlayers, setPlayerState, setTurn  } = actions;

  const filteredPlayers = players.filter(
    (player) => player.id !== targetPlayer.id
  );

  // const copiedResultRank = [...gameStatus.resultRank];aa

  // filteredPlayersaasd
  //   .sort((a, b) => a.status.roundOrder - b.status.roundOrder)
  //   .forEach((player, idx) => {
  //     player.status.roundOrder = idx;

  //     const getNextRoundOrder = 
  //     copiedTargetPlayer.status.roundOrder === (copiedPlayers.length - 1)
  //     ? 0 : copiedTargetPlayer.status.roundOrder;

  //     if (player.status.roundOrder === getNextRoundOrder) {
  //       player.status.gameState = "inAction";
  //     }
  //   });

  filteredPlayers
    .sort((a, b) => a.status.roundOrder - b.status.roundOrder)
    .forEach((player, idx) => {
      player.status.roundOrder = idx;

      const getNextRoundOrder = 
      targetPlayer.status.roundOrder === (players.length - 1)
      ? 0 : targetPlayer.status.roundOrder;

      if (player.status.roundOrder === getNextRoundOrder) {
        setPlayerState(player.id, "inAction")
      }
    });

  // copiedResultRank.push(copiedTargetPlayer);
  setResultRank([{...targetPlayer}]);
  setPlayers(filteredPlayers)

  // console.log(filteredPlayers);
  // console.log(copiedResultRank);asd

  const getTurnVal = gameStatus.currentTurn - 1 < 0 
  ? 0 
  : gameStatus.currentTurn - 1;
  setTurn(getTurnVal)

  // return {
  //   remainedPlayers: filteredPlayers,
  //   updatedResultRank: copiedResultRank,
  //   currentTurn:
  //     gameStatus.currentTurn - 1 < 0 ? 0 : gameStatus.currentTurn - 1,
  // };
};

// ! ==================== 수정됨 (immer.js)
export const performTaxCollect = async (
  deck: CardTypes[],
  players: PlayerTypes[],
  gameStep: GameStepTypes,
  actions: GameActionsTypes,
  setLog: (logData:LogTypes) => void,
  isRevolution: "revolution" | "gRevolution" | "continue"
):Promise<void> => {
  // const { setGameStep, setFirstInAction, setPlayers, runGame } = actions;
  const { setGameStep, setFirstInAction, runGame, setPlayers } = actions;

  if (gameStep === "inPlaying") return;

  setLog(setLogData(`[세금 징수 결과] ${REVOLUTION_TEXT[isRevolution]}`));

  if (isRevolution === "continue") {
    // console.log("Tax Collect result => continue");
    // setPlayers(actionSwapCard(players));
    // setPlayers();
    actionSwapCard(players, setPlayers)
  } else if (isRevolution === "gRevolution") {
    // console.log("Tax Collect result => gRevolution");

    // setPlayers(
    // );
    setGRevolution(deck, players, true)
    
  } 
  
  // else if (isRevolution === "revolution") {
  //   // console.log("Tax Collect result => revolution");
  // }

  setGameStep("inPlaying");
  setFirstInAction();

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
