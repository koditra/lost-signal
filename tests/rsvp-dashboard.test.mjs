import test from "node:test";
import assert from "node:assert/strict";

import {
    dashboardState,
    deriveProgress,
    validateStats,
} from "../rsvp-dashboard.mjs";

test("derives zero RSVP progress without NaN", () => {
    assert.deepEqual(deriveProgress(0, 120), {
        percentage: 0,
        fillPercentage: 0,
        accessibleValue: 0,
        status: "120 spots remaining",
    });
});

test("derives partial RSVP progress", () => {
    assert.deepEqual(deriveProgress(51, 120), {
        percentage: 42.5,
        fillPercentage: 42.5,
        accessibleValue: 51,
        status: "69 spots remaining",
    });
});

test("reports reached capacity and caps the visual progress at 100%", () => {
    assert.equal(deriveProgress(120, 120).status, "Capacity reached");
    assert.equal(deriveProgress(120, 120).fillPercentage, 100);
});

test("preserves over-capacity count and percentage while clamping accessible fill", () => {
    assert.deepEqual(deriveProgress(125, 120), {
        percentage: 104.16666666666667,
        fillPercentage: 100,
        accessibleValue: 120,
        status: "5 RSVPs over capacity",
    });
});

test("uses a configurable capacity and reports a singular over-capacity RSVP", () => {
    assert.equal(deriveProgress(4, 8).status, "4 spots remaining");
    assert.equal(deriveProgress(9, 8).status, "1 RSVP over capacity");
});

test("rejects invalid counts and capacities", () => {
    for (const [rsvps, capacity] of [
        [-1, 120],
        [1.5, 120],
        [0, 0],
        [0, -1],
        [0, Number.NaN],
    ]) {
        assert.throws(() => deriveProgress(rsvps, capacity));
    }
});

test("validates the live API response shape", () => {
    const stats = {
        event: "Lost Signal",
        rsvps: 51,
        capacity: 120,
        updatedAt: "2026-10-26T23:39:00.000Z",
        stale: false,
    };
    assert.equal(validateStats(stats), stats);
    assert.throws(() => validateStats({ ...stats, rsvps: undefined }));
    assert.throws(() => validateStats({ ...stats, capacity: 0 }));
});

test("selects loading, error, success, and stale dashboard states", () => {
    assert.equal(dashboardState({ hasData: false, loading: true }), "loading");
    assert.equal(dashboardState({ hasData: false }), "error");
    assert.equal(dashboardState({ hasData: true }), "success");
    assert.equal(dashboardState({ hasData: true, stale: true }), "stale");
});

