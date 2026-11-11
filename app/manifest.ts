import type { MetadataRoute } from 'next'

// Lets the phone shortcut open full screen with its own icon, like an installed app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Marathon Plan — London 2027',
    short_name: 'LDN 2027',
    description: '3:10 London Marathon 2027 training and nutrition tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#0a0a0f',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
