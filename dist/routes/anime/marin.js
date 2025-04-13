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
    const marin = new extensions_1.ANIME.Marin();
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the animefox provider: check out the provider's website @ https://marin,moe",
            routes: ['/:query', '/info/:id', '/watch/:id/:number'],
            documentation: 'https://docs.consumet.org/#tag/marin',
        });
    });
    fastify.get('/recent-episodes', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        reply.status(200).send(yield marin.recentEpisodes(page));
    }));
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = request.params.query;
        const res = yield marin.search(query);
        reply.status(200).send(res);
    }));
    fastify.get('/info/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.params.id;
        if (typeof id === 'undefined')
            return reply.status(400).send({ message: 'id is required' });
        try {
            const res = yield marin
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
    fastify.get('/watch/:id/:number', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.params.id;
        const number = request.params.number;
        if (typeof id === 'undefined')
            return reply.status(400).send({ message: 'id is required' });
        if (typeof number === 'undefined')
            return reply.status(400).send({ message: 'number is required' });
        try {
            const res = yield marin
                .fetchEpisodeSources(`${id}/${number}`)
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
