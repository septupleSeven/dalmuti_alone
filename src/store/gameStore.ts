import { create } from "zustand";
import {
  useGameStoreTypes,
} from "./types/storeTypes";
import {
  clearHand,
  createDeck,
  dealDeck,
  setOrder,
  setPlayer,
  setPlayerGameState,
  setReadyForPlay,
  shuffleDeck,
  sortPlayer,
} from "../features/setting";
import { MAXIMUM_CARDRANK, PLAYER_NUM } from "../config/contants";
import { produce } from "immer";
import {
  getSettleRoundData,
  isRevolution,
  layDownCard,
  performTaxCollect,
  playerLayDownCard,
  setWinner,
} from "../features/playing";
import { LayDownCardType } from "../features/types/featuresTypes";
import { useHumanStore } from "./store";
import { useShallow } from "zustand/react/shallow";

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
    currentTurn: 0,
    latestPlayer: "",
    resultRank: [],
  },
  actions: {
    view: () => console.log(get()),
    setSettingStep: (value, type = "step") =>
      set((state) => {
        const keyVal = type === "step" ? "settingStep" : "settingStepCondition";
        return {
          ...state,
          settingStatus: {
            ...state.settingStatus,
            [keyVal]: value,
          },
        };
      }),
    setGameStep: (value) =>
      set((state) => ({
        gameStatus: {
          ...state.gameStatus,
          gameStep: value,
        },
      })),
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
    setInitializeDeck: (action) =>
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
    setTurn: (value) =>
      set((state) => ({
        gameStatus: {
          ...state.gameStatus,
          currentTurn: value,
        },
      })),
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
    setPlayers: (players) =>
      set(
        produce((state) => {
          state.players = players;
        })
      ),
    setResultRank: (players) =>
      set(
        produce((state) => {
          state.gameStatus.resultRank = players;
        })
      ),
    setLatestPlayer: (value) =>
      set((state) => ({
        gameStatus: {
          ...state.gameStatus,
          latestPlayer: value,
        },
      })),

    runTaxCollect: async () => {
      const { deck, players, gameStatus, actions } = get();
      const isRevolutionVal = await isRevolution(players);

      performTaxCollect(
        deck,
        players,
        gameStatus.gameStep,
        actions,
        isRevolutionVal
      );
    },
    runGame: async () => {
      const { players, gameStatus, pile, actions } = get();

      const {
        setTurn,
        setPile,
        setGameStep,
        setLatestPlayer,
        setPlayers,
        setResultRank,
      } = actions;

      const getCurrentPlayer = players.find(
        (player) => player.status.gameState === "inAction"
      );

      console.log(
        "%cNow Turn is =>",
        "background: #a7a8d9; color: #111",
        getCurrentPlayer?.name
      );

      if (getCurrentPlayer!.status.isLeader) {
        console.log(
          "%cRound Ended Winner is => ",
          "background: #bada55; color: #111",
          getCurrentPlayer
        );
        setGameStep("roundEnd");
        return;
      }

      let actionResult: LayDownCardType;

      if (getCurrentPlayer && getCurrentPlayer.id === "Human") {
        await new Promise<void>((resolve) => {
          useHumanStore.getState().actionTrigger = resolve;
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
        setTurn(actionResult.nextTurn);
        setPlayers(actionResult.nextPlayers);
        setPile(actionResult.copiedPile);
      } else if (actionResult.result === "pass") {
        setTurn(actionResult.nextTurn);
        setPlayers(actionResult.nextPlayers);
      }

      const isGameContinue = await new Promise<void>((resolve, reject) =>
        setTimeout(() => {
          const playerChk = get().players.find(
            (player) => player.id === actionResult.latestPlayer
          );

          if (
            // playerChk && !playerChk.hand.length
            playerChk &&
            playerChk.hand.length < 12
          ) {
            console.log(
              "%cGame Set winner is=> ",
              "background: #820e0e; color: #111",
              playerChk.name
            );
            const resultData = setWinner(players, playerChk, get().gameStatus);
            setPlayers(resultData.remainedPlayers);
            setResultRank(resultData.updatedResultRank);
            setTurn(resultData.currentTurn);

            if (get().players.length === 1) {
              alert("게임 종료");
              return reject();
            }
          }

          return resolve();
        }, 1500)
      )
        .then(() => true)
        .catch(() => false);

      if (!isGameContinue) {
        return;
      }

      if (isGameContinue && get().gameStatus.gameStep === "inPlaying") {
        await actions.runGame();
      }
    },

    settleRound: async () => {
      const { players, pile, deck, actions } = get();

      const { runGame, setGameStep, setGameOrder, setPile, setDeck, view } =
        actions;

      if (players.length > 1) {
        const settledData = getSettleRoundData(players, pile, deck);
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
        );
        // view();
      }

      const isComplete = await new Promise<string>((resolve) =>
        setTimeout(() => {
          setGameStep("inPlaying");
          return resolve("inPlaying");
        }, 2000)
      );

      if (isComplete) {
        console.log("Round Restart");
        runGame();
      }
    },
  },
}));

export const useGameStoreAction = () =>
  useGameStore(useShallow((state) => state.actions));
