import { NestFactory } from "@nestjs/core"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: { origin: process.env.ALLOWED_ORIGIN },
    })
    const config = new DocumentBuilder()
        .setTitle("Power Scaling App API")
        .setDescription(
            "An experiment with NestJS for power scaling fictional characters"
        )
        .setVersion("0.0.2")
        .addTag("Characters")
        .build()

    const documentFactory = () => SwaggerModule.createDocument(app, config)
    SwaggerModule.setup("api", app, documentFactory)

    await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
