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
    var _a;
    const fmovies = new extensions_1.MOVIES.Fmovies(process.env.NINE_ANIME_HELPER_URL, {
        url: process.env.NINE_ANIME_PROXY,
    }, (_a = process.env) === null || _a === void 0 ? void 0 : _a.NINE_ANIME_HELPER_KEY);
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the fmovies provider: check out the provider's website @ https://fmovies.to/",
            routes: ['/:query', '/info', '/watch'],
            documentation: 'https://docs.consumet.org/#tag/fmovies',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = decodeURIComponent(request.params.query);
        const page = request.query.page;
        let res = main_1.redis
            ? yield cache_1.default.fetch(main_1.redis, `fmovies:${query}:${page}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield fmovies.search(query, page ? page : 1); }), 60 * 60 * 6)
            : yield fmovies.search(query, page ? page : 1);
        reply.status(200).send(res);
    }));
    fastify.get('/info', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.query.id;
        if (typeof id === 'undefined')
            return reply.status(400).send({
                message: 'id is required',
            });
        try {
            let res = main_1.redis
                ? yield cache_1.default.fetch(main_1.redis, `fmovies:info:${id}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield fmovies.fetchMediaInfo(id); }), 60 * 60 * 3)
                : yield fmovies.fetchMediaInfo(id);
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
                ? yield cache_1.default.fetch(main_1.redis, `fmovies:watch:${episodeId}:${mediaId}:${server}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield fmovies.fetchEpisodeSources(episodeId, mediaId, server); }), 60 * 30)
                : yield fmovies.fetchEpisodeSources(episodeId, mediaId, server);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
});
exports.default = routes;
