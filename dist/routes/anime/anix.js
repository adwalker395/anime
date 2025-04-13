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
    const anix = new extensions_1.ANIME.Anix();
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the Anix provider: check out the provider's website @ https://anix.sh",
            routes: ['/:query', '/recent-episodes', '/info/:id', '/watch/:id/:episodeId', '/servers/:id/:episodeId'],
            documentation: 'https://docs.consumet.org/#tag/anix',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = request.params.query;
        const { page = 1 } = request.query;
        const res = yield anix.search(query, page);
        reply.status(200).send(res);
    }));
    fastify.get('/recent-episodes', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const { page = 1 } = request.query;
        const type = request.query.type;
        try {
            let res;
            if (typeof type === 'undefined') {
                res = yield anix.fetchRecentEpisodes(page);
            }
            else {
                res = yield anix.fetchRecentEpisodes(page, type);
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
    fastify.get('/info/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = decodeURIComponent(request.params.id);
        try {
            const res = yield anix
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
    fastify.get('/watch/:id/:episodeId', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { id, episodeId } = request.params;
        const { server } = request.query;
        const type = (_a = request.query.type) !== null && _a !== void 0 ? _a : 'sub';
        if (typeof id === 'undefined')
            return reply.status(400).send({ message: 'id is required' });
        if (typeof episodeId === 'undefined')
            return reply.status(400).send({ message: 'episodeId is required' });
        try {
            const res = yield anix
                .fetchEpisodeSources(id, episodeId, server, type)
                .catch((err) => reply.status(404).send({ message: err }));
            reply.status(200).send(res);
        }
        catch (err) {
            console.error(err);
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
    fastify.get('/servers/:id/:episodeId', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const { id, episodeId } = request.params;
        const type = request.query.type;
        if (typeof id === 'undefined')
            return reply.status(400).send({ message: 'id is required' });
        if (typeof episodeId === 'undefined')
            return reply.status(400).send({ message: 'episodeId is required' });
        try {
            let res;
            if (typeof type === 'undefined') {
                res = yield anix
                    .fetchEpisodeServers(id, episodeId)
                    .catch((err) => reply.status(404).send({ message: err }));
                ;
            }
            else {
                res = yield anix
                    .fetchEpisodeServerType(id, episodeId, type)
                    .catch((err) => reply.status(404).send({ message: err }));
                ;
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
