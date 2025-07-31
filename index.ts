import {ArcjetDecision} from "@arcjet/node";
import {
    DataPayloadLocation,
    ExpressRequest,
    SafeApiHandlerProps,
    StructuredResponseType,
} from "./types";
import {NextFunction, Request, Response} from "express";
import {BadRequest} from "http-errors";
import {z} from "zod";

export default function safeApiHandler<
    ZSchema extends z.ZodType, //
    PayloadLocation extends DataPayloadLocation
>({location, ...props}: SafeApiHandlerProps<ZSchema, PayloadLocation>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validate data provided to route handler
            let decision: ArcjetDecision | undefined;
            if (props.arcjetDecision) {
                const fingerprint = req.headers["x-browser-fingerprint"];
                if (!fingerprint || typeof fingerprint !== "string")
                    throw BadRequest("Invalid or missing browser fingerprint");

                decision = await props.arcjetDecision(
                    req as ExpressRequest<ZSchema, PayloadLocation>,
                    fingerprint
                );
                if (decision.isDenied()) {
                    res.status(400).json({
                        message: "Your request could not be processed at this time",
                    });
                }
            }
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
            return props.handler({
                req: req as ExpressRequest<ZSchema, PayloadLocation>,
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
    {statusCode = 200, data}: Pick<StructuredResponseType<T>, "statusCode" | "data">
) =>
    res.status(statusCode).json({
        statusCode,
        date: new Date().toLocaleDateString(),
        environment: process.env.NODE_ENV,
        data,
    });
