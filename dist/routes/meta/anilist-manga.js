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
const extensions_2 = require("@consumet/extensions");
const routes = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Allocate new provider per request rather
    // than global
    let anilist = new extensions_1.META.Anilist.Manga();
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: `Welcome to the anilist manga provider: check out the provider's website @ ${anilist.provider.toString.baseUrl}`,
            routes: ['/:query', '/info', '/read'],
            documentation: 'https://docs.consumet.org/#tag/anilist',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = request.params.query;
        const res = yield anilist.search(query);
        reply.status(200).send(res);
    }));
    fastify.get('/info/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.params.id;
        const provider = request.query.provider;
        if (typeof provider !== 'undefined') {
            const possibleProvider = extensions_2.PROVIDERS_LIST.MANGA.find((p) => p.name.toLowerCase() === provider.toLocaleLowerCase());
            anilist = new extensions_1.META.Anilist.Manga(possibleProvider);
        }
        if (typeof id === 'undefined')
            return reply.status(400).send({ message: 'id is required' });
        try {
            const res = yield anilist
                .fetchMangaInfo(id)
                .catch((err) => reply.status(404).send({ message: err }));
            reply.status(200).send(res);
            anilist = new extensions_1.META.Anilist.Manga();
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
    fastify.get('/read', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const chapterId = request.query.chapterId;
        const provider = request.query.provider;
        if (typeof provider !== 'undefined') {
            const possibleProvider = extensions_2.PROVIDERS_LIST.MANGA.find((p) => p.name.toLowerCase() === provider.toLocaleLowerCase());
            anilist = new extensions_1.META.Anilist.Manga(possibleProvider);
        }
        if (typeof chapterId === 'undefined')
            return reply.status(400).send({ message: 'chapterId is required' });
        try {
            const res = yield anilist
                .fetchChapterPages(chapterId)
                .catch((err) => reply.status(404).send({ message: err.message }));
            anilist = new extensions_1.META.Anilist.Manga();
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
