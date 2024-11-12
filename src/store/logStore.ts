
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
            })
        ),
        clearLog: (type) => set(
            produce(state => {
                // if(type === "all"){
                //     state.log = []
                // }else{
                //     state.log = 
                // }
            })
        ),
    }
}));

export const useLogStoreAction = () =>
    useLogStore(useShallow((state) => state.actions));
