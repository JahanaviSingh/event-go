import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CitiesState {
  selectedCityId: number | null
}

const initialState: CitiesState = {
  selectedCityId: null,
}

export const citiesSlice = createSlice({
  name: 'cities',
  initialState,
  reducers: {
    addCityId: (state, action: PayloadAction<number>) => {
      state.selectedCityId = action.payload
    },
  },
})

export const { addCityId } = citiesSlice.actions

export const citiesReducer = citiesSlice.reducer
