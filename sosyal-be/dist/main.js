"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: configService.get('CORS_ORIGIN') || 'http://localhost:5173',
        credentials: true,
    });
    app.use(require('express').json({ limit: '50mb' }));
    app.use(require('express').urlencoded({ limit: '50mb', extended: true }));
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.setGlobalPrefix('api');
    const port = configService.get('PORT') || 3001;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📱 Frontend URL: ${configService.get('CORS_ORIGIN')}`);
    console.log(`📁 Static files served from: /uploads/`);
    console.log(`📏 File upload limit: 50MB`);
}
bootstrap();
//# sourceMappingURL=main.js.map