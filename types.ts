import { NextFunction, Request, Response } from "express";
import { ArcjetDecision } from "@arcjet/node";
import z from "zod";

export type DataPayloadLocation = "body" | "query" | "params";

export type ArcjetDecisionProps<TData extends object | unknown> = (args: {
	req: Request;
	data: TData | unknown;
	fingerprint: string;
}) => ArcjetDecision;

export type SafeApiHandlerProps<
	ZSchema extends z.ZodType, //
	IsProtected extends boolean,
	PayloadLocation extends DataPayloadLocation
> = {
	handler: (
		req: Request<
			PayloadLocation extends "params" ? z.infer<ZSchema> : {}, //
			undefined,
			PayloadLocation extends "body" ? z.infer<ZSchema> : {},
			PayloadLocation extends "query" ? z.infer<ZSchema> : {}
		>,
		res: Response<StructuredResponseType>,
		next: NextFunction
	) => void;
	arcjetDecision?: ArcjetDecisionProps<ZSchema extends z.ZodType ? z.infer<ZSchema> : unknown>;
	validator?: ZSchema;
	isProtected?: IsProtected;
	location?: PayloadLocation;
};

export type StructuredResponseType = {
	statusCode: number;
	date: string;
	environment: "development" | "production" | "preview";
	data: object;
};
