import { DataPayloadLocation, SafeApiHandlerProps } from "./types";
import { NextFunction, Request, Response } from "express";
import { BadRequest } from "http-errors";
import { z } from "zod";

export default function safeApiHandler<
	ZSchema extends z.ZodType, //
	IsProtected extends boolean,
	PayloadLocation extends DataPayloadLocation
>({ location, ...props }: SafeApiHandlerProps<ZSchema, IsProtected, PayloadLocation>) {
	return (req: Request<any, any, any, any>, res: Response, next: NextFunction) => {
		try {
			// Validate data provided to route handler
			if (props.validator) {
				// Perform Data Validation
				const dataPayload =
					location === "params" //
						? req.params
						: location === "query"
						? req.query
						: req.body;
				const validationResult = props.validator.safeParse(dataPayload);
				// If the validation failed, we throw an error
				if (!validationResult.success)
					throw BadRequest(validationResult.error.issues[0].message);
			}
			// Call the expected handler
			return props.handler(req, res, next);
		} catch (e) {
			return next(e);
		}
	};
}
