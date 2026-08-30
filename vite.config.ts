import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function getGtmId(mode: string): string | undefined {
  const env = loadEnv(mode, process.cwd(), '');
  const envId = process.env.VITE_GTM_ID || env.VITE_GTM_ID;
  if (envId && envId.trim()) {
    return envId.trim();
  }

  const configPaths = [
    path.resolve(process.cwd(), 'config.js'),
    path.resolve(process.cwd(), 'public/config.js'),
  ];
  for (const cp of configPaths) {
    if (fs.existsSync(cp)) {
      try {
        const content = fs.readFileSync(cp, 'utf-8');
        const match = content.match(/GTM_ID\s*=\s*['"`]([^'"`]+)['"`]/);
        if (match && match[1] && match[1].trim() && !match[1].includes('G-XXXXXXXXXX')) {
          return match[1].trim();
        }
      } catch (e) {}
    }
  }
  return undefined;
}

function gtmPlugin(gtmId?: string): Plugin {
  return {
    name: 'gtm-plugin',
    generateBundle() {
      if (gtmId && gtmId.trim()) {
        const trimmed = gtmId.trim();
        this.emitFile({
          type: 'asset',
          fileName: 'config.js',
          source: `const GTM_ID = '${trimmed}';\nif (typeof window !== 'undefined') {\n  window.GTM_ID = GTM_ID;\n}\nif (typeof module !== 'undefined' && module.exports) {\n  module.exports = { GTM_ID };\n}\n`,
        });
      }
    },
    transformIndexHtml(html) {
      if (!gtmId || !gtmId.trim()) {
        return html;
      }
      const trimmedId = gtmId.trim();

      let headScript = '';
      let bodyScript = '';

      if (trimmedId.startsWith('GTM-')) {
        headScript = `<!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${trimmedId}');</script>
    <!-- End Google Tag Manager -->`;

        bodyScript = `<!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${trimmedId}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->`;
      } else {
        headScript = `<!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(trimmedId)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trimmedId}');
    </script>
    <!-- End Google tag (gtag.js) -->`;
      }

      let result = html;
      if (headScript) {
        result = result.replace(/<head>/i, `<head>\n    ${headScript}`);
      }
      if (bodyScript) {
        result = result.replace(/(<body[^>]*>)/i, `$1\n    ${bodyScript}`);
      }
      return result;
    },
  };
}

export default defineConfig(({ mode }) => {
  const gtmId = getGtmId(mode);
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

