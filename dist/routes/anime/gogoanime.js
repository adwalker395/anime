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
const extensions_1 = require("@consumet/extensions");
const models_1 = require("@consumet/extensions/dist/models");
const cache_1 = __importDefault(require("../../utils/cache"));
const main_1 = require("../../main");
const routes = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    const gogoanime = new extensions_1.ANIME.Gogoanime(process.env.GOGOANIME_URL);
    const redisCacheTime = 60 * 60;
    const redisPrefix = 'gogoanime:';
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the gogoanime provider: check out the provider's website @ https://www1.gogoanime.bid/",
            routes: [
                '/:query',
                '/info/:id',
                '/watch/:episodeId',
                '/servers/:episodeId',
                '/genre/:genre',
                '/genre/list',
                '/top-airing',
                '/movies',
                '/popular',
                '/recent-episodes',
                '/anime-list',
                '/download',
            ],
            documentation: 'https://docs.consumet.org/#tag/gogoanime',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = request.params.query;
        const page = request.query.page || 1;
        const res = main_1.redis ? yield cache_1.default.fetch(main_1.redis, `${redisPrefix}search;${page};${query}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield gogoanime.search(query, page); }), redisCacheTime) : yield gogoanime.search(query, page);
        reply.status(200).send(res);
    }));
    fastify.get('/info/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = decodeURIComponent(request.params.id);
        try {
            const res = main_1.redis
                ? yield cache_1.default.fetch(main_1.redis, `${redisPrefix}info;${id}`, () => __awaiter(void 0, void 0, void 0, function* () {
                    const info = yield gogoanime.fetchAnimeInfo(id);
                    return info;
                }), redisCacheTime)
                : yield gogoanime.fetchAnimeInfo(id);
            return reply.status(200).send(res);
        }
        catch (err) {
            console.error('Error in /info/:id:', (err === null || err === void 0 ? void 0 : err.message) || err);
            return reply.status(500).send({
                error: true,
                message: (err === null || err === void 0 ? void 0 : err.message) || 'Something went wrong. Please try again later.',
            });
        }
    }));
    fastify.get('/genre/:genre', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const genre = request.params.genre;
        const page = (_a = request.query.page) !== null && _a !== void 0 ? _a : 1;
        try {
            const res = main_1.redis ? yield cache_1.default.fetch(main_1.redis, `${redisPrefix}genre;${page};${genre}`, () => __awaiter(void 0, void 0, void 0, function* () {
                return yield gogoanime
                    .fetchGenreInfo(genre, page)
                    .catch((err) => reply.status(404).send({ message: err }));
            }), redisCacheTime) : yield gogoanime
                .fetchGenreInfo(genre, page)
                .catch((err) => reply.status(404).send({ message: err }));
            reply.status(200).send(res);
        }
        catch (_b) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
    fastify.get('/genre/list', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const res = main_1.redis ? yield cache_1.default.fetch(main_1.redis, `${redisPrefix}genre-list`, () => __awaiter(void 0, void 0, void 0, function* () {
                return yield gogoanime
                    .fetchGenreList()
                    .catch((err) => reply.status(404).send({ message: err }));
            }), redisCacheTime * 24) : yield gogoanime
                .fetchGenreList()
                .catch((err) => reply.status(404).send({ message: err }));
            reply.status(200).send(res);
        }
        catch (_c) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
    fastify.get('/watch/:episodeId', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const episodeId = request.params.episodeId;
        const server = request.query.server;
        if (server && !Object.values(models_1.StreamingServers).includes(server)) {
            reply.status(400).send('Invalid server');
        }
        try {
            const res = main_1.redis ? yield cache_1.default.fetch(main_1.redis, `${redisPrefix}watch;${server};${episodeId}`, () => __awaiter(void 0, void 0, void 0, function* () {
                return yield gogoanime
                    .fetchEpisodeSources(episodeId, server)
                    .catch((err) => reply.status(404).send({ message: err }));
            }), redisCacheTime) : yield gogoanime
                .fetchEpisodeSources(episodeId, server)
                .catch((err) => reply.status(404).send({ message: err }));
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
    fastify.get('/servers/:episodeId', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const episodeId = request.params.episodeId;
        try {
            const res = main_1.redis ? yield cache_1.default.fetch(main_1.redis, `${redisPrefix}servers;${episodeId}`, () => __awaiter(void 0, void 0, void 0, function* () {
                return yield gogoanime
                    .fetchEpisodeServers(episodeId)
                    .catch((err) => reply.status(404).send({ message: err }));
            }), redisCacheTime) : yield gogoanime
                .fetchEpisodeServers(episodeId)
                .catch((err) => reply.status(404).send({ message: err }));
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
    fastify.get('/top-airing', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        try {
            const page = (_d = request.query.page) !== null && _d !== void 0 ? _d : 1;
            const res = main_1.redis ? yield cache_1.default.fetch(main_1.redis, `${redisPrefix}top-airing;${page}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield gogoanime.fetchTopAiring(page); }), redisCacheTime) : yield gogoanime.fetchTopAiring(page);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developers for help.' });
        }
    }));
    fastify.get('/movies', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        var _e;
        try {
            const page = (_e = request.query.page) !== null && _e !== void 0 ? _e : 1;
            const res = main_1.redis ? yield cache_1.default.fetch(main_1.redis, `${redisPrefix}movies;${page}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield gogoanime.fetchRecentMovies(page); }), redisCacheTime) : yield gogoanime.fetchRecentMovies(page);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developers for help.' });
        }
    }));
    fastify.get('/popular', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        var _f;
        try {
            const page = (_f = request.query.page) !== null && _f !== void 0 ? _f : 1;
            const res = main_1.redis ? yield cache_1.default.fetch(main_1.redis, `${redisPrefix}popular;${page}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield gogoanime.fetchPopular(page); }), redisCacheTime) : yield gogoanime.fetchPopular(page);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developers for help.' });
        }
    }));
    fastify.get('/recent-episodes', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        var _g, _h;
        try {
            const type = (_g = request.query.type) !== null && _g !== void 0 ? _g : 1;
            const page = (_h = request.query.page) !== null && _h !== void 0 ? _h : 1;
            const res = main_1.redis ? yield cache_1.default.fetch(main_1.redis, `${redisPrefix}recent-episodes;${page};${type}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield gogoanime.fetchRecentEpisodes(page, type); }), redisCacheTime) : yield gogoanime.fetchRecentEpisodes(page, type);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developers for help.' });
        }
    }));
    fastify.get('/anime-list', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        var _j;
        try {
            const page = (_j = request.query.page) !== null && _j !== void 0 ? _j : 1;
            const res = main_1.redis ? yield cache_1.default.fetch(main_1.redis, `gogoanime:anime-list;${page}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield gogoanime.fetchAnimeList(page); }), redisCacheTime) : yield gogoanime.fetchAnimeList(page);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developers for help.' });
        }
    }));
    fastify.get('/download', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        var _k;
        try {
            const downloadLink = request.query.link;
            if (!downloadLink) {
                reply.status(400).send('Invalid link');
            }
            const res = main_1.redis ? yield cache_1.default.fetch(main_1.redis, `${redisPrefix}download-${downloadLink}`, () => __awaiter(void 0, void 0, void 0, function* () {
                return yield gogoanime
                    .fetchDirectDownloadLink(downloadLink)
                    .catch((err) => reply.status(404).send({ message: err }));
            }), redisCacheTime * 24) : yield gogoanime
                .fetchDirectDownloadLink(downloadLink, (_k = process.env.RECAPTCHATOKEN) !== null && _k !== void 0 ? _k : '')
                .catch((err) => reply.status(404).send({ message: err }));
            reply.status(200).send(res);
        }
        catch (_l) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
});
exports.default = routes;
