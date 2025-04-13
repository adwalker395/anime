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
    var _a;
    const nineanime = new extensions_1.ANIME.NineAnime(process.env.NINE_ANIME_HELPER_URL, {
        url: process.env.NINE_ANIME_PROXY,
    }, (_a = process.env) === null || _a === void 0 ? void 0 : _a.NINE_ANIME_HELPER_KEY);
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the 9anime provider: check out the provider's website @ https://9anime.id/",
            routes: ['/:query', '/info/:id', '/watch/:episodeId'],
            documentation: 'https://docs.consumet.org/#tag/9anime',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = request.params.query;
        const page = request.query.page;
        const res = yield nineanime.search(query, page);
        reply.status(200).send(res);
    }));
    fastify.get('/info/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.params.id;
        if (typeof id === 'undefined')
            return reply.status(400).send({ message: 'id is required' });
        try {
            const res = yield nineanime.fetchAnimeInfo(id);
            reply.status(200).send(res);
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
        if (server && !Object.values(models_1.StreamingServers).includes(server))
            return reply.status(400).send({ message: 'server is invalid' });
        if (typeof episodeId === 'undefined')
            return reply.status(400).send({ message: 'id is required' });
        try {
            const res = yield nineanime.fetchEpisodeSources(episodeId, server);
            reply.status(200).send(res);
        }
        catch (err) {
            console.error(err);
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
    fastify.get('/servers/:episodeId', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const episodeId = request.params.episodeId;
        try {
            const res = yield nineanime.fetchEpisodeServers(episodeId);
            reply.status(200).send(res);
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
    fastify.get('/helper', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const actions = ['vrf', 'searchVrf', 'decrypt', 'vizcloud'];
        const action = request.query.action;
        const query = request.query.query;
        if (!action)
            return reply.status(400).send({ message: 'action is invalid' });
        if (typeof query === 'undefined')
            return reply.status(400).send({ message: 'query is required' });
        let res = {};
        try {
            switch (action) {
                case 'vrf':
                    res = yield nineanime.ev(query, true);
                    break;
                case 'searchVrf':
                    res = yield nineanime.searchVrf(query, true);
                    break;
                case 'decrypt':
                    res = yield nineanime.decrypt(query, true);
                    break;
                case 'vizcloud':
                    res = yield nineanime.vizcloud(query);
                    break;
                default:
                    res = yield nineanime.customRequest(query, action);
                    break;
            }
            reply.status(200).send(res);
        }
        catch (err) {
            console.error(err);
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
});
exports.default = routes;
