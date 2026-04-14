import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import rootSaga from '../sagas/rootSaga'
import rootReducer from './rootReducer'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true, // ✅ IMPORTANT (ou supprimer cette option)
    }).concat(sagaMiddleware),
})

sagaMiddleware.run(rootSaga)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>