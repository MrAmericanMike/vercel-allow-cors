import type { VercelApiHandler, VercelRequest, VercelResponse } from "@vercel/node";
type Methods = "GET" | "POST" | "PUT" | "PATCH" | "UPDATE" | "DELETE" | "HEAD" | "OPTIONS";

export type { VercelApiHandler, VercelRequest, VercelResponse };

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
	const OPTIONS = { ...DEFAULTS, ...options };

	return (handler: VercelApiHandler) => {
		return function (this: VercelApiHandler, request: VercelRequest, response: VercelResponse): VercelResponse | void | Promise<void> {
			if (OPTIONS.origin === false) {
				return response.status(403).end("Not allowed");
			}

			if (OPTIONS.origin !== "*" && request.headers.origin === undefined) {
				return response.status(403).end("Unknown origin");
			}

			if (typeof OPTIONS.origin === "string") {
				if (OPTIONS.origin === "*" || OPTIONS.origin === request.headers.origin) {
					response.setHeader("Access-Control-Allow-Origin", OPTIONS.origin);
				}
			} else if (OPTIONS.origin instanceof RegExp) {
				if (OPTIONS.origin.test(request.headers.origin as string)) {
					response.setHeader("Access-Control-Allow-Origin", request.headers.origin as string);
				}
			} else if (Array.isArray(OPTIONS.origin)) {
				const allowedOrigin = OPTIONS.origin.some((origin) =>
					typeof origin === "string" ? origin === request.headers.origin : origin.test(request.headers.origin as string)
				);
				if (allowedOrigin) {
					response.setHeader("Access-Control-Allow-Origin", request.headers.origin as string);
				}
			}

			if (OPTIONS.headers?.length) {
				response.setHeader("Access-Control-Allow-Headers", OPTIONS.headers.join(", "));
			} else {
				const headers = request.headers["access-control-request-headers"];
				if (headers) {
					response.setHeader("Access-Control-Allow-Headers", headers);
				}
			}

			if (OPTIONS.credentials) {
				response.setHeader("Access-Control-Allow-Credentials", "true");
			}

			if (OPTIONS.methods?.length) {
				response.setHeader("Access-Control-Allow-Methods", OPTIONS.methods.join(", "));
			}

			if (OPTIONS.expose?.length) {
				response.setHeader("Access-Control-Expose-Headers", OPTIONS.expose!.join(", "));
			}

			if (OPTIONS.maxAge && !isNaN(OPTIONS.maxAge)) {
				response.setHeader("Access-Control-Max-Age", OPTIONS.maxAge);
			}

			if (OPTIONS.origin === "*" || (Array.isArray(OPTIONS.origin) && OPTIONS.origin.length > 1)) {
				response.setHeader("Vary", "Origin");
			}

			if (request.method === "OPTIONS") {
				response.status(200).end();
				return;
			}

			return handler.apply(this, [request, response]);
		};
	};
};
