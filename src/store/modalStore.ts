import { create } from "zustand";
import { useModalStoreTypes } from "./types/storeTypes";
import { useHumanStore } from "./humanStore";
import { useShallow } from "zustand/react/shallow";

export const useModalStore = create<useModalStoreTypes>((set, get) => ({
  eventModal: null,
  tipModal: {
    isActive: false,
    page: 0,
  },
  actions: {
    setEventOccured: (currentEvent) =>
      set({
        eventModal: currentEvent,
      }),
    setModalShow: (isModalShow) =>
      set((state) => ({
        tipModal: {
          ...state.tipModal,
          isActive: isModalShow,
        },
      })),
    handleEventChk: async () => {
      await new Promise<void>((resolve) => {
        useHumanStore.getState().actions.setHumanActionTrigger(resolve);
      });
      const { setEventOccured } = get().actions;
      setEventOccured(null);
    },
  },
}));

export const useModalStoreAction = () =>
  useModalStore(useShallow((state) => state.actions));
