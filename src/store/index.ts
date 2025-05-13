import { configureStore } from '@reduxjs/toolkit'
import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux'
import { showsReducer } from './shows/store'
import { citiesReducer } from './cities/store'
import { userReducer } from './user/store'

export const store = configureStore({
  reducer: {
    shows: showsReducer,
    cities: citiesReducer,
    user: userReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector 