import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function gtmPlugin(gtmId?: string): Plugin {
  return {
    name: 'gtm-plugin',
    transformIndexHtml(html) {
      if (!gtmId || !gtmId.trim()) {
        return html;
      }
      const trimmedId = gtmId.trim();
      const gtmHead = `<!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${trimmedId}');</script>
    <!-- End Google Tag Manager -->`;

      const gtmBody = `<!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${trimmedId}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->`;

      return html
        .replace(/<head>/i, `<head>\n    ${gtmHead}`)
        .replace(/(<body[^>]*>)/i, `$1\n    ${gtmBody}`);
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gtmId = process.env.VITE_GTM_ID || env.VITE_GTM_ID;
  const host = process.env.TAURI_DEV_HOST;

  return {
    base: './',
    plugins: [react(), gtmPlugin(gtmId)],
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
    server: {
      port: 3000,
      strictPort: true,
      host: host || true,
      hmr: host
        ? {
            protocol: 'ws',
            host,
            port: 3001,
          }
        : undefined,
      watch: {
        ignored: ['**/src-tauri/**'],
      },
    },
    build: {
      target:
        process.env.TAURI_ENV_PLATFORM === 'windows'
          ? 'chrome105'
          : ['es2021', 'chrome105', 'safari13'],
      minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
      sourcemap: !!process.env.TAURI_ENV_DEBUG,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('canvas-confetti')) {
                return 'vendor-confetti';
              }
              return 'vendor';
            }
            if (id.includes('src/data/sentences')) {
              return 'sentences-data';
            }
            if (id.includes('src/data/licenses')) {
              return 'licenses-data';
            }
          }
        }
      }
    }
  };
});

