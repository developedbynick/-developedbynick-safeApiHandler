import { ArcjetDecision } from "@arcjet/node";
import { NextFunction, Request, Response } from "express";
import z from "zod";

export type DataPayloadLocation = "body" | "params" | "query" | undefined;

// This utility takes in a zod schema as well as the payload location where that data will be stored. It then infers the type of the schema and places
export type DetermineCorrectRequestType<
	ZSchema = z.ZodType,
	PayloadLocation extends DataPayloadLocation = undefined
> = PayloadLocation extends "params"
	? Request<z.infer<ZSchema>>
	: // When the location is on req.body
	PayloadLocation extends "body"
	? Request<any, any, z.infer<ZSchema>>
	: // When the location is on req.query
	PayloadLocation extends "query"
	? Request<any, any, any, z.infer<ZSchema>>
	: Request;

type RequestHandlerProps<ZSchema extends z.ZodType | undefined = undefined, Location extends DataPayloadLocation = undefined> = {
	req: DetermineCorrectRequestType<ZSchema, Location>;
	res: Response;
	next: NextFunction;
	decision: ArcjetDecision;
};

export type SafeApiHandlerProps<ZSchema extends z.ZodType, Location extends DataPayloadLocation = undefined> = {
	handler: (props: RequestHandlerProps<ZSchema, Location>) => void;
	arcjetDecision: (req: DetermineCorrectRequestType<ZSchema, Location>, fingerprint: string) => Promise<ArcjetDecision>;
	validator?: ZSchema;
	location?: Location;
};

export type StructuredResponseType<T extends object> = {
	success: boolean;
	date: string;
	statusCode: number;
	environment: "production" | "development" | "preview";
	data: T;
};
