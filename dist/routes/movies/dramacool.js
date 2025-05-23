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
    const dramacool = new extensions_1.MOVIES.DramaCool();
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the dramacool provider: check out the provider's website @ https://dramacool.com.pa/",
            routes: ['/:query', '/info', '/watch', '/popular', '/recent-movies', '/recent-shows'],
            documentation: 'https://docs.consumet.org/#tag/dramacool',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const query = decodeURIComponent(request.params.query);
            const page = request.query.page;
            const res = yield dramacool.search(query, page);
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
            const res = yield dramacool
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
        // const mediaId = (request.query as { mediaId: string }).mediaId;
        const server = request.query.server;
        if (typeof episodeId === 'undefined')
            return reply.status(400).send({ message: 'episodeId is required' });
        try {
            const res = yield dramacool
                .fetchEpisodeSources(episodeId, server)
                .catch((err) => reply.status(404).send({ message: 'Media Not found.' }));
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
    fastify.get("/popular", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        try {
            const res = yield dramacool.fetchPopular(page ? page : 1);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
    fastify.get("/recent-movies", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        try {
            const res = yield dramacool.fetchRecentMovies(page ? page : 1);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
    fastify.get("/recent-shows", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        try {
            const res = yield dramacool.fetchRecentTvShows(page ? page : 1);
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
