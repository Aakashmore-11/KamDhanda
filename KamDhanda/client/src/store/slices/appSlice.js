import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // Current mode can be 'Freelance' or 'JobPortal'
    currentMode: localStorage.getItem('kamdhanda_mode') || 'Freelance',
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        setMode: (state, action) => {
            state.currentMode = action.payload;
            localStorage.setItem('kamdhanda_mode', action.payload);
        },
        toggleMode: (state) => {
            state.currentMode = state.currentMode === 'Freelance' ? 'JobPortal' : 'Freelance';
            localStorage.setItem('kamdhanda_mode', state.currentMode);
        }
    },
});

export const { setMode, toggleMode } = appSlice.actions;
export default appSlice.reducer;
