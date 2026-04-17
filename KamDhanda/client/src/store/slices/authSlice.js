import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: undefined,           // full user object
    role: undefined,           // "company" | "recruiter" | "seeker"
    isLoggedIn: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        addUser: (state, action) => {
            state.user = action.payload.user;
            state.role = action.payload.role; // store role too
            state.isLoggedIn = true;
        },
        logoutUser: (state) => {
            state.user = null;
            state.role = null;
            state.isLoggedIn = false;
        },
    },
});

export const { addUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
