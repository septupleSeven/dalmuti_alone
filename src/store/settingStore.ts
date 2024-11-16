import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useSettingStoreTypes } from "./types/storeTypes";
import { useShallow } from "zustand/react/shallow";

export const useSettingStore = create<useSettingStoreTypes>()(
  immer((set, get) => ({
    settingStatus: {
      settingStep: "booting",
      settingStepCondition: "booting",
    },
    actions: {
      view: () => console.log(get()),
      setSettingStep: (value, type = "step") =>
        set((state) => {
          const keyVal =
            type === "step" ? "settingStep" : "settingStepCondition";
          state.settingStatus[keyVal] = value;
        }),
    },
  }))
);

export const useSettingStoreAction = () => useSettingStore(useShallow((state) => state.actions));