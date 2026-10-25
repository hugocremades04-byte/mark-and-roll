import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// `vite build` produit un Worker Cloudflare : dist/server/server.js (le rendu serveur)
// et dist/client (fichiers statiques). wrangler.jsonc publie les deux.
export default defineConfig({
  // Le Worker n'a pas de node_modules à l'exécution : toutes les dépendances sont empaquetées.
  ssr: { noExternal: true, external: ["cloudflare:workers"] },
  build: { rollupOptions: { external: [/^cloudflare:/] } },
  plugins: [tanstackStart({ server: { entry: "server" } }), react(), tsconfigPaths()],
});
