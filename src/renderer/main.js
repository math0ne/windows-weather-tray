import '@fontsource/source-code-pro/600.css'
import './app.css'
import App from './App.svelte'
import { mount } from 'svelte'

// Check if electronAPI is available
console.log('electronAPI available:', typeof window.electronAPI !== 'undefined');
console.log('electronAPI:', window.electronAPI);

const app = mount(App, {
    target: document.getElementById('app')
})

export default app
