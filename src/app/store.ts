import { configureStore }  from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import rootSaga             from '../sagas/rootSaga'
import rootReducer          from './rootReducer'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
})
////   démarre rootSaga qui démarre toutes les sous-sagas
sagaMiddleware.run(rootSaga)

export type AppDispatch = typeof store.dispatch
export type RootState   = ReturnType<typeof store.getState>  