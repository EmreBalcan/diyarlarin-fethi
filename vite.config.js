import { defineConfig } from 'vite'

export default defineConfig({
  // The game is hosted below /oyun/ and is also bundled inside Capacitor.
  // Relative asset URLs make both deployments load the same production build.
  base: './',
})
