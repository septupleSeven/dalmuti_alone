import { create } from "zustand";
import { useHandDispenserStoreTypes } from "./types/storeTypes";
import { useShallow } from "zustand/react/shallow";

export const useHandDispenserStore = create<useHandDispenserStoreTypes>(
  (set, get) => ({
    isDispenserOpen: false,
    actions: {
      view: () => console.log(get()),
      setDispenserOpen: () =>
        set({
          isDispenserOpen: true,
        }),
      setDispenserClose: () =>
        set({
          isDispenserOpen: false,
        }),
    },
  })
);

export const useHandDispenserStoreAction = () =>
  useHandDispenserStore(useShallow((state) => state.actions));
