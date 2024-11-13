
import { create } from "zustand";
import { useLogStoreTypes } from "./types/storeTypes";
import { produce } from "immer";
import { useShallow } from "zustand/react/shallow";

export const useLogStore = create<useLogStoreTypes>((set, get) => ({
    log: [],
    actions: {
        view: () => console.log(get()),
        setLog: (logData) => set(
            produce((state) => {
                state.log.push(logData);
                if(state.log.length > 20){
                    state.log.splice(0, 10)
                }
            })
        )
    }
}));

export const useLogStoreAction = () =>
    useLogStore(useShallow((state) => state.actions));
