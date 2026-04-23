import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
console.log("🚀 MCIS System Booting...");

try {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
} catch (error) {
    console.error("FATAL BOOT ERROR:", error);
    document.getElementById('root').innerHTML = `
        <div style="padding: 20px; color: red; font-family: sans-serif;">
            <h2>System Boot Error</h2>
            <pre>${error.message}</pre>
            <p>Check console for details.</p>
        </div>
    `;
}
