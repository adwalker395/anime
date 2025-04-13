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
    const animepahe = new extensions_1.ANIME.AnimePahe();
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the animepahe provider: check out the provider's website @ https://animepahe.com/",
            routes: ['/:query', '/info/:id', '/watch/:episodeId'],
            documentation: 'https://docs.consumet.org/#tag/animepahe',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = request.params.query;
        const res = yield animepahe.search(query);
        reply.status(200).send(res);
    }));
    fastify.get('/info/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = decodeURIComponent(request.params.id);
        const episodePage = request.query.episodePage;
        try {
            const res = yield animepahe
                .fetchAnimeInfo(id, episodePage)
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
        try {
            const res = yield animepahe.fetchEpisodeSources(episodeId);
            reply.status(200).send(res);
        }
        catch (err) {
            console.log(err);
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
});
exports.default = routes;
