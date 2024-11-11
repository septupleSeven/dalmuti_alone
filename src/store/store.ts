import { create } from "zustand";
import {
  useGameStoreTypes,
  useHandDispenserStoreTypes,
  useHumanStoreTypes,
} from "./types/storeTypes";
import {
  clearHand,
  createDeck,
  dealDeck,
  setGRevolution,
  setJokerCombine,
  setOrder,
  setPlayer,
  setPlayerCardStatus,
  setPlayerClass,
  setPlayerGameState,
  setReadyForPlay,
  shuffleDeck,
  sortPlayer,
} from "../features/setting";
import { MAXIMUM_CARDRANK, PLAYER_NUM } from "../config/contants";
import { produce } from "immer";
import {
  actionSwapCard,
  getSettleRoundData,
  isRevolution,
  layDownCard,
  playerLayDownCard,
  setWinner,
} from "../features/playing";
import Player from "../pages/Home/ui/Player";
import { LayDownCardType } from "../features/types/featuresTypes";

export let humanActionTrigger: (() => void) | null = null;

export const useGameStore = create<useGameStoreTypes>((set, get) => ({
  players: [...setPlayer(PLAYER_NUM)],
  deck: [...createDeck(MAXIMUM_CARDRANK)],
  pile: [],
  settingStatus: {
    settingStep: "booting",
    settingStepCondition: "booting",
  },
  gameStatus: {
    gameStep: "collectingTax",
    gameStepCondition: "collectingTax",
    currentTurn: 0,
    latestPlayer: "",
    // roundCount: 1,
    resultRank: []
  },
  // roundStatus: {
  //   log: {},
  //   resultRank: [],
  // },
  view: () => console.log(get()),
  setSettingStep: (value) =>
    set(
      produce((state) => {
        state.settingStatus.settingStep = value;
      })
    ),
  setSettingStepCondition: (value) =>
    set(
      produce((state) => {
        state.settingStatus.settingStepCondition = value;
      })
    ),
  setGameStep: (value) =>
    set(
      produce((state) => {
        state.gameStatus.gameStep = value;
      })
    ),
  setGameStepCondition: (value) =>
    set(
      produce((state) => {
        state.gameStatus.gameStepCondition = value;
      })
    ),
  setShuffleDeck: () =>
    set(
      produce((state) => {
        state.deck = shuffleDeck([...state.deck]);
      })
    ),
  setDealCard: (type) =>
    set(
      produce((state) => {
        state.players = dealDeck(state.deck, state.players, type).players;
        state.deck = dealDeck(state.deck, state.players, type).deck;

        if (type === "game") {
          state.players = setReadyForPlay(state.players, true);
        }
      })
    ),
  initDeck: (action) =>
    set(
      produce((state) => {
        state.players = clearHand(state.players);
        state.deck = createDeck(MAXIMUM_CARDRANK);
        if (action === "shuffle") {
          state.deck = shuffleDeck([...state.deck]);
        }
      })
    ),
  setSortPlayer: (type) =>
    set(
      produce((state) => {
        state.players = sortPlayer(state.deck, state.players, type);
      })
    ),
    setDeck: (deck) => {
      set(
        produce((state) => {
          state.deck = deck;
        })
      );
    },
  setPile: (pile) => {
    set(
      produce((state) => {
        state.pile = pile;
      })
    );
  },
  getHuman: () => get().players.find((player) => player.id === "Human")!,
  getCurrentLeaderOrder: () => {
    const currentLeader = get().players.find(
      (player) => player.status.isLeader
    );
    if (currentLeader) {
      return currentLeader.order;
    } else {
      return 0;
    }
  },
  setTurn: (nextTurn, nextPlayers) =>
    set(
      produce((state) => {
        state.gameStatus.currentTurn = nextTurn;

        // 이 부분 분할 고려 => setPlayer
        if(nextPlayers){
          state.players = nextPlayers;
        }
      })
    ),
  setGameOrder: (type) =>
    set(
      produce((state) => {
        state.players = setOrder(state.players, type);
      })
    ),
  setGameState: () =>
    set(
      produce((state) => {
        state.players = setPlayerGameState(state.players);
      })
    ),
  setPlayers: (players) => set(
    produce(state => {
      state.players = players;
    })
  ),
  setResultRank: (players) => set(
    produce(state => {
      state.gameStatus.resultRank = players;
    })
  ),






  setTaxCollect: async () => {
    const { deck, players, gameStatus, setGameStep, playGame, setGameState } =
      get();

    if (gameStatus.gameStep === "inPlaying") {
      // playGame();
      return;
    }

    const isRevolutionVal = await isRevolution(players);

    if (isRevolutionVal === "continue") {
      console.log("Tax Collect result => continue");
      set(
        produce((state) => {
          state.players = actionSwapCard(players);
        })
      );
    } else if (isRevolutionVal === "gRevolution") {
      console.log("Tax Collect result => gRevolution");
      set(
        produce((state) => {
          state.players = setGRevolution(deck, players, true);
        })
      );
    } else if (isRevolutionVal === "revolution") {
      console.log("Tax Collect result => revolution");
    }

    setGameStep("inPlaying");
    setGameState();

    const isComplete = await new Promise<string>((resolve) =>
      setTimeout(() => {
        return resolve("inPlaying");
      }, 2000)
    );

    if (isComplete) {
      playGame();
    }
  },
  setLatestPlayer: (value) =>
    set(
      produce((state) => {
        state.gameStatus.latestPlayer = value;
      })
    ),
















  playGame: async () => {
    const {
      players,
      gameStatus,
      pile,
      setTurn,
      setPile,
      playGame,
      setGameStep,
      setLatestPlayer,
      setPlayers,
      setResultRank,
    } = get();

    const getCurrentPlayer = players.find(
      (player) => player.status.gameState === "inAction"
    );

    console.log("%cNow Turn is =>", 'background: #a7a8d9; color: #111', getCurrentPlayer?.name);

    let actionResult: LayDownCardType;

    if (getCurrentPlayer!.status.isLeader) {
      console.log("%cRound Ended Winner is => ", 'background: #bada55; color: #111', getCurrentPlayer);
      setGameStep("roundEnd");
      return;
    }

    if (getCurrentPlayer && getCurrentPlayer.id === "Human") {
      await new Promise<void>((resolve) => {
        humanActionTrigger = resolve;
      });

      const getHumanStore = useHumanStore.getState();

      actionResult = playerLayDownCard(
        players,
        pile,
        gameStatus.currentTurn,
        getHumanStore.cardStatus,
        getHumanStore.latestAction
      );
    } else {
      actionResult = layDownCard(players, pile, gameStatus.currentTurn)!;
    }

    setLatestPlayer(actionResult.latestPlayer);

    if (actionResult.result === "layDown") {
      setTurn(actionResult.nextTurn, actionResult.nextPlayers);
      setPile(actionResult.copiedPile);
    } else if (actionResult.result === "pass") {
      setTurn(actionResult.nextTurn, actionResult.nextPlayers);
    }

    const isGameContinue = await new Promise<void>((resolve, reject) => setTimeout(() => {
      const playerChk = get().players.find(player => player.id === actionResult.latestPlayer);

      if(
        // playerChk && !playerChk.hand.length
        playerChk && playerChk.hand.length < 12
      ){
        console.log("%cGame Set winner is=> ", 'background: #820e0e; color: #111', playerChk.name)
        const resultData = setWinner(players, playerChk, get().gameStatus);
        setPlayers(resultData.remainedPlayers);
        setResultRank(resultData.updatedResultRank);
        setTurn(resultData.currentTurn);

        if(get().players.length === 1){
          alert("게임 종료");
          return reject();
        }

      }

      return resolve();
    }, 1500)).then(() => true).catch(() => false);

    if(!isGameContinue){ return }

    if (get().gameStatus.gameStep === "inPlaying") {
      playGame();
    }

  },










  settleRound: async () => {
    const {
      players,
      pile,
      deck,
      playGame,
      setGameStep,
      setGameOrder,
      setPile,
      setDeck,
      view
    } = get();

    if(players.length > 1){
      const settledData = getSettleRoundData(players, pile, 
        deck
      );
      // console.log("setGameOrder");
      setGameOrder("game"); 
      // view();
      // console.log("setPile");
      setPile(settledData!.clearPile);
      // view();
      // console.log("setDeck");
      setDeck(settledData!.updatedDeck);
      // view();
      // console.log("setcurrentTurn");
      set(
        produce((state) => {
          state.gameStatus.currentTurn = 0;
        })
      )
      view();
      
    }

    const isComplete = await new Promise<string>((resolve) =>
      setTimeout(() => {
        setGameStep("inPlaying");
        return resolve("inPlaying");
      }, 2000)
    );

    if (isComplete) {
      console.log("Round Restart")
      get().playGame();
    }
  },





  setRound: () => set(({})),
  setRoundLog: () => set(({}))




}));

