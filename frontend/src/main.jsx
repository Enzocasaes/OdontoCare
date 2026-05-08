import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store'
import { AppRouter } from './app/router'
import { setAuthToken } from './services/api'

// Restaura o token do localStorage quando a aplicação inicia
const savedToken = localStorage.getItem('odontocare_token');
if (savedToken) {
  setAuthToken(savedToken);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
