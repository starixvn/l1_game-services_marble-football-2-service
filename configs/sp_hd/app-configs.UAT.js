export default {
    hostingPort: 5000,
    apiSettings: {
        enabledApi: true,
        apiUrl: "http://sp-hd-game-api-uat-service:5000",
        authUrl: "http://sp-hd-auth-api-uat-service:5000",
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
        url: "mongodb://hotdog_backend:HotdogBackend%4022027@10.146.34.28:39520?authSource=admin&replicaSet=SP-UAT&appName=marblefootball2",
        options: {
            dbName: "hotdog_minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "http://f4980024f65945179a125e7ce17286d0@sentrysc-ovs.ops-kluat.gamora.prod/178",
        logIdentifier: "HD-MarbleFootBall2",
        env: "UAT",
    },
    authenticateSettings: {
        url: "http://sp-hd-auth-api-uat-service:5000",
        id: "game-services",
        secret: "gameservices@20luminet&",
        requestTimeout: 10000,
        useAuthenticate: true,
        audiences: ["api", "admin-api"],
    },
    userServiceSettings: {
        url: "http://sp-hd-user-service-uat-service:5000",
    },
    adminSecretKey: "asWDEerfOIdgsdqRTFabvmgh",
    metrics: {
        enable: true,
        secretKey: "6c1f0f28-70f2-46ae-b031-22624a6cd8df",
    },
    enableMsgpackParser: true,
    gameManagementApiSettings: {
        BASE: "http://sp-hd-game-management-service-uat-service:5000",
    },
    otel: {
        system: "HD",
        enabled: true,
        endpoint: "http://10.2.190.51:4318/v1/traces",
    },

    liveStreamServer: "https://d10r8t0fxmjzn1.cloudfront.net/114/",
    gameResultSettings: {
        baseUrl: "http://sp-hd-game-result-uat-service:5000",
        id: "Game Client",
        key: "906db6ee-b64b-4173-8c82-410f8509764d",
    },
    proxyServer: {
        enabled: true,
        url: "http://lisasqd.nebula.prod:8801",
    },
    cache: {
        ttl: 1000 * 60 * 5,
    },
};
