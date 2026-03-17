import { StrictMode }  from 'react'
import { createRoot }  from 'react-dom/client'
import { Provider }    from 'react-redux'        // ← vérifie cet import
import { store }       from './app/store'         // ← import nommé { store }
import './index.css'
import AppRouter from './router/AppRouter'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppRouter />
    </Provider>
  </StrictMode>
)