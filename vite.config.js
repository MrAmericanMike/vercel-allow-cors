import path from "path";
import dts from "vite-plugin-dts";

/** @type {import("vite").UserConfig} */
const config = {
	plugins: [
		dts({
			insertTypesEntry: true
		})
	],
	server: {
		port: 3000
	},
	preview: {
		port: 8080
	},
	build: {
		lib: {
			entry: path.resolve(__dirname, "src/main.ts"),
			name: "VercelAllowCors",
			fileName: "vercel-allow-cors",
			formats: ["cjs", "es"]
		},
		outDir: path.resolve((__dirname, "lib")),
		emptyOutDir: true
	}
};

export default config;

