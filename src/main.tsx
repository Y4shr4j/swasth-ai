import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AppStoreProvider } from './store/appStore'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppStoreProvider>
    <App />
  </AppStoreProvider>
)
