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
    const anify = new extensions_1.ANIME.Anify();
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the Anify provider: check out the provider's website @ https://anify.tv/",
            routes: ['/:query', '/info/:id', '/watch/:episodeId'],
            documentation: 'https://docs.consumet.org/#tag/anify',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = request.params.query;
        const res = yield anify.search(query);
        reply.status(200).send(res);
    }));
    fastify.get('/info', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.query.id;
        if (typeof id === 'undefined')
            return reply.status(400).send({ message: 'id is required' });
        try {
            const res = yield anify
                .fetchAnimeInfo(id)
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
        const episodeNumber = request.query.episodeNumber;
        const animeId = request.query.animeId;
        if (typeof episodeId === 'undefined')
            return reply.status(400).send({ message: 'episodeId is required' });
        if (typeof episodeNumber === 'undefined')
            return reply.status(400).send({ message: 'episodeNumber is required' });
        if (typeof animeId === 'undefined')
            return reply.status(400).send({ message: 'animeId is required' });
        try {
            const res = yield anify
                .fetchEpisodeSources(episodeId, Number(episodeNumber), Number(animeId))
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
