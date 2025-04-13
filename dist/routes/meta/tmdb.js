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
Object.defineProperty(exports, "__esModule", { value: true });
const extensions_1 = require("@consumet/extensions");
const main_1 = require("../../main");
const routes = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the tmdb provider: check out the provider's website @ https://www.themoviedb.org/",
            routes: ['/:query', '/info/:id', '/watch/:episodeId'],
            documentation: 'https://docs.consumet.org/#tag/tmdb',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = request.params.query;
        const page = request.query.page;
        const tmdb = new extensions_1.META.TMDB(main_1.tmdbApi);
        const res = yield tmdb.search(query, page);
        reply.status(200).send(res);
    }));
    fastify.get('/info/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.params.id;
        const type = request.query.type;
        const provider = request.query.provider;
        let tmdb = new extensions_1.META.TMDB(main_1.tmdbApi);
        if (!type)
            return reply.status(400).send({ message: "The 'type' query is required" });
        if (typeof provider !== 'undefined') {
            const possibleProvider = extensions_1.PROVIDERS_LIST.MOVIES.find((p) => p.name.toLowerCase() === provider.toLocaleLowerCase());
            tmdb = new extensions_1.META.TMDB(main_1.tmdbApi, possibleProvider);
        }
        const res = yield tmdb.fetchMediaInfo(id, type);
        reply.status(200).send(res);
    }));
    fastify.get('/trending', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const validTimePeriods = new Set(['day', 'week']);
        const type = request.query.type || 'all';
        let timePeriod = request.query.timePeriod || 'day';
        // make day as default time period
        if (!validTimePeriods.has(timePeriod))
            timePeriod = 'day';
        const page = request.query.page || 1;
        const tmdb = new extensions_1.META.TMDB(main_1.tmdbApi);
        try {
            const res = yield tmdb.fetchTrending(type, timePeriod, page);
            reply.status(200).send(res);
        }
        catch (err) {
            reply.status(500).send({ message: 'Failed to fetch trending media.' });
        }
    }));
    const watch = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        let episodeId = request.params.episodeId;
        if (!episodeId) {
            episodeId = request.query.episodeId;
        }
        const id = request.query.id;
        const provider = request.query.provider;
        const server = request.query.server;
        let tmdb = new extensions_1.META.TMDB(main_1.tmdbApi);
        if (typeof provider !== 'undefined') {
            const possibleProvider = extensions_1.PROVIDERS_LIST.MOVIES.find((p) => p.name.toLowerCase() === provider.toLocaleLowerCase());
            tmdb = new extensions_1.META.TMDB(main_1.tmdbApi, possibleProvider);
        }
        try {
            const res = yield tmdb
                .fetchEpisodeSources(episodeId, id, server)
                .catch((err) => reply.status(404).send({ message: err }));
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    });
    fastify.get('/watch', watch);
    fastify.get('/watch/:episodeId', watch);
});
exports.default = routes;
