import opentelemetry from "@opentelemetry/api";

export const tracer = opentelemetry.trace.getTracer("@opennetwork/happening");