test("renders loading, success, and stale data with accessible progress values", async () => {
    class Element {
        constructor() {
            this.hidden = false;
            this.textContent = "";
            this.dataset = {};
            this.style = {};
            this.attributes = new Map();
        }

        setAttribute(name, value) {
            this.attributes.set(name, value);
        }
    }

    const selectors = [
        "#rsvp-dashboard",
        "#rsvp-message",
        "#rsvp-details",
        "#rsvp-count",
        "#rsvp-percentage",
        "#rsvp-progress",
        "#rsvp-progress-fill",
        "#rsvp-capacity-status",
        "#rsvp-updated",
        "#rsvp-stale",
    ];
    let elements = new Map(selectors.map((selector) => [selector, new Element()]));
    elements.get("#rsvp-dashboard").dataset.state = "loading";
    elements.get("#rsvp-progress").attributes.set("role", "progressbar");
    elements.get("#rsvp-progress").attributes.set("aria-valuemin", "0");
    elements.get("#rsvp-progress").attributes.set(
        "aria-label",
        "Lost Signal RSVP progress",
    );
    const originalDocument = globalThis.document;
    const originalWindow = globalThis.window;
    const originalFetch = globalThis.fetch;
    const originalConsoleError = console.error;
    let resolveInitialFetch;
    let intervalCallback;
    const fetchQueue = [
        () =>
            new Promise((resolve) => {
                resolveInitialFetch = resolve;
            }),
    ];

    globalThis.document = {
        querySelector: (selector) => elements.get(selector),
    };
    globalThis.window = {
        LOST_SIGNAL_API_BASE_URL: "https://api.example",
        setTimeout,
        clearTimeout,
        setInterval: (callback, interval) => {
            assert.equal(interval, 5 * 60 * 1000);
            intervalCallback = callback;
            return 1;
        },
    };
    globalThis.fetch = () => fetchQueue.shift()();
    console.error = () => {};

    const jsonResponse = (body, status = 200) =>
        new Response(JSON.stringify(body), {
            status,
            headers: { "content-type": "application/json" },
        });
    const waitForRender = () => new Promise((resolve) => setImmediate(resolve));

    try {
        await import(`../rsvp-dashboard.mjs?dom-test=${Date.now()}`);
        assert.equal(elements.get("#rsvp-dashboard").dataset.state, "loading");

        resolveInitialFetch(
            jsonResponse({
                event: "Lost Signal",
                rsvps: 51,
                capacity: 120,
                updatedAt: "2026-10-26T23:39:00.000Z",
                stale: false,
            }),
        );
        await waitForRender();

        assert.equal(elements.get("#rsvp-dashboard").dataset.state, "success");
        assert.equal(elements.get("#rsvp-count").textContent, "51 / 120 RSVPs");
        assert.equal(elements.get("#rsvp-percentage").textContent, "42.5%");
        assert.equal(elements.get("#rsvp-capacity-status").textContent, "69 spots remaining");
        assert.equal(elements.get("#rsvp-progress-fill").style.width, "42.5%");
        assert.equal(elements.get("#rsvp-progress").attributes.get("role"), "progressbar");
        assert.equal(elements.get("#rsvp-progress").attributes.get("aria-valuemin"), "0");
        assert.equal(elements.get("#rsvp-progress").attributes.get("aria-valuemax"), "120");
        assert.equal(elements.get("#rsvp-progress").attributes.get("aria-valuenow"), "51");
        assert.match(
            elements.get("#rsvp-progress").attributes.get("aria-label"),
            /Lost Signal RSVP progress/,
        );

        fetchQueue.push(() =>
            Promise.resolve(
                jsonResponse({
                    event: "Lost Signal",
                    rsvps: 125,
                    capacity: 120,
                    updatedAt: "2026-10-26T23:44:00.000Z",
                    stale: true,
                }),
            ),
        );
        await intervalCallback();
        assert.equal(elements.get("#rsvp-dashboard").dataset.state, "stale");
        assert.equal(elements.get("#rsvp-count").textContent, "125 / 120 RSVPs");
        assert.equal(elements.get("#rsvp-percentage").textContent, "104.2%");
        assert.equal(elements.get("#rsvp-capacity-status").textContent, "5 RSVPs over capacity");
        assert.equal(elements.get("#rsvp-progress-fill").style.width, "100%");
        assert.equal(elements.get("#rsvp-progress").attributes.get("aria-valuenow"), "120");
        assert.equal(elements.get("#rsvp-stale").hidden, false);
    } finally {
        globalThis.document = originalDocument;
        globalThis.window = originalWindow;
        globalThis.fetch = originalFetch;
        console.error = originalConsoleError;
    }
});

test("renders an unavailable message instead of a fabricated zero count", async () => {
    class Element {
        constructor() {
            this.hidden = false;
            this.textContent = "";
            this.dataset = {};
            this.style = {};
            this.attributes = new Map();
        }

        setAttribute(name, value) {
            this.attributes.set(name, value);
        }
    }

    const selectors = [
        "#rsvp-dashboard",
        "#rsvp-message",
        "#rsvp-details",
        "#rsvp-count",
        "#rsvp-percentage",
        "#rsvp-progress",
        "#rsvp-progress-fill",
        "#rsvp-capacity-status",
        "#rsvp-updated",
        "#rsvp-stale",
    ];
    const elements = new Map(selectors.map((selector) => [selector, new Element()]));
    elements.get("#rsvp-dashboard").dataset.state = "loading";
    const originalDocument = globalThis.document;
    const originalWindow = globalThis.window;
    const originalFetch = globalThis.fetch;
    const originalConsoleError = console.error;

    globalThis.document = {
        querySelector: (selector) => elements.get(selector),
    };
    globalThis.window = {
        LOST_SIGNAL_API_BASE_URL: "https://api.example",
        setTimeout,
        clearTimeout,
        setInterval: () => 1,
    };
    globalThis.fetch = async () => new Response("unavailable", { status: 503 });
    console.error = () => {};

    try {
        await import(`../rsvp-dashboard.mjs?error-test=${Date.now()}`);
        await new Promise((resolve) => setImmediate(resolve));

        assert.equal(elements.get("#rsvp-dashboard").dataset.state, "error");
        assert.match(elements.get("#rsvp-message").textContent, /unavailable/i);
        assert.equal(elements.get("#rsvp-details").hidden, true);
        assert.equal(elements.get("#rsvp-count").textContent, "");
    } finally {
        globalThis.document = originalDocument;
        globalThis.window = originalWindow;
        globalThis.fetch = originalFetch;
        console.error = originalConsoleError;
    }
});
