import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { load } from "cheerio";

export interface LostSignalStats {
    event: "Lost Signal";
    rsvps: number;
    capacity: number;
    updatedAt: string;
    stale: boolean;
}

interface CachedStats extends Omit<LostSignalStats, "stale"> {
    fetchedAt: number;
}

const SOURCE_URL = "https://rsvp.hackclub.community/lost-signal/stats";
const DEFAULT_CAPACITY = 120;
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 10 * 1000;

function positiveIntegerSetting(name: string, fallback: number): number {
    const raw = process.env[name];
    if (raw === undefined || raw === "") {
        return fallback;
    }

    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value <= 0) {
        throw new Error(`${name} must be a positive safe integer.`);
    }
    return value;
}

@Injectable()
export class LostSignalStatsService {
    private readonly logger = new Logger(LostSignalStatsService.name);
    private readonly capacity = positiveIntegerSetting("RSVP_CAPACITY", DEFAULT_CAPACITY);
    private readonly cacheTtlMs = positiveIntegerSetting(
        "RSVP_CACHE_TTL_MS",
        DEFAULT_CACHE_TTL_MS,
    );
    private readonly timeoutMs = positiveIntegerSetting(
        "RSVP_TIMEOUT_MS",
        DEFAULT_TIMEOUT_MS,
    );
    private cachedStats: CachedStats | null = null;
    private refreshInFlight: Promise<LostSignalStats> | null = null;

    async getStats(): Promise<LostSignalStats> {
        if (this.cachedStats && Date.now() - this.cachedStats.fetchedAt < this.cacheTtlMs) {
            return this.toResponse(this.cachedStats, false);
        }

        if (!this.refreshInFlight) {
            this.refreshInFlight = this.refreshStats();
        }

        try {
            return await this.refreshInFlight;
        } finally {
            this.refreshInFlight = null;
        }
    }

    private async refreshStats(): Promise<LostSignalStats> {
        try {
            const response = await fetch(SOURCE_URL, {
                headers: { Accept: "text/html" },
                redirect: "manual",
                signal: AbortSignal.timeout(this.timeoutMs),
            });

            if (!response.ok || response.status >= 300) {
                throw new Error(`Upstream returned HTTP ${response.status}.`);
            }

            const contentType = response.headers.get("content-type") ?? "";
            if (!contentType.toLowerCase().includes("text/html")) {
                throw new Error("Upstream response was not HTML.");
            }

            const html = await response.text();
            const extracted = this.extractStats(html);
            const now = Date.now();
            this.cachedStats = {
                ...extracted,
                capacity: this.capacity,
                updatedAt: new Date(now).toISOString(),
                fetchedAt: now,
            };
            return this.toResponse(this.cachedStats, false);
        } catch (error) {
            this.logger.warn(
                `RSVP stats refresh failed: ${error instanceof Error ? error.message : "unknown error"}`,
            );
            if (this.cachedStats) {
                return this.toResponse(this.cachedStats, true);
            }
            throw new ServiceUnavailableException(
                "RSVP statistics are temporarily unavailable.",
            );
        }
    }

    private extractStats(html: string): { event: "Lost Signal"; rsvps: number } {
        const $ = load(html);
        const event = $("h1").first().text().trim();
        const description = $('meta[name="description"]').attr("content")?.trim() ?? "";

        if (event !== "Lost Signal") {
            throw new Error("Upstream page did not identify the Lost Signal event.");
        }

        const match = description.match(/^([\d,]+)\s+people\s+RSVP(?:'|’)d\s+for\s+Lost Signal$/i);
        if (!match) {
            throw new Error("Upstream page did not include valid RSVP metadata.");
        }

        const rsvps = Number(match[1].replaceAll(",", ""));
        if (!Number.isSafeInteger(rsvps) || rsvps < 0) {
            throw new Error("Upstream RSVP count was invalid.");
        }

        return { event, rsvps };
    }

    private toResponse(stats: CachedStats, stale: boolean): LostSignalStats {
        return {
            event: stats.event,
            rsvps: stats.rsvps,
            capacity: stats.capacity,
            updatedAt: stats.updatedAt,
            stale,
        };
    }
}
