import { create } from "zustand";
import { useGameStoreTypes } from "./storeTypes";
import {
  clearHand,
  createDeck,
  dealDeck,
  setPlayer,
  shuffleDeck,
  sortPlayer,
} from "../features/setting";
import { MAXIMUM_CARDRANK, PLAYER_NUM } from "../config/contants";
import { produce } from "immer";

export const useGameStore = create<useGameStoreTypes>((set, get) => ({
  players: [...setPlayer(PLAYER_NUM)],
  deck: [...createDeck(MAXIMUM_CARDRANK)],
  gameStep: "booting",
  view: () => console.log(get()),
  setGameStep: (value) =>
    set((state) => {
      return { gameStep: value };
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
      })
    ),
  initDeck: (shuffle) =>
    set(
      produce((state) => {
        state.players = clearHand(state.players);
        state.deck = createDeck(MAXIMUM_CARDRANK);
        if (shuffle) {
          state.deck = shuffleDeck([...state.deck]);
        }
      })
    ),
  setSortPlayer: (type) => set(
    produce((state) => {
      state.players = sortPlayer(state.deck, state.players, type)
    })
  )
}));
