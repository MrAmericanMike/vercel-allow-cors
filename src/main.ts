import type { VercelRequest, VercelResponse, VercelApiHandler } from "@vercel/node";
type Methods = "GET" | "POST" | "PUT" | "PATCH" | "UPDATE" | "DELETE" | "HEAD" | "OPTIONS";

export type { VercelRequest, VercelResponse, VercelApiHandler };

interface CorsOptions {
	origin?: string | RegExp | boolean | Array<string | RegExp>;
	headers?: string[];
	methods?: Methods[];
	expose?: string[];
	maxAge?: number | undefined;
	credentials?: boolean;
}

const DEFAULTS: CorsOptions = {
	origin: "*",
	headers: [],
	methods: ["GET", "POST", "PUT", "PATCH", "UPDATE", "DELETE", "HEAD", "OPTIONS"],
	expose: [],
	maxAge: undefined,
	credentials: false
};

export default (options: CorsOptions) => {
	options = { ...DEFAULTS, ...options };

	return (handler: VercelApiHandler) => {
		return function (this: VercelApiHandler, request: VercelRequest, response: VercelResponse): VercelResponse | void | Promise<void> {
			if (options.origin === false) {
				return response.status(403).end("Not allowed");
			}

			if (options.origin !== "*" && request.headers.origin === undefined) {
				return response.status(403).end("Unknown origin");
			}

			if (typeof options.origin === "string") {
				if (options.origin === "*" || options.origin === request.headers.origin) {
					response.setHeader("Access-Control-Allow-Origin", options.origin);
				}
			} else if (options.origin instanceof RegExp) {
				if (options.origin.test(request.headers.origin as string)) {
					response.setHeader("Access-Control-Allow-Origin", request.headers.origin as string);
				}
			} else {
				const allowedOrigin = (options.origin as Array<string | RegExp>).some((origin: string | RegExp) =>
					typeof origin === "string" ? origin === request.headers.origin : origin.test(request.headers.origin as string)
				);
				if (allowedOrigin) {
					response.setHeader("Access-Control-Allow-Origin", request.headers.origin as string);
				}
			}

			if (options.headers?.length) {
				response.setHeader("Access-Control-Allow-Headers", options.headers!.join(", "));
			} else {
				let headers = request.headers["access-control-request-headers"];
				if (headers) {
					response.setHeader("Access-Control-Allow-Headers", headers);
				}
			}

			response.setHeader("Access-Control-Allow-Credentials", options.credentials!.toString());
			response.setHeader("Access-Control-Allow-Methods", options.methods!.join(", "));

			if (options.expose?.length) {
				response.setHeader("Access-Control-Expose-Headers", options.expose!.join(", "));
			}

			if (!isNaN(options.maxAge!)) {
				response.setHeader("Access-Control-Max-Age", options.maxAge!);
			}

			if (options.origin === "*" || (Array.isArray(options.origin) && options.origin.length > 1)) {
				response.setHeader("Vary", "Origin");
			}

			if (request.method === "OPTIONS") {
				return response.status(200).end();
			}

			return handler.apply(this, [request, response]);
		};
	};
};
