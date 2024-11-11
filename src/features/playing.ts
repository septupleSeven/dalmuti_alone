import { useGameStore } from "../store/store";
import { HumanCardStatusTypes, HumanLatestActionTypes } from "../store/types/storeTypes";
import { setDelay, setOrder, sortHand } from "./setting";
import { CardTypes, LayDownCardType, PileTypes, PlayerTypes } from "./types/featuresTypes";
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
  pile: PileTypes,
  currentTurn: number
): LayDownCardType => {
  const copiedPlayers = copyPlayer(players);
  const copiedPile = copyDeck(pile, "pile");

  let isPass = Math.floor(Math.random() * 10) > 7 ? true : false;

  const currentPlayer = copiedPlayers.find(
    (player) => player.status.roundOrder === currentTurn
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

    if(currentLeaderPlayer.id === currentPlayer.id){
      return {
        result: "roundEnd",
        latestPlayer: currentLeaderPlayer.id
      };
    }

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
    console.log("Action: Pass ACT");
    return {
      result: "pass",
      ...setNextTurn(copiedPlayers, currentTurn),
    };
  } else {
    console.log(
      "Action: LayDown ACT | value is =>", 
      copiedPile[copiedPile.length - 1][0].value, 
      " / length is =>", copiedPile[copiedPile.length - 1].length);
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
  latestPlayer: string;
  nextTurn: number;
  nextPlayers: PlayerTypes[];
} => {
  const copiedPlayers = copyPlayer(players);

  const currentPlayer = copiedPlayers.find(player => player.status.gameState === "inAction")!;
  currentPlayer.status.gameState = "waiting";

  const nextPlayer = copiedPlayers.find(player => player.status.roundOrder === (currentTurn + 1));

  // console.log("setNextTurn currentPlayer => ", currentPlayer)
  // console.log("setNextTurn nextPlayer => ", nextPlayer)

  if (nextPlayer) {
    nextPlayer.status.gameState = "inAction";
  } else {
    const firstPlayer = copiedPlayers.find(player => player.status.roundOrder === 0);
    
    if(firstPlayer){
      firstPlayer.status.gameState = "inAction";
    }
  }

  return {
    latestPlayer: currentPlayer.id,
    nextTurn: currentTurn + 1 >= players.length ? 0 : currentTurn + 1,
    nextPlayers: copiedPlayers,
  };
};




export const playerLayDownCard = (
  players: PlayerTypes[],
  pile: Array<CardTypes>[],
  currentTurn: number,
  cardStatus: HumanCardStatusTypes,
  actionType: HumanLatestActionTypes
): LayDownCardType => {
  const copiedPlayers = copyPlayer(players);
  const copiedPile = copyDeck(pile, "pile");
  const copiedCardStatus = structuredClone(cardStatus);

  const humanPlayer = copiedPlayers.find(
    (player) => player.id === "Human"
  )!;

  const { hand } = humanPlayer;

  if(actionType === "layDown"){
    const currentLeaderPlayer = copiedPlayers.find(
      (player) => player.status.isLeader === true
    )!;

    if(!pile.length) {
      const toSendCards = [];

      for(let i = 0; i < copiedCardStatus.selected; i++){
        toSendCards.push({ ...copiedCardStatus.cards[i] });
        const targetCardIdx = hand.findIndex(card => card.id === copiedCardStatus.cards[i].id);
        hand.splice(targetCardIdx, 1);
      }

      copiedPile.push(toSendCards);
      humanPlayer.status.isLeader = true;

    }else{
      const latestPileCards = copiedPile[copiedPile.length - 1];

      if(
        copiedCardStatus.cards[0].value < latestPileCards[0].value
        && copiedCardStatus.selected === latestPileCards.length
      ){
        
        console.log("Human => ", copiedPlayers)
        const toSendCards = [];

        for(let i = 0; i < copiedCardStatus.selected; i++){
          toSendCards.push({ ...copiedCardStatus.cards[i] });
          const targetCardIdx = hand.findIndex(card => card.id === copiedCardStatus.cards[i].id);
          hand.splice(targetCardIdx, 1);
        }
        
        copiedPile.push(toSendCards);
        currentLeaderPlayer.status.isLeader = false;
        humanPlayer.status.isLeader = true;
      }
      
    }

  }

  if(actionType === "passed") {
    console.log("Action: Pass ACT");
    return {
      result: "pass",
      ...setNextTurn(copiedPlayers, currentTurn),
    };
  }

  console.log(
    "Action: LayDown ACT | value is =>", 
    copiedPile[copiedPile.length - 1][0].value, 
    " / length is =>", copiedPile[copiedPile.length - 1].length);
  return {
    result: "layDown",
    copiedPile: copiedPile,
    ...setNextTurn(copiedPlayers, currentTurn),
  }
}

export const getSettleRoundData = (
  players: PlayerTypes[],
  pile: PileTypes,
  deck: CardTypes[]
) => {
  const copiedPlayers = structuredClone(players);
  const copiedDeck = deck.length ? copyDeck(deck, "deck") : [];

  if(copiedPlayers.length > 1){
    const rearrangedPlayers = setOrder(copiedPlayers, "game");
    const untiePile = pile.reduce((acc:Array<CardTypes>, cur:Array<CardTypes>) => {
      acc.push(...cur);
      return acc
    }, []);
    copiedDeck.push(...untiePile);

    return {
      rearrangedPlayers: rearrangedPlayers,
      clearPile: [],
      updatedDeck: copiedDeck
    }
  }

}