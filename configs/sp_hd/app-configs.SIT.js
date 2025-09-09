export default {
    hostingPort: 5000,
    apiSettings: {
        enabledApi: true,
        apiUrl: "http://sp_hd_game_api_sit:5000",
        authUrl: "http://sp_hd_auth_api_sit:5000",
        client: {
            id: "game-server",
            secret: "gameserver@20luminet&",
        },
        useAuthenticate: true,
        requestTimeout: 10000,
        placeBetTimeout: 2000,

        enabledApiLogs: true,
    },
    socketOptions: {
        pingInterval: 60 * 1000,
        pingTimeout: 60 * 1000,
        transports: ["websocket"],
        allowUpgrades: false,
        perMessageDeflate: false,
        maxRequestsPerInterval: 100, // default 1000
        rateLimitInterval: 10 * 1000, // default 10 * 1000
    },
    enabledLogs: true,
    database: {
        url: "mongodb://hotdog_backend:HotdogBackend%40517@10.99.99.53:39530,10.99.99.54:39530,10.99.99.188:39530,10.99.99.187:39530/?authSource=admin&replicaSet=SP-SIT&appName=marblefootball2",
        options: {
            dbName: "hotdog_minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
    sentry: {
        sentryUrl: "http://52368c4019044019885440599c180bda@10.2.190.51:9009/24",
        logIdentifier: "HD-MarbleFootBall2",
        env: "SIT",
    },
    authenticateSettings: {
        url: "http://sp_hd_auth_api_sit:5000",
        id: "game-services",
        secret: "gameservices@20luminet&",
        requestTimeout: 10000,
        useAuthenticate: true,
        audiences: ["api", "admin-api"],
    },
    userServiceSettings: {
        url: "http://sp_hd_user_service_sit:5000",
    },
    adminSecretKey: "asWDEerfOIdgsdqRTFabvmgh",
    metrics: {
        enable: true,
        secretKey: "6c1f0f28-70f2-46ae-b031-22624a6cd8df",
    },
    enableMsgpackParser: true,
    gameManagementApiSettings: {
        BASE: "http://sp_hd_game_management_service_sit:5000",
    },
    otel: {
        system: "HD",
        enabled: true,
        endpoint: "http://10.2.190.51:4318/v1/traces",
    },

    liveStreamServer: "https://d10r8t0fxmjzn1.cloudfront.net/114/",
    gameResultSettings: {
        baseUrl: "http://sp_hd_game_result_sit:5000",
        id: "Game Client",
        key: "dded3dfe-261e-47f0-a46e-076b367c5a09",
    },
    proxyServer: {
        enabled: true,
        url: "http://lisasqd.nebula.prod:8801",
    },
    cache: {
        ttl: 1000 * 60 * 5,
    },
};
