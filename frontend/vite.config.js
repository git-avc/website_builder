import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { webserver_port } from "../../../sites/common_site_config.json";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	server: {
		port: 8080,
		proxy: getProxyOptions({ port: webserver_port }),
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	build: {
		outDir: `../${path.basename(path.resolve(".."))}/public/frontend`,
		emptyOutDir: true,
		target: "es2015",
	},
	optimizeDeps: {
		include: ["frappe-ui > feather-icons", "showdown", "engine.io-client"],
	},
});

function getProxyOptions({ port }) {
	return {
		"^/(app|login|api|assets|files|pages)": {
			target: `http://localhost:${port}`,
			ws: true,
			router: function (req) {
				const site_name = req.headers.host.split(":")[0];
				return `http://${site_name}:${port}`;
			},
		},
	};
}
