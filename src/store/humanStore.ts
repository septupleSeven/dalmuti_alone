import { create } from "zustand";
import { useHumanStoreTypes } from "./types/storeTypes";
import { useShallow } from "zustand/react/shallow";
import { immer } from "zustand/middleware/immer";

export const useHumanStore = create<useHumanStoreTypes>()(
  immer((set, get) => ({
    cardStatus: {
      rank: "",
      value: 0,
      cards: [],
      selected: 0,
      jokerPicked: [],
    },
    actionTrigger: null,
    latestAction: "waiting",

    actions: {
      view: () => console.log(get()),
      setCardStatus: (cardGroup, value) =>
        set((state) => {
          const numVal = value ? Number(value) : 0;
          state.cardStatus.cards = cardGroup.cards;
          state.cardStatus.value = cardGroup.cards[0].value;
          state.cardStatus.rank = cardGroup.rank;
          state.cardStatus.selected = numVal;
        }),
      setCardStatusSelected: (value) =>
        set((state) => {
          const numVal = typeof value === "string" ? Number(value) : value;
          state.cardStatus.selected = numVal;
        }),
      setCardStatusJokerPicked: (cardGroup) =>
        set((state) => {
          state.cardStatus.jokerPicked = cardGroup;
        }),
      setCardStatusJokerCombine: (value) =>
        set((state) => {
          const jokerNeeds = state.cardStatus.jokerPicked.slice(0, value);
          state.cardStatus.cards.push(...jokerNeeds);
        }),
      setLatestAction: (value) =>
        set((state) => {
          state.latestAction = value;
        }),
      setHumanActionTrigger: (value) =>
        set((state) => {
          state.actionTrigger = value;
        }),
      resetHumanStore: () =>
        set((state) => {
          state.cardStatus = {
            rank: "",
            value: 0,
            cards: [],
            selected: 0,
            jokerPicked: [],
          };
          state.actionTrigger = null;
          state.latestAction = "waiting";
        }),
    },
  }))
);

export let humanActionTrigger: (() => void) | null = null;

export const useHumanStoreAction = () =>
  useHumanStore(useShallow((state) => state.actions));
