const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // Precache everything Next.js emits so tools keep working offline after
  // a first visit. Runtime caching below adds Google Fonts and images -
  // the only "external-ish" assets left after bundling.
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /^\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    // pdfjs-dist and canvas-based libs reference node-only modules that
    // aren't needed in the browser bundle.
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // @imgly/background-removal pulls in onnxruntime-web, whose bundles
    // (ort.bundle.min.mjs, ort.webgpu.bundle.min.mjs, etc.) are pre-built,
    // pre-minified ES modules that both (a) get `import()`-ed directly for
    // their real API surface, and (b) `new URL(self, import.meta.url)`
    // themselves at runtime to spawn as a Worker. That combination rules
    // out treating the whole file as a raw asset (breaks case a — code
    // that expects `ort.env.wasm` gets a URL string instead) — it has to
    // stay real, parsed JS. The only actual problem is Next's production
    // minifier (its own fork of terser-webpack-plugin, whose ecma target
    // can't parse these files' top-level `import.meta`) re-minifying
    // already-minified library code, so just skip minification for the
    // chunk(s) containing it — matched by content signature since dynamic
    // `import()` chunk names/output paths aren't predictable.
    config.plugins.push({
      apply(compiler) {
        compiler.hooks.thisCompilation.tap("SkipOnnxRuntimeMinify", (compilation) => {
          compilation.hooks.processAssets.tap(
            {
              name: "SkipOnnxRuntimeMinify",
              stage: webpack.Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
            },
            (assets) => {
              for (const name of Object.keys(assets)) {
                if (!/\.[cm]?js$/i.test(name)) continue;
                const source = assets[name].source().toString();
                if (source.includes("Copyright (c) Microsoft Corporation")) {
                  const { info } = compilation.getAsset(name);
                  compilation.updateAsset(name, assets[name], { ...info, minimized: true });
                }
              }
            }
          );
        });
      },
    });

    return config;
  },
};

module.exports = withPWA(nextConfig);
