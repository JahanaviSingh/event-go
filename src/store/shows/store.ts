import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ShowsState {
  selectedShowId: number | null
  selectedScreenId: number | null
  selectedShowtimeId: number | null
  selectedSeats: Array<{ row: number; column: number }>
}

const initialState: ShowsState = {
  selectedShowId: null,
  selectedScreenId: null,
  selectedShowtimeId: null,
  selectedSeats: [],
}

export const showsSlice = createSlice({
  name: 'shows',
  initialState,
  reducers: {
    addShowId: (state, action: PayloadAction<number>) => {
      state.selectedShowId = action.payload
    },
    addScreenId: (state, action: PayloadAction<number>) => {
      state.selectedScreenId = action.payload
    },
    addShowtimeId: (state, action: PayloadAction<number>) => {
      state.selectedShowtimeId = action.payload
    },
    addSeat: (
      state,
      action: PayloadAction<{ row: number; column: number }>,
    ) => {
      state.selectedSeats.push(action.payload)
    },
    removeSeat: (
      state,
      action: PayloadAction<{ row: number; column: number }>,
    ) => {
      state.selectedSeats = state.selectedSeats.filter(
        (seat) =>
          !(
            seat.row === action.payload.row &&
            seat.column === action.payload.column
          ),
      )
    },
    resetShows: (state) => {
      state.selectedShowId = null
      state.selectedScreenId = null
      state.selectedShowtimeId = null
      state.selectedSeats = []
    },
    resetSeats: (state) => {
      state.selectedSeats = []
    },
  },
})

export const {
  addShowId,
  addScreenId,
  addShowtimeId,
  addSeat,
  removeSeat,
  resetShows,
  resetSeats,
} = showsSlice.actions

export const showsReducer = showsSlice.reducer
