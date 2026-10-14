import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import app from "../src/app.js";
import * as anilistFetch from "../src/providers/anilist/anilist.fetch.js";
import { UpstreamError } from "../src/utils/errors.js";

describe("Anime Routes Error & Validation Handling", () => {
  it("returns 404 for unknown route paths", async () => {
    const res = await request(app).get("/non-existent-endpoint");
    expect(res.status).toBe(404);
    expect(res.body.message).toContain("Not Found");
  });

  describe("GET /anime/search parameter validation", () => {
    it("returns 400 when an invalid season is provided", async () => {
      const res = await request(app).get("/anime/search?season=AUTUMN");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "error",
        message: "Invalid season: AUTUMN",
      });
    });

    it("returns 400 when an invalid format is provided", async () => {
      const res = await request(app).get("/anime/search?format=PODCAST");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "error",
        message: "Invalid format: PODCAST",
      });
    });

    it("returns 400 when an invalid status is provided", async () => {
      const res = await request(app).get("/anime/search?status=DELETED");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "error",
        message: "Invalid status: DELETED",
      });
    });

    it("returns 400 when averageScoreGreater exceeds 100", async () => {
      const res = await request(app).get("/anime/search?averageScoreGreater=105");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "error",
        message: "Invalid score, must be between 0 - 100",
      });
    });

    it("returns 400 when averageScoreLesser is below 0", async () => {
      const res = await request(app).get("/anime/search?averageScoreLesser=-5");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "error",
        message: "Invalid score, must be between 0 - 100",
      });
    });

    it("returns 400 when an invalid genre is specified", async () => {
      const res = await request(app).get("/anime/search?genres=Action,CyberpunkUnknown");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "error",
        message: "Invalid genres: CyberpunkUnknown",
      });
    });

    it("returns 400 when an invalid sort parameter is passed", async () => {
      const res = await request(app).get("/anime/search?sort=RANDOM_SORT");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        status: "error",
        message: "Invalid sort: RANDOM_SORT",
      });
    });
  });

  describe("Upstream Provider Failure Mapping", () => {
    it("returns 502 when upstream fetch throws an UpstreamError", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const fetchSpy = vi
        .spyOn(anilistFetch, "fetchAnilist")
        .mockRejectedValueOnce(new UpstreamError("AniList gateway timeout"));

      const res = await request(app).get("/anime/popular?page=9999");

      expect(res.status).toBe(502);
      expect(res.body).toEqual({
        status: "error",
        message: "AniList gateway timeout",
      });

      fetchSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });
});
