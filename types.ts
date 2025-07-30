import { NextFunction, Request, Response } from "express";
import { ArcjetDecision } from "@arcjet/node";
import z from "zod";

export type DataPayloadLocation = "body" | "query" | "params";

export type ArcjetDecisionProps<Req> = (args: {
	req: Req;
	fingerprint: string;
}) => Promise<ArcjetDecision>;

type ExpressRequest<
	ZSchema extends z.ZodType,
	PayloadLocation extends DataPayloadLocation
> = Request<
	PayloadLocation extends "params"
		? z.infer<ZSchema> extends unknown
			? {}
			: z.infer<ZSchema>
		: {}, // This is for the params
	undefined,
	PayloadLocation extends "body"
		? z.infer<ZSchema> extends unknown
			? {}
			: z.infer<ZSchema>
		: {},
	PayloadLocation extends "query"
		? z.infer<ZSchema> extends unknown
			? {}
			: z.infer<ZSchema>
		: {}
>;

export type SafeApiHandlerProps<
	ZSchema extends z.ZodType,
	PayloadLocation extends DataPayloadLocation
> = {
	handler: (props: {
		req: ExpressRequest<ZSchema, PayloadLocation>;
		res: Response;
		next: NextFunction;
		decision?: ArcjetDecision;
	}) => void;
	arcjetDecision?: (
		req: ExpressRequest<ZSchema, PayloadLocation>,
		fingerprint: string
	) => Promise<ArcjetDecision>;
	validator?: ZSchema;
	location?: PayloadLocation;
};

export type StructuredResponseType<Payload extends object> = {
	statusCode?: number;
	date: string;
	environment: "development" | "production" | "preview";
	data: Payload;
};
