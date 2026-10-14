import { describe, expect, it, vi } from "vitest";

import {
  BadRequestError,
  HttpError,
  NotFoundError,
  sendError,
  UpstreamError,
} from "../src/utils/errors.js";

describe("HTTP Error Classes", () => {
  it("creates HttpError with custom status code", () => {
    const error = new HttpError(418, "I'm a teapot");
    expect(error.statusCode).toBe(418);
    expect(error.message).toBe("I'm a teapot");
    expect(error.name).toBe("HttpError");
  });

  it("creates BadRequestError with status code 400", () => {
    const error = new BadRequestError("Invalid input parameter");
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Invalid input parameter");
    expect(error.name).toBe("BadRequestError");
  });

  it("creates NotFoundError with status code 404", () => {
    const error = new NotFoundError("Resource not found");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Resource not found");
    expect(error.name).toBe("NotFoundError");
  });

  it("creates UpstreamError with status code 502", () => {
    const error = new UpstreamError("Provider unreachable");
    expect(error.statusCode).toBe(502);
    expect(error.message).toBe("Provider unreachable");
    expect(error.name).toBe("UpstreamError");
  });
});

describe("sendError Responder", () => {
  it("formats HttpError with its designated status code", () => {
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    const res: any = { status: mockStatus };

    const badReq = new BadRequestError("Validation failed");
    sendError(res, badReq);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      message: "Validation failed",
    });
  });

  it("formats UpstreamError with status 502", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    const res: any = { status: mockStatus };

    const upstream = new UpstreamError("AniList is down");
    sendError(res, upstream);

    expect(mockStatus).toHaveBeenCalledWith(502);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      message: "AniList is down",
    });
    consoleSpy.mockRestore();
  });

  it("defaults unexpected standard errors to status 500", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    const res: any = { status: mockStatus };

    const genericError = new Error("Unexpected database disk error");
    sendError(res, genericError);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      message: "Unexpected database disk error",
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles non-Error thrown objects gracefully as status 500", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    const res: any = { status: mockStatus };

    sendError(res, "string-only error payload");

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      message: "Unknown error",
    });
    consoleSpy.mockRestore();
  });
});
