import { createSlice } from "@reduxjs/toolkit";

export const sceneStore = createSlice({
    name: "scene",
    initialState: {
        currentStep: "Ready",
    },
    reducers: {
        aaa: (state, action) => {}
    }
});