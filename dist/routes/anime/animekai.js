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
const models_1 = require("@consumet/extensions/dist/models");
const routes = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    const animekai = new extensions_1.ANIME.AnimeKai(process.env.ANIMEKAI_URL);
    let baseUrl = 'https://animekai.to';
    if (process.env.ANIMEKAI_URL) {
        baseUrl = `https://${process.env.ANIMEKAI_URL}`;
    }
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: `Welcome to the animekai provider: check out the provider's website @ ${baseUrl}`,
            routes: [
                '/:query',
                '/latest-completed',
                '/new-releases',
                '/recent-added',
                '/recent-episodes',
                '/schedule/:date',
                '/spotlight',
                '/search-suggestions/:query',
                '/info',
                '/watch/:episodeId',
                '/genre/list',
                '/genre/:genre',
                '/movies',
                '/ona',
                '/ova',
                '/specials',
                '/tv',
            ],
            documentation: 'https://docs.consumet.org/#tag/animekai',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = request.params.query;
        const page = request.query.page;
        const res = yield animekai.search(query, page);
        reply.status(200).send(res);
    }));
    fastify.get('/latest-completed', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        try {
            const res = yield animekai.fetchLatestCompleted(page);
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Contact developer for help.',
            });
        }
    }));
    fastify.get('/new-releases', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        try {
            const res = yield animekai.fetchNewReleases(page);
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Contact developer for help.',
            });
        }
    }));
    fastify.get('/recent-added', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        try {
            const res = yield animekai.fetchRecentlyAdded(page);
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Contact developer for help.',
            });
        }
    }));
    fastify.get('/recent-episodes', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        try {
            const res = yield animekai.fetchRecentlyUpdated(page);
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Contact developer for help.',
            });
        }
    }));
    fastify.get('/schedule/:date', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const date = request.params.date;
        try {
            const res = yield animekai.fetchSchedule(date);
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Contact developer for help.',
            });
        }
    }));
    fastify.get('/spotlight', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const res = yield animekai.fetchSpotlight();
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Contact developer for help.',
            });
        }
    }));
    fastify.get('/search-suggestions/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = request.params.query;
        if (typeof query === 'undefined')
            return reply.status(400).send({ message: 'query is required' });
        try {
            const res = yield animekai.fetchSearchSuggestions(query);
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Contact developer for help.',
            });
        }
    }));
    fastify.get('/info', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.query.id;
        if (typeof id === 'undefined')
            return reply.status(400).send({ message: 'id is required' });
        try {
            const res = yield animekai
                .fetchAnimeInfo(id)
                .catch((err) => reply.status(404).send({ message: err }));
            return reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
    fastify.get('/watch/:episodeId', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const episodeId = request.params.episodeId;
        const server = request.query.server;
        let dub = request.query.dub;
        if (dub === 'true' || dub === '1')
            dub = true;
        else
            dub = false;
        if (server && !Object.values(models_1.StreamingServers).includes(server))
            return reply.status(400).send({ message: 'server is invalid' });
        if (typeof episodeId === 'undefined')
            return reply.status(400).send({ message: 'id is required' });
        try {
            const res = yield animekai
                .fetchEpisodeSources(episodeId, server, dub === true ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB)
                .catch((err) => reply.status(404).send({ message: err }));
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
    fastify.get('/servers/:episodeId', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const episodeId = request.params.episodeId;
        let dub = request.query.dub;
        if (dub === 'true' || dub === '1')
            dub = true;
        else
            dub = false;
        if (typeof episodeId === 'undefined')
            return reply.status(400).send({ message: 'id is required' });
        try {
            const res = yield animekai
                .fetchEpisodeServers(episodeId, dub === true ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB)
                .catch((err) => reply.status(404).send({ message: err }));
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
    fastify.get('/genre/list', (_, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const res = yield animekai.fetchGenres();
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Contact developer for help.',
            });
        }
    }));
    fastify.get('/genre/:genre', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const genre = request.params.genre;
        const page = request.query.page;
        if (typeof genre === 'undefined')
            return reply.status(400).send({ message: 'genre is required' });
        try {
            const res = yield animekai.genreSearch(genre, page);
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Contact developer for help.',
            });
        }
    }));
    fastify.get('/movies', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        try {
            const res = yield animekai.fetchMovie(page);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
    fastify.get('/ona', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        try {
            const res = yield animekai.fetchONA(page);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
    fastify.get('/ova', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        try {
            const res = yield animekai.fetchOVA(page);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
    fastify.get('/specials', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        try {
            const res = yield animekai.fetchSpecial(page);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
    fastify.get('/tv', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        try {
            const res = yield animekai.fetchTV(page);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
});
exports.default = routes;
