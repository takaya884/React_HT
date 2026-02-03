import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { OutputOptions } from 'rollup'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // ビルド後のHTMLから type="module" と crossorigin を除去するプラグイン
    // file:// プロトコルでの CORS 制限を回避するため
    {
      name: 'remove-module-type',
      enforce: 'post',
      transformIndexHtml(html: string) {
        // 1. type="module" と crossorigin を除去
        let result = html
          .replace(/<script type="module" crossorigin/g, '<script defer')
          .replace(/<link rel="stylesheet" crossorigin/g, '<link rel="stylesheet"')
        // 2. <script> タグを <head> から </body> 直前に移動（IIFE形式はDOMロード後に実行する必要がある）
        const scriptMatch = result.match(/<script defer src="[^"]+"><\/script>/)
        if (scriptMatch) {
          result = result.replace(scriptMatch[0], '')
          result = result.replace('</body>', `  ${scriptMatch[0]}\n  </body>`)
        }
        return result
      },
    },
  ],
  base: './',
  build: {
    // file:// プロトコルでの動作のため、ESモジュールではなくIIFE形式で出力
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'HTApp',
        // コード分割を無効化（IIFE形式では不可のため、単一ファイルに結合）
        manualChunks: undefined,
      } as OutputOptions,
    },
    // モジュールプリロードのポリフィルを無効化（IIFE形式では不要）
    modulePreload: { polyfill: false },
    // Android 8.1 Go AOSPブラウザ対応（Chromium 61 = ES2015+async/await）
    target: 'es2015',
  },
})
