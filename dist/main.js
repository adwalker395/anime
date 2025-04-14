"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tmdbApi = exports.redis = void 0;
require('dotenv').config();
const ioredis_1 = __importDefault(require("ioredis"));
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const fs_1 = __importDefault(require("fs"));
const books_1 = __importDefault(require("./routes/books"));
const anime_1 = __importDefault(require("./routes/anime"));
const manga_1 = __importDefault(require("./routes/manga"));
const light_novels_1 = __importDefault(require("./routes/light-novels"));
const movies_1 = __importDefault(require("./routes/movies"));
const meta_1 = __importDefault(require("./routes/meta"));
const news_1 = __importDefault(require("./routes/news"));
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = __importDefault(require("./utils"));
const PORT = parseInt(process.env.PORT || '3000', 10);
console.log('Environment Variables:', {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    REDIS_HOST: process.env.REDIS_HOST ? 'set' : 'not set'
});
exports.redis = process.env.REDIS_HOST &&
    new ioredis_1.default({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
    });
if (exports.redis) {
    exports.redis.on('error', (err) => {
        console.error('Redis connection error:', err);
    });
}
console.log(process.env.REDIS_HOST, process.env.REDIS_PORT, process.env.REDIS_PASSWORD);
const fastify = (0, fastify_1.default)({
    maxParamLength: 1000,
    logger: true,
});
exports.tmdbApi = process.env.TMDB_KEY && process.env.TMDB_KEY;
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield fastify.register(cors_1.default, {
        origin: '*',
        methods: 'GET',
    });
    if (process.env.NODE_ENV === 'DEMO') {
        console.log(chalk_1.default.yellowBright('DEMO MODE ENABLED'));
        const map = new Map();
        // session duration in milliseconds (5 hours)
        const sessionDuration = 1000 * 60 * 60 * 5;
        fastify.addHook('onRequest', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
            const ip = request.ip;
            const session = map.get(ip);
            // check if the requester ip has a session (temporary access)
            if (session) {
                // if session is found, check if the session is expired
                const { expiresIn } = session;
                const currentTime = new Date();
                const sessionTime = new Date(expiresIn);
                // check if the session has been expired
                if (currentTime.getTime() > sessionTime.getTime()) {
                    console.log('session expired');
                    // if expired, delete the session and continue
                    map.delete(ip);
                    // redirect to the demo request page
                    return reply.redirect('/apidemo');
                }
                console.log('session found. expires in', expiresIn);
                if (request.url === '/apidemo')
                    return reply.redirect('/');
                return;
            }
            // if route is not /apidemo, redirect to the demo request page
            if (request.url === '/apidemo')
                return;
            console.log('session not found');
            reply.redirect('/apidemo');
        }));
        fastify.post('/apidemo', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
            const { ip } = request;
            // check if the requester ip has a session (temporary access)
            const session = map.get(ip);
            if (session)
                return reply.redirect('/');
            // if no session, create a new session
            const expiresIn = new Date(Date.now() + sessionDuration);
            map.set(ip, { expiresIn });
            // redirect to the demo request page
            reply.redirect('/');
        }));
        fastify.get('/apidemo', (_, reply) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const stream = fs_1.default.readFileSync(__dirname + '/../demo/apidemo.html');
                return reply.type('text/html').send(stream);
            }
            catch (err) {
                console.error(err);
                return reply.status(500).send({
                    message: 'Could not load the demo page. Please try again later.',
                });
            }
        }));
        // set interval to delete expired sessions every 1 hour
        setInterval(() => {
            const currentTime = new Date();
            for (const [ip, session] of map.entries()) {
                const { expiresIn } = session;
                const sessionTime = new Date(expiresIn);
                // check if the session is expired
                if (currentTime.getTime() > sessionTime.getTime()) {
                    console.log('session expired for', ip);
                    // if expired, delete the session and continue
                    map.delete(ip);
                }
            }
        }, 1000 * 60 * 60);
    }
    console.log(chalk_1.default.green(`Starting server on port ${PORT}... 🚀`));
    if (!process.env.REDIS_HOST)
        console.warn(chalk_1.default.yellowBright('Redis not found. Cache disabled.'));
    if (!process.env.TMDB_KEY)
        console.warn(chalk_1.default.yellowBright('TMDB api key not found. the TMDB meta route may not work.'));
    yield fastify.register(books_1.default, { prefix: '/books' });
    yield fastify.register(anime_1.default, { prefix: '/anime' });
    yield fastify.register(manga_1.default, { prefix: '/manga' });
    //await fastify.register(comics, { prefix: '/comics' });
    yield fastify.register(light_novels_1.default, { prefix: '/light-novels' });
    yield fastify.register(movies_1.default, { prefix: '/movies' });
    yield fastify.register(meta_1.default, { prefix: '/meta' });
    yield fastify.register(news_1.default, { prefix: '/news' });
    yield fastify.register(utils_1.default, { prefix: '/utils' });
    try {
        fastify.get('/', (_, rp) => {
            rp.status(200).send(`Welcome to consumet api! 🎉 \n${process.env.NODE_ENV === 'DEMO'
                ? 'This is a demo of the api. You should only use this for testing purposes.'
                : ''}`);
        });
        fastify.get('*', (request, reply) => {
            reply.status(404).send({
                message: '',
                error: 'page not found',
            });
        });
        fastify.get('/health', (_, reply) => {
            return reply.send({ status: 'OK' });
        });
        // fastify.listen({ port: PORT, host: '0.0.0.0' }, (e, address) => {
        //   if (e) throw e;
        //   console.log(`server listening on ${address}`);
        // });
        console.log('🚀 Starting server...');
        yield fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`✅ Server listening on http://0.0.0.0:${PORT}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}))();
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fastify.ready();
        fastify.server.emit('request', req, res);
    });
}
exports.default = handler;
