import './app.css'
import App from './App.svelte'

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const app = new App({
  target: document.getElementById('app')!,
})

export default app
