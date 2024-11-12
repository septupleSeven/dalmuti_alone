
import { create } from "zustand";
import { useLogStoreTypes } from "./types/storeTypes";

export const useLogStore = create<useLogStoreTypes>((set, get) => ({}));
