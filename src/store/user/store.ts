import { createSlice } from '@reduxjs/toolkit'

interface UserState {
  isAuthenticated: boolean
}

const initialState: UserState = {
  isAuthenticated: false,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload
    },
  },
})

export const { setAuthenticated } = userSlice.actions

export const userReducer = userSlice.reducer
