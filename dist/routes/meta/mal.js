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
    let mal = new extensions_1.META.Myanimelist();
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the mal provider: check out the provider's website @ https://mal.co/",
            routes: ['/:query', '/info/:id', '/watch/:episodeId'],
            documentation: 'https://docs.consumet.org/#tag/mal',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = request.params.query;
        const page = request.query.page;
        const perPage = request.query.perPage;
        const res = yield mal.search(query, page);
        reply.status(200).send(res);
    }));
    // mal info with episodes
    fastify.get('/info/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.params.id;
        const provider = request.query.provider;
        let fetchFiller = request.query.fetchFiller;
        let isDub = request.query.dub;
        const locale = request.query.locale;
        if (typeof provider !== 'undefined') {
            const possibleProvider = extensions_1.PROVIDERS_LIST.ANIME.find((p) => p.name.toLowerCase() === provider.toLocaleLowerCase());
            mal = new extensions_1.META.Myanimelist(possibleProvider);
        }
        if (isDub === 'true' || isDub === '1')
            isDub = true;
        else
            isDub = false;
        if (fetchFiller === 'true' || fetchFiller === '1')
            fetchFiller = true;
        else
            fetchFiller = false;
        try {
            const res = yield mal.fetchAnimeInfo(id, isDub, fetchFiller);
            mal = new extensions_1.META.Myanimelist(undefined);
            reply.status(200).send(res);
        }
        catch (err) {
            reply.status(500).send({ message: err.message });
        }
    }));
    fastify.get('/watch/:episodeId', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const episodeId = request.params.episodeId;
        const provider = request.query.provider;
        if (typeof provider !== 'undefined') {
            const possibleProvider = extensions_1.PROVIDERS_LIST.ANIME.find((p) => p.name.toLowerCase() === provider.toLocaleLowerCase());
            mal = new extensions_1.META.Myanimelist(possibleProvider);
        }
        try {
            const res = yield mal
                .fetchEpisodeSources(episodeId)
                .catch((err) => reply.status(404).send({ message: err }));
            mal = new extensions_1.META.Myanimelist(undefined);
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
