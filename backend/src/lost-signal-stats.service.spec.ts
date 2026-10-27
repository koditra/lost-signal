import { ServiceUnavailableException } from "@nestjs/common";
import { LostSignalStatsService } from "./lost-signal-stats.service";

const validHtml = `<!doctype html><html><head>
<meta name="description" content="51 people RSVP'd for Lost Signal">
</head><body><h1>Lost Signal</h1></body></html>`;

function htmlResponse(html: string, status = 200): Response {
    return new Response(html, {
        status,
        headers: { "content-type": "text/html; charset=utf-8" },
    });
}

describe("LostSignalStatsService", () => {
    const originalFetch = global.fetch;
    const originalCapacity = process.env.RSVP_CAPACITY;
    let service: LostSignalStatsService;

    beforeEach(() => {
        delete process.env.RSVP_CAPACITY;
        service = new LostSignalStatsService();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        if (originalCapacity === undefined) {
            delete process.env.RSVP_CAPACITY;
        } else {
            process.env.RSVP_CAPACITY = originalCapacity;
        }
        jest.restoreAllMocks();
    });

    it("extracts the event and live count into the response shape", async () => {
        global.fetch = jest.fn().mockResolvedValue(htmlResponse(validHtml));

        const result = await service.getStats();

        expect(result).toEqual({
            event: "Lost Signal",
            rsvps: 51,
            capacity: 120,
            updatedAt: expect.any(String),
            stale: false,
        });
        expect(Number.isNaN(Date.parse(result.updatedAt))).toBe(false);
    });

    it("uses a configurable capacity", async () => {
        process.env.RSVP_CAPACITY = "200";
        service = new LostSignalStatsService();
        global.fetch = jest.fn().mockResolvedValue(htmlResponse(validHtml));

        await expect(service.getStats()).resolves.toMatchObject({ capacity: 200 });
    });

    it.each([
        ["missing metadata", "<html><h1>Lost Signal</h1></html>"],
        ["malformed metadata", '<meta name="description" content="many RSVPs"><h1>Lost Signal</h1>'],
        ["unexpected event page", '<meta name="description" content="51 people RSVP\'d for Lost Signal"><h1>Sign in</h1>'],
        ["login page", "<html><title>Login</title><form>Sign in</form></html>"],
    ])("does not fabricate a count for %s", async (_label, html) => {
        global.fetch = jest.fn().mockResolvedValue(htmlResponse(html));

        await expect(service.getStats()).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );
    });

    it("handles upstream HTTP errors and redirects without returning HTML", async () => {
        global.fetch = jest.fn().mockResolvedValue(htmlResponse("error", 503));
        await expect(service.getStats()).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );

        service = new LostSignalStatsService();
        global.fetch = jest.fn().mockResolvedValue(htmlResponse("redirect", 302));
        await expect(service.getStats()).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );
    });

    it("handles non-HTML responses, network errors, and timeouts", async () => {
        global.fetch = jest.fn().mockResolvedValue(
            new Response("denied", {
                status: 200,
                headers: { "content-type": "application/json" },
            }),
        );
        await expect(service.getStats()).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );

        service = new LostSignalStatsService();
        global.fetch = jest.fn().mockRejectedValue(new Error("network unavailable"));
        await expect(service.getStats()).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );

        service = new LostSignalStatsService();
        global.fetch = jest.fn().mockRejectedValue(
            new DOMException("request timed out", "TimeoutError"),
        );
        await expect(service.getStats()).rejects.toBeInstanceOf(
            ServiceUnavailableException,
        );
    });

    it("caches successful results until the cache expires", async () => {
        const fetchMock = jest.fn().mockResolvedValue(htmlResponse(validHtml));
        global.fetch = fetchMock;
        const now = jest.spyOn(Date, "now").mockReturnValue(1_000_000);

        await service.getStats();
        now.mockReturnValue(1_000_001);
        await service.getStats();
        expect(fetchMock).toHaveBeenCalledTimes(1);

        now.mockReturnValue(1_301_000);
        await service.getStats();
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("serves the last successful data as stale after refresh fails", async () => {
        const fetchMock = jest
            .fn()
            .mockResolvedValueOnce(htmlResponse(validHtml))
            .mockRejectedValueOnce(new Error("upstream offline"));
        global.fetch = fetchMock;
        const now = jest.spyOn(Date, "now").mockReturnValue(1_000_000);

        const successful = await service.getStats();
        now.mockReturnValue(1_301_000);
        const stale = await service.getStats();

        expect(stale).toEqual({ ...successful, stale: true });
        expect(stale.updatedAt).toBe(successful.updatedAt);
    });

    it("deduplicates simultaneous refresh requests", async () => {
        let finish!: (response: Response) => void;
        const fetchMock = jest.fn(
            () =>
                new Promise<Response>((resolve) => {
                    finish = resolve;
                }),
        );
        global.fetch = fetchMock;

        const first = service.getStats();
        const second = service.getStats();
        finish(htmlResponse(validHtml));

        await expect(Promise.all([first, second])).resolves.toEqual([
            expect.objectContaining({ rsvps: 51 }),
            expect.objectContaining({ rsvps: 51 }),
        ]);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
