const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10 * 1000;

export function validateStats(stats) {
    if (
        !stats ||
        typeof stats.event !== "string" ||
        stats.event.trim() !== "Lost Signal" ||
        !Number.isSafeInteger(stats.rsvps) ||
        stats.rsvps < 0 ||
        !Number.isSafeInteger(stats.capacity) ||
        stats.capacity <= 0 ||
        typeof stats.updatedAt !== "string" ||
        Number.isNaN(Date.parse(stats.updatedAt)) ||
        typeof stats.stale !== "boolean"
    ) {
        throw new Error("The RSVP API returned invalid statistics.");
    }

    return stats;
}

export function deriveProgress(rsvps, capacity) {
    if (
        !Number.isSafeInteger(rsvps) ||
        rsvps < 0 ||
        !Number.isSafeInteger(capacity) ||
        capacity <= 0
    ) {
        throw new Error("RSVP count and capacity must be valid non-negative integers.");
    }

    const percentage = (rsvps / capacity) * 100;
    const fillPercentage = Math.min(100, Math.max(0, percentage));
    const difference = capacity - rsvps;
    let status;

    if (difference > 0) {
        status = `${difference} spots remaining`;
    } else if (difference === 0) {
        status = "Capacity reached";
    } else {
        const overCapacity = Math.abs(difference);
        status = `${overCapacity} ${overCapacity === 1 ? "RSVP" : "RSVPs"} over capacity`;
    }

    return {
        percentage,
        fillPercentage,
        accessibleValue: Math.min(capacity, Math.max(0, rsvps)),
        status,
    };
}

export function dashboardState({ hasData, loading = false, stale = false }) {
    if (hasData) {
        return stale ? "stale" : "success";
    }
    return loading ? "loading" : "error";
}

if (typeof document !== "undefined") {
    const dashboard = document.querySelector("#rsvp-dashboard");
    const message = document.querySelector("#rsvp-message");
    const details = document.querySelector("#rsvp-details");
    const count = document.querySelector("#rsvp-count");
    const percentage = document.querySelector("#rsvp-percentage");
    const progress = document.querySelector("#rsvp-progress");
    const progressFill = document.querySelector("#rsvp-progress-fill");
    const capacityStatus = document.querySelector("#rsvp-capacity-status");
    const updated = document.querySelector("#rsvp-updated");
    const staleMessage = document.querySelector("#rsvp-stale");

    let latestStats = null;
    let requestInFlight = false;

    function formatPercentage(value) {
        return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
    }

    function renderStats(stats, stale = stats.stale) {
        const values = deriveProgress(stats.rsvps, stats.capacity);
        const date = new Date(stats.updatedAt);

        count.textContent = `${stats.rsvps} / ${stats.capacity} RSVPs`;
        percentage.textContent = formatPercentage(values.percentage);
        capacityStatus.textContent = values.status;
        updated.textContent = `Last updated ${new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date)}`;
        progress.setAttribute("aria-valuemax", String(stats.capacity));
        progress.setAttribute("aria-valuenow", String(values.accessibleValue));
        progress.setAttribute(
            "aria-valuetext",
            `${stats.rsvps} of ${stats.capacity} RSVPs, ${formatPercentage(values.percentage)} complete, ${values.status}`,
        );
        progressFill.style.width = `${values.fillPercentage}%`;
        details.hidden = false;
        message.hidden = true;
        staleMessage.hidden = !stale;
        dashboard.dataset.state = dashboardState({ hasData: true, stale });
    }

    function showError(error) {
        if (latestStats) {
            renderStats(latestStats, true);
            console.error("Could not refresh Lost Signal RSVP statistics.", error);
            return;
        }

        details.hidden = true;
        message.hidden = false;
        message.textContent =
            "RSVP statistics are currently unavailable. Please try again later.";
        dashboard.dataset.state = dashboardState({ hasData: false });
        console.error("Could not load Lost Signal RSVP statistics.", error);
    }

    async function refreshStats() {
        if (requestInFlight) {
            return;
        }
        requestInFlight = true;

        const baseUrl = window.LOST_SIGNAL_API_BASE_URL?.trim().replace(/\/+$/, "");
        if (!baseUrl) {
            requestInFlight = false;
            showError(new Error("LOST_SIGNAL_API_BASE_URL is not configured."));
            return;
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(`${baseUrl}/api/lost-signal/stats`, {
                headers: { Accept: "application/json" },
                cache: "no-store",
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`RSVP API responded with HTTP ${response.status}.`);
            }

            const stats = validateStats(await response.json());
            latestStats = stats;
            renderStats(stats);
        } catch (error) {
            showError(error);
        } finally {
            window.clearTimeout(timeout);
            requestInFlight = false;
        }
    }

    refreshStats();
    window.setInterval(refreshStats, REFRESH_INTERVAL_MS);
}
