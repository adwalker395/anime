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
    const sflix = new extensions_1.MOVIES.SFlix();
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the sflix provider: check out the provider's website @ https://sflix.to/",
            routes: ['/:query', '/info', '/watch', '/recent-shows', '/recent-movies', '/trending', '/servers', '/country', '/genre'],
            documentation: 'https://docs.consumet.org/#tag/sflix',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = decodeURIComponent(request.params.query);
        const page = request.query.page;
        let res = main_1.redis
            ? yield cache_1.default.fetch(main_1.redis, `sflix:${query}:${page}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield sflix.search(query, page ? page : 1); }), 60 * 60 * 6)
            : yield sflix.search(query, page ? page : 1);
        reply.status(200).send(res);
    }));
    fastify.get('/recent-shows', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        let res = main_1.redis
            ? yield cache_1.default.fetch(main_1.redis, `sflix:recent-shows`, () => __awaiter(void 0, void 0, void 0, function* () { return yield sflix.fetchRecentTvShows(); }), 60 * 60 * 3)
            : yield sflix.fetchRecentTvShows();
        reply.status(200).send(res);
    }));
    fastify.get('/recent-movies', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        let res = main_1.redis
            ? yield cache_1.default.fetch(main_1.redis, `sflix:recent-movies`, () => __awaiter(void 0, void 0, void 0, function* () { return yield sflix.fetchRecentMovies(); }), 60 * 60 * 3)
            : yield sflix.fetchRecentMovies();
        reply.status(200).send(res);
    }));
    fastify.get('/trending', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const type = request.query.type;
        try {
            if (!type) {
                const res = {
                    results: [
                        ...(yield sflix.fetchTrendingMovies()),
                        ...(yield sflix.fetchTrendingTvShows()),
                    ],
                };
                return reply.status(200).send(res);
            }
            let res = main_1.redis
                ? yield cache_1.default.fetch(main_1.redis, `sflix:trending:${type}`, () => __awaiter(void 0, void 0, void 0, function* () {
                    return type === 'tv'
                        ? yield sflix.fetchTrendingTvShows()
                        : yield sflix.fetchTrendingMovies();
                }), 60 * 60 * 3)
                : type === 'tv'
                    ? yield sflix.fetchTrendingTvShows()
                    : yield sflix.fetchTrendingMovies();
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Please try again later. or contact the developers.',
            });
        }
    }));
    fastify.get('/info', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.query.id;
        if (typeof id === 'undefined')
            return reply.status(400).send({
                message: 'id is required',
            });
        try {
            let res = main_1.redis
                ? yield cache_1.default.fetch(main_1.redis, `sflix:info:${id}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield sflix.fetchMediaInfo(id); }), 60 * 60 * 3)
                : yield sflix.fetchMediaInfo(id);
            reply.status(200).send(res);
        }
        catch (err) {
            reply.status(500).send({
                message: 'Something went wrong. Please try again later. or contact the developers.',
            });
        }
    }));
    fastify.get('/watch', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const episodeId = request.query.episodeId;
        const mediaId = request.query.mediaId;
        const server = request.query.server;
        if (typeof episodeId === 'undefined')
            return reply.status(400).send({ message: 'episodeId is required' });
        if (typeof mediaId === 'undefined')
            return reply.status(400).send({ message: 'mediaId is required' });
        if (server && !Object.values(models_1.StreamingServers).includes(server))
            return reply.status(400).send({ message: 'Invalid server query' });
        try {
            let res = main_1.redis
                ? yield cache_1.default.fetch(main_1.redis, `sflix:watch:${episodeId}:${mediaId}:${server}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield sflix.fetchEpisodeSources(episodeId, mediaId, server); }), 60 * 30)
                : yield sflix.fetchEpisodeSources(episodeId, mediaId, server);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
    fastify.get('/servers', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const episodeId = request.query.episodeId;
        const mediaId = request.query.mediaId;
        if (typeof episodeId === 'undefined')
            return reply.status(400).send({ message: 'episodeId is required' });
        if (typeof mediaId === 'undefined')
            return reply.status(400).send({ message: 'mediaId is required' });
        try {
            let res = main_1.redis
                ? yield cache_1.default.fetch(main_1.redis, `sflix:servers:${episodeId}:${mediaId}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield sflix.fetchEpisodeServers(episodeId, mediaId); }), 60 * 30)
                : yield sflix.fetchEpisodeServers(episodeId, mediaId);
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Please try again later. or contact the developers.',
            });
        }
    }));
    fastify.get('/country/:country', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const country = request.params.country;
        const page = (_a = request.query.page) !== null && _a !== void 0 ? _a : 1;
        try {
            let res = main_1.redis
                ? yield cache_1.default.fetch(main_1.redis, `sflix:country:${country}:${page}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield sflix.fetchByCountry(country, page); }), 60 * 60 * 3)
                : yield sflix.fetchByCountry(country, page);
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Please try again later. or contact the developers.',
            });
        }
    }));
    fastify.get('/genre/:genre', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        const genre = request.params.genre;
        const page = (_b = request.query.page) !== null && _b !== void 0 ? _b : 1;
        try {
            let res = main_1.redis
                ? yield cache_1.default.fetch(main_1.redis, `sflix:genre:${genre}:${page}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield sflix.fetchByGenre(genre, page); }), 60 * 60 * 3)
                : yield sflix.fetchByGenre(genre, page);
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Please try again later. or contact the developers.',
            });
        }
    }));
});
exports.default = routes;
