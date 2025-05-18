import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store'
import { setAuthToken } from './store/slices/authSlice'
import App from './App.jsx'
import './index.css'

// Initialize auth token if it exists in localStorage
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// Helper function to clear persisted state in case of errors
const handlePersistorError = () => {
  console.warn('Clearing persisted Redux state due to possible corruption');
  persistor.purge();
  window.location.reload();
}

// Add error event listener for Redux errors
window.addEventListener('error', (event) => {
  // Check if the error is related to Redux/unexpected keys
  if (event.error && event.error.message && 
      event.error.message.includes('Unexpected key') && 
      event.error.message.includes('reducer')) {
    handlePersistorError();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
)
