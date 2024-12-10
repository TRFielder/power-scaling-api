import { NestFactory } from "@nestjs/core"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app.module"

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const config = new DocumentBuilder()
        .setTitle("Power Scaling App API")
        .setDescription(
            "An experiment with NestJS for power scaling fictional characters"
        )
        .setVersion("0.0.1")
        .addTag("characters")
        .build()

    const documentFactory = () => SwaggerModule.createDocument(app, config)
    SwaggerModule.setup("api", app, documentFactory)

    await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
