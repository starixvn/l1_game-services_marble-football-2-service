export default {
    hostingPort: 5000,
    apiSettings: {
        enabledApi: true,
        apiUrl: "http://sp-hd-game-api-klprod-service:5000",
        authUrl: "http://sp-hd-auth-api-klprod-service:5000",
        client: {
            id: "game-server",
            secret: "gameserver@20luminet&",
        },
        useAuthenticate: true,
        requestTimeout: 10000,
        placeBetTimeout: 2000,
        enabledApiLogs: true,
    },
    authenticateSettings: {
        url: "http://sp-hd-auth-api-klprod-service:5000",
        id: "game-services",
        secret: "gameservices@20luminet&",
        requestTimeout: 10000,
        useAuthenticate: true,
        audiences: ["api", "admin-api"],
    },
    userServiceSettings: {
        url: "http://sp-hd-user-service-klprod-service:5000",
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
        url: "mongodb://hotdog_backend:%3FD%60XWko0ZI99Y2PQ%5Eu%2E9LV%2BYv%2Emj6rhH@10.146.34.26:39510,10.146.34.27:39510,10.146.34.30:39510,10.146.34.28:39510/?replicaSet=SP-Main&appName=MarbleFootBall2",
        options: {
            dbName: "hotdog_minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
    sentry: {
        sentryUrl: "http://d039f2abe16b4252a70cdf60fff232b6@10.2.190.51:9009/282",
        logIdentifier: "HD-MarbleFootBall2",
        env: "PROD",
    },
    adminSecretKey: "asWDEerfOIdgsdqRTFabvmgh",
    metrics: {
        enable: true,
        secretKey: "6c1f0f28-70f2-46ae-b031-22624a6cd8df",
    },
    enableMsgpackParser: true,
    gameManagementApiSettings: {
        BASE: "http://sp-hd-game-management-service-klprod-service:5000",
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
        url: "http://iiiusqd.gamora.prod:8801",
    },
    cache: {
        ttl: 1000 * 60 * 5,
    },
};
