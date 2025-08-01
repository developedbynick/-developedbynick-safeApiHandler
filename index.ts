import { ArcjetDecision } from "@arcjet/node";
import { DataPayloadLocation, DetermineCorrectRequestType, SafeApiHandlerProps, StructuredResponseType } from "./types";
import { NextFunction, Response } from "express";
import { BadRequest } from "http-errors";
import { z } from "zod";

export default function safeApiHandler<
	ZSchema extends z.ZodType, //
	PayloadLocation extends DataPayloadLocation = undefined
>({ location = undefined, ...props }: SafeApiHandlerProps<ZSchema, PayloadLocation>) {
	return async (req: DetermineCorrectRequestType<ZSchema, PayloadLocation>, res: Response, next: NextFunction) => {
		try {
			// Validate data provided to route handler
			const fingerprint = req.headers["x-browser-fingerprint"];
			if (!fingerprint || typeof fingerprint !== "string") throw BadRequest("Invalid or missing browser fingerprint");
			let decision: ArcjetDecision = await props.arcjetDecision(req, fingerprint);
			// Handling a denied decision
			if (decision.isDenied()) return res.status(400).json({ message: "Your request could not be processed at this time" });

			// If a validator was provided, then we execute the validation.
			if (props.validator) {
				// If no location is present, then we
				// Perform Data Validation
				const dataPayload =
					location === "params" //
						? req.params
						: location === "query"
						? req.query
						: req.body;
				const validationResult = props.validator.safeParse(dataPayload);
				// If the validation failed, we throw an error
				if (!validationResult.success) throw BadRequest(validationResult.error.issues[0].message);
			}
			// Call the expected handler
			return props.handler({
				req,
				res,
				next,
				decision,
			});
		} catch (e) {
			return next(e);
		}
	};
}
export const structuredResponse = <T extends object>(
	res: Response,
	{ statusCode = 200, data = {} as T }: Pick<StructuredResponseType<T>, "statusCode" | "data">
) =>
	res.status(statusCode).json({
		statusCode,
		date: new Date().toLocaleDateString(),
		environment: process.env.NODE_ENV,
		data,
	});
