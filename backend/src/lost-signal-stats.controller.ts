import { Controller, Get } from "@nestjs/common";
import { LostSignalStatsService } from "./lost-signal-stats.service";

@Controller("api/lost-signal")
export class LostSignalStatsController {
    constructor(private readonly statsService: LostSignalStatsService) {}

    @Get("stats")
    getStats() {
        return this.statsService.getStats();
    }
}
