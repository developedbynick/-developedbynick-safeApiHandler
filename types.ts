import { NextFunction, Request, Response } from "express";
import { ArcjetDecision } from "@arcjet/node";
import z from "zod";

export type DataPayloadLocation = "body" | "query" | "params";

export type ArcjetDecisionProps<Req extends Request<any, any, any, any>> = (args: {
	req: Req;
	fingerprint: string;
}) => Promise<ArcjetDecision>;

export type SafeApiHandlerProps<
	ZSchema extends z.ZodType, //
	IsProtected extends boolean,
	PayloadLocation extends DataPayloadLocation,
	Req extends Request<
		PayloadLocation extends "params" ? z.infer<ZSchema> : {}, //
		undefined,
		PayloadLocation extends "body" ? z.infer<ZSchema> : {},
		PayloadLocation extends "query" ? z.infer<ZSchema> : {}
	>
> = {
	handler: (req: Req, res: Response, next: NextFunction) => void;
	arcjetDecision?: ArcjetDecisionProps<Req>;
	validator?: ZSchema;
	isProtected?: IsProtected;
	location?: PayloadLocation;
};

export type StructuredResponseType<Payload extends object> = {
	statusCode: number;
	date: string;
	environment: "development" | "production" | "preview";
	data: Payload;
};
