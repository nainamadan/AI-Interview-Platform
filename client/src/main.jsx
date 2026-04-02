import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from "react-redux";
import { store } from './redux/store.js'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* so that we can use react router doms things like route create etc */}
    <BrowserRouter>
    <Provider store={store}>
    <App />
    </Provider>
    </BrowserRouter>
    
  </StrictMode>,
)
