import { create } from "zustand";
import { useHumanStoreTypes } from "./types/storeTypes";
import { produce } from "immer";
import { useShallow } from "zustand/react/shallow";
import { setJokerCombine, setPlayerCardStatus } from "../features/setting";

export const useHumanStore = create<useHumanStoreTypes>((set, get) => ({
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
      set(
        produce((state) => {
          state.cardStatus = {
            ...state.cardStatus,
            ...setPlayerCardStatus(cardGroup, value),
          };
        })
      ),
    setCardStatusSelected: (value) =>
      set((state) => {
        const numVal = typeof value === "string" ? Number(value) : value;
        return {
          ...state,
          cardStatus: {
            ...state.cardStatus,
            selected: numVal,
          },
        };
      }),
    setCardStatusJokerPicked: (cardGroup) =>
      set(
        produce((state) => {
          state.cardStatus.jokerPicked = cardGroup;
        })
      ),
    setCardStatusCombine: (value) =>
      set(
        produce((state) => {
          state.cardStatus.cards = setJokerCombine(state.cardStatus, value);
        })
      ),
    setLatestAction: (value) =>
      set((state) => {
        return {
          ...state,
          latestAction: value,
        };
      }),
    setHumanActionTrigger: (value) =>
      set(
        produce((state) => {
          state.actionTrigger = value;
        })
      ),
  },
}));

export let humanActionTrigger: (() => void) | null = null;

export const useHumanStoreAction = () =>
  useHumanStore(useShallow((state) => state.actions));
