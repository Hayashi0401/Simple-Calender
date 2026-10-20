import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Simplia Calendar',
        short_name: 'SimpliaCal',
        description: 'AI行動提案機能を備えたタスク・カレンダー管理アプリ',
        theme_color: '#8a2be2',
        background_color: '#ffffff',
        display: 'standalone', // スマホでアドレスバー等を消してアプリ単体表示にする設定
        orientation: 'portrait', // 縦画面固定
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    allowedHosts: true // 👈 外部ホスト経由のアクセスブロックを解除
  }
})