import { Module } from "@nestjs/common";
import { LostSignalStatsController } from "./lost-signal-stats.controller";
import { LostSignalStatsService } from "./lost-signal-stats.service";

@Module({
    controllers: [LostSignalStatsController],
    providers: [LostSignalStatsService],
})
export class AppModule {}
