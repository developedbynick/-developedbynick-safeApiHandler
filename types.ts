import { NextFunction, Request, Response } from "express";
import { ArcjetDecision } from "@arcjet/node";
import z from "zod";

export type DataPayloadLocation = "body" | "query" | "params";

export type ArcjetDecisionProps<Req> = (args: {
	req: Req;
	fingerprint: string;
}) => Promise<ArcjetDecision>;

export type ExpressRequest<
	ZSchema extends z.ZodType,
	PayloadLocation extends DataPayloadLocation | undefined
> = PayloadLocation extends "body" // When the location is req.body
	? Request<any, any, z.infer<ZSchema>>
	: // When the location is req.params
	PayloadLocation extends "params"
	? Request<z.infer<ZSchema>, any, any>
	: // When the location is req.query
	PayloadLocation extends "query"
	? Request<any, any, any, z.infer<ZSchema>>
	: Request;

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
