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
    const flixhq = new extensions_1.MOVIES.FlixHQ();
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the flixhq provider: check out the provider's website @ https://flixhq.to/",
            routes: ['/:query', '/info', '/watch', '/recent-shows', '/recent-movies', '/trending', '/servers', '/country', '/genre'],
            documentation: 'https://docs.consumet.org/#tag/flixhq',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = decodeURIComponent(request.params.query);
        const page = request.query.page;
        let res = main_1.redis
            ? yield cache_1.default.fetch(main_1.redis, `flixhq:${query}:${page}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield flixhq.search(query, page ? page : 1); }), 60 * 60 * 6)
            : yield flixhq.search(query, page ? page : 1);
        reply.status(200).send(res);
    }));
    fastify.get('/recent-shows', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        let res = main_1.redis
            ? yield cache_1.default.fetch(main_1.redis, `flixhq:recent-shows`, () => __awaiter(void 0, void 0, void 0, function* () { return yield flixhq.fetchRecentTvShows(); }), 60 * 60 * 3)
            : yield flixhq.fetchRecentTvShows();
        reply.status(200).send(res);
    }));
    fastify.get('/recent-movies', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        let res = main_1.redis
            ? yield cache_1.default.fetch(main_1.redis, `flixhq:recent-movies`, () => __awaiter(void 0, void 0, void 0, function* () { return yield flixhq.fetchRecentMovies(); }), 60 * 60 * 3)
            : yield flixhq.fetchRecentMovies();
        reply.status(200).send(res);
    }));
    fastify.get('/trending', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const type = request.query.type;
        try {
            if (!type) {
                const res = {
                    results: [
                        ...(yield flixhq.fetchTrendingMovies()),
                        ...(yield flixhq.fetchTrendingTvShows()),
                    ],
                };
                return reply.status(200).send(res);
            }
            let res = main_1.redis
                ? yield cache_1.default.fetch(main_1.redis, `flixhq:trending:${type}`, () => __awaiter(void 0, void 0, void 0, function* () {
                    return type === 'tv'
                        ? yield flixhq.fetchTrendingTvShows()
                        : yield flixhq.fetchTrendingMovies();
                }), 60 * 60 * 3)
                : type === 'tv'
                    ? yield flixhq.fetchTrendingTvShows()
                    : yield flixhq.fetchTrendingMovies();
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
                ? yield cache_1.default.fetch(main_1.redis, `flixhq:info:${id}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield flixhq.fetchMediaInfo(id); }), 60 * 60 * 3)
                : yield flixhq.fetchMediaInfo(id);
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
                ? yield cache_1.default.fetch(main_1.redis, `flixhq:watch:${episodeId}:${mediaId}:${server}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield flixhq.fetchEpisodeSources(episodeId, mediaId, server); }), 60 * 30)
                : yield flixhq.fetchEpisodeSources(episodeId, mediaId, server);
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
                ? yield cache_1.default.fetch(main_1.redis, `flixhq:servers:${episodeId}:${mediaId}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield flixhq.fetchEpisodeServers(episodeId, mediaId); }), 60 * 30)
                : yield flixhq.fetchEpisodeServers(episodeId, mediaId);
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
                ? yield cache_1.default.fetch(main_1.redis, `flixhq:country:${country}:${page}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield flixhq.fetchByCountry(country, page); }), 60 * 60 * 3)
                : yield flixhq.fetchByCountry(country, page);
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
                ? yield cache_1.default.fetch(main_1.redis, `flixhq:genre:${genre}:${page}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield flixhq.fetchByGenre(genre, page); }), 60 * 60 * 3)
                : yield flixhq.fetchByGenre(genre, page);
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
