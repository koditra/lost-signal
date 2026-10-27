import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const allowedOrigins = (
        process.env.CORS_ORIGINS ??
        "https://koditra.github.io,http://localhost:5500,http://127.0.0.1:5500"
    )
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error("Origin is not allowed by CORS."));
        },
        methods: ["GET", "OPTIONS"],
        allowedHeaders: ["Accept", "Content-Type"],
    });

    await app.listen(Number(process.env.PORT ?? 3000), "0.0.0.0");
}

void bootstrap();
