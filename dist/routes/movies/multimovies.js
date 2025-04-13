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
const routes = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    const multimovies = new extensions_1.MOVIES.MultiMovies(process.env.MULTIMOVIES_URL);
    let baseUrl = 'https://multimovies.life';
    if (process.env.MULTIMOVIES_URL) {
        baseUrl = `https://${process.env.MULTIMOVIES_URL}`;
    }
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: `Welcome to the multimovies provider: check out the provider's website @ ${baseUrl}`,
            routes: ['/:query', '/info', '/watch', '/servers', '/popular', '/genre/:genre'],
            documentation: 'https://docs.consumet.org/#tag/multimovies',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const query = decodeURIComponent(request.params.query);
            const page = request.query.page;
            const res = yield multimovies.search(query, page);
            reply.status(200).send(res);
        }
        catch (err) {
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
            const res = yield multimovies
                .fetchMediaInfo(id)
                .catch((err) => reply.status(404).send({ message: err }));
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
        try {
            const res = yield multimovies
                .fetchEpisodeSources(episodeId, mediaId, server)
                .catch((err) => reply.status(404).send({ message: 'Media Not found.' }));
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
        if (typeof episodeId === 'undefined')
            return reply.status(400).send({ message: 'episodeId is required' });
        try {
            const res = yield multimovies.fetchEpisodeServers(episodeId);
            reply.status(200).send(res);
        }
        catch (error) {
            reply.status(500).send({
                message: 'Something went wrong. Please try again later. or contact the developers.',
            });
        }
    }));
    fastify.get('/popular', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        try {
            const res = yield multimovies.fetchPopular(page ? page : 1);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
    fastify.get('/genre/:genre', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const genre = request.params.genre;
        const page = (_a = request.query.page) !== null && _a !== void 0 ? _a : 1;
        try {
            const res = yield multimovies.fetchByGenre(genre, page);
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
