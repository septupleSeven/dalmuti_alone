import { create } from "zustand";
import { useGameStoreTypes } from "./storeTypes";
import {
  clearHand,
  createDeck,
  dealDeck,
  setGRevolution,
  setPlayer,
  setPlayerClass,
  setReadyForPlay,
  shuffleDeck,
  sortPlayer,
} from "../features/setting";
import { MAXIMUM_CARDRANK, PLAYER_NUM } from "../config/contants";
import { produce } from "immer";
import { actionSwapCard, isRevolution } from "../features/playing";
// import { actionLayDownCard, setNextTurn } from "../features/playing";

export const useGameStore = create<useGameStoreTypes>((set, get) => ({
  players: [...setPlayer(PLAYER_NUM)],
  deck: [...createDeck(MAXIMUM_CARDRANK)],
  gameStep: "booting",
  gameStepCondition: "booting",
  currentTurn: 0,
  view: () => console.log(get()),
  setGameStep: (value) =>
    set((state) => {
      return { gameStep: value };
    }),
  setgameStepCondition: (value) =>
    set((state) => {
      return { gameStepCondition: value };
    }),
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
  // setSortPlayerHand: () => set(
  //   produce((state) => {
  //     state.players = sortHand(state.players)
  //   })
  // ),
  getHuman: () => get().players.find((player) => player.id === "Human")!,
  setTurn: (nextTurn, nextPlayers) =>
    set(
      produce((state) => {
        state.currentTurn = nextTurn;
        state.players = nextPlayers;
      })
    ),
  playGame: async () => {
    const { deck, players, currentTurn, setTurn, setSortPlayer } = get();

    const isRevolutionVal = await isRevolution(players)

    if(isRevolutionVal === "continue"){
      console.log("continue")
      set(
        produce((state) => {
          state.players = actionSwapCard(players);
        })
      )
    }else if(isRevolutionVal === "gRevolution"){
      console.log("gRevolution")
      set(
        produce((state) => {
          state.players = setGRevolution(deck, players, true);
        })
      )
    }

    // const res = await actionSwapCard(players);

    // await actionSwapCard(players)

    // set(
    //   produce((state) => {
    //     state.players = actionSwapCard(players);
    //   })
    // )

    // if(res === "complete"){
    //   const { nextTurn, nextPlayers } = setNextTurn(players, currentTurn);
    //   setTurn(nextTurn, nextPlayers);
    // }else{
    //   console.log("zzz")
    // }

    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // await setNextTurn(players, currentTurn);
    // await setNextTurn(players, currentTurn, setTurn);
  },
}));

// export const usePlayingStore = create<usePlayingStoreTypes>()
