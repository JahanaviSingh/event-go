import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ShowsState {
  selectedShowId: number | null
  selectedShowtimeId: number | null
  selectedScreenId: number | null
  selectedSeats: Array<{ row: number; column: number }>
}

const initialState: ShowsState = {
  selectedShowId: null,
  selectedShowtimeId: null,
  selectedScreenId: null,
  selectedSeats: [],
}

export const showsSlice = createSlice({
  name: 'shows',
  initialState,
  reducers: {
    addShowId: (state, action: PayloadAction<number>) => {
      state.selectedShowId = action.payload
    },
    addShowtimeId: (state, action: PayloadAction<number>) => {
      state.selectedShowtimeId = action.payload
    },
    addScreenId: (state, action: PayloadAction<number>) => {
      state.selectedScreenId = action.payload
    },
    addSeat: (state, action: PayloadAction<{ row: number; column: number }>) => {
      state.selectedSeats.push(action.payload)
    },
    resetSeats: (state) => {
      state.selectedSeats = []
    },
    resetShows: (state) => {
      state.selectedShowId = null
      state.selectedShowtimeId = null
      state.selectedScreenId = null
      state.selectedSeats = []
    },
  },
})

export const {
  addShowId,
  addShowtimeId,
  addScreenId,
  addSeat,
  resetSeats,
  resetShows,
} = showsSlice.actions

export const showsReducer = showsSlice.reducer 