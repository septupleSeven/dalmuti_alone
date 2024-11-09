import { create } from "zustand";
import { useGameStoreTypes } from "./types/storeTypes";
import {
  clearHand,
  createDeck,
  dealDeck,
  setGRevolution,
  setOrder,
  setPlayer,
  setPlayerClass,
  setReadyForPlay,
  shuffleDeck,
  sortPlayer,
} from "../features/setting";
import { MAXIMUM_CARDRANK, PLAYER_NUM } from "../config/contants";
import { produce } from "immer";
import { actionSwapCard, isRevolution, layDownCard } from "../features/playing";

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
  },
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
  setPile: (pile) => {
    set(
      produce((state) => {
        state.pile = pile;
      })
    );
  },
  getHuman: () => get().players.find((player) => player.id === "Human")!,
  setTurn: (nextTurn, nextPlayers) =>
    set(
      produce((state) => {
        state.gameStatus.currentTurn = nextTurn;
        state.players = nextPlayers;
      })
    ),
  setGameOrder: (type) => set(
    produce(state => {
      state.players = setOrder(state.players, type);
    })
  ),
  setTaxCollect: async () => {
    const { deck, players, gameStatus, setGameStep, playGame } = get();

    if (gameStatus.gameStep === "inPlaying") {
      // playGame();
      return;
    }

    const isRevolutionVal = await isRevolution(players);

    if (isRevolutionVal === "continue") {
      console.log("continue");
      set(
        produce((state) => {
          state.players = actionSwapCard(players);
        })
      );
    } else if (isRevolutionVal === "gRevolution") {
      console.log("gRevolution");
      set(
        produce((state) => {
          state.players = setGRevolution(deck, players, true);
        })
      );
    }

    const isComplete = await new Promise((resolve) => {
      setGameStep("inPlaying");
      resolve("inPlaying");
    });

    if (isComplete) {
      playGame();
    }
  },
  playGame: async () => {
    const { players, gameStatus, pile, setTurn, setPile, playGame } = get();

    const actionResult = layDownCard(players, pile, gameStatus.currentTurn)!;

    if (actionResult.result === "layDown") {
      setTurn(actionResult.nextTurn, actionResult.nextPlayers);
      setPile(actionResult.copiedPile);
    } else if (actionResult.result === "pass") {
      setTurn(actionResult.nextTurn, actionResult.nextPlayers);
    }

    // if (gameStatus.currentTurn === 0) {
    //   playGame();
    // }

    if (gameStatus.gameStep === "inPlaying" && gameStatus.currentTurn < 4) {
      playGame();
    }
  },
}));

// export const usePlayingStore = create<usePlayingStoreTypes>()