export const useHandDispenserStore = create<useHandDispenserStoreTypes>(
  (set, get) => ({
    isDispenserOpen: false,
    view: () => console.log(get()),
    setDispenserOpen: () =>
      set({
        isDispenserOpen: true,
      }),
    setDispenserClose: () =>
      set({
        isDispenserOpen: false,
      }),
  })
);

export const useHumanStore = create<useHumanStoreTypes>((set, get) => ({
  cardStatus: {
    rank: "",
    value: 0,
    cards: [],
    selected: 0,
    jokerPicked: [],
  },
  latestAction: "waiting",
  view: () => console.log(get()),
  setCardStatus: (cardGroup, value) =>
    set(
      produce((state) => {
        if (value) {
          state.cardStatus = {
            ...state.cardStatus,
            ...setPlayerCardStatus(cardGroup, value)
          };
        } else {
          state.cardStatus = {
            ...state.cardStatus,
            ...setPlayerCardStatus(cardGroup, value)
          };
        }
      })
    ),
  setCardStatusSelected: (value) =>
    set(
      produce((state) => {
        let numVal = typeof value === "string" ? Number(value) : value;
        state.cardStatus.selected = numVal;
      })
    ),
  setCardStatusJokerPicked: (cardGroup) => set(
    produce(state => {
      state.cardStatus.jokerPicked = cardGroup;
    })
  ),
  setCardStatusCombine: (value) => set(
    produce(state => {
      state.cardStatus.cards = setJokerCombine(state.cardStatus, value);
    })
  ),
  setLatestAction: (value) =>
    set(
      produce((state) => {
        state.latestAction = value;
      })
    ),
  runHumanActionTrigger: () => {
    if (humanActionTrigger) {
      humanActionTrigger();
      humanActionTrigger = null;
    }
  },
}));

// export const usePlayingStore = create<usePlayingStoreTypes>()
