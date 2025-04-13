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
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: 'Welcome to the Crunchyroll provider.',
            routes: ['/:query', '/info/:id:mediaType', '/watch/:episodeId'],
            documentation: 'https://docs.consumet.org/#tag/crunchyroll',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = request.params.query;
        const crunchyroll = yield extensions_1.ANIME.Crunchyroll.create();
        const res = yield crunchyroll.search(query);
        reply.status(200).send(res);
    }));
    fastify.get('/info', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const id = request.query.id;
        const mediaType = request.query.mediaType;
        const allSeasons = (_a = request.query.allSeasons) !== null && _a !== void 0 ? _a : false;
        const crunchyroll = yield extensions_1.ANIME.Crunchyroll.create();
        if (typeof id === 'undefined')
            return reply.status(400).send({ message: 'id is required' });
        if (typeof mediaType === 'undefined')
            return reply.status(400).send({ message: 'mediaType is required' });
        try {
            const res = yield crunchyroll
                .fetchAnimeInfo(id, mediaType, allSeasons)
                .catch((err) => reply.status(404).send({ message: err }));
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
    fastify.get('/watch', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const episodeId = request.query.episodeId;
        if (typeof episodeId === 'undefined')
            return reply.status(400).send({ message: 'episodeId is required' });
        const crunchyroll = yield extensions_1.ANIME.Crunchyroll.create();
        try {
            const res = yield crunchyroll
                .fetchEpisodeSources(episodeId)
                .catch((err) => reply.status(404).send({ message: err }));
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
