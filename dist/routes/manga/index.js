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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const extensions_1 = require("@consumet/extensions");
const mangapill_1 = __importDefault(require("./mangapill"));
const managreader_1 = __importDefault(require("./managreader"));
const mangadex_1 = __importDefault(require("./mangadex"));
const mangahere_1 = __importDefault(require("./mangahere"));
const mangakakalot_1 = __importDefault(require("./mangakakalot"));
const mangasee123_1 = __importDefault(require("./mangasee123"));
const mangapark_1 = __importDefault(require("./mangapark"));
const routes = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    yield fastify.register(mangadex_1.default, { prefix: '/mangadex' });
    yield fastify.register(mangahere_1.default, { prefix: '/mangahere' });
    yield fastify.register(mangakakalot_1.default, { prefix: '/mangakakalot' });
    yield fastify.register(mangasee123_1.default, { prefix: '/mangasee123' });
    yield fastify.register(mangapill_1.default, { prefix: '/mangapill' });
    yield fastify.register(managreader_1.default, { prefix: '/managreader' });
    yield fastify.register(mangapark_1.default, { prefix: '/mangapark' });
    fastify.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        reply.status(200).send('Welcome to Consumet Manga');
    }));
    fastify.get('/:mangaProvider', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queries = {
            mangaProvider: '',
            page: 1,
        };
        queries.mangaProvider = decodeURIComponent(request.params.mangaProvider);
        queries.page = request.query.page;
        if (queries.page < 1)
            queries.page = 1;
        const provider = extensions_1.PROVIDERS_LIST.MANGA.find((provider) => provider.toString.name === queries.mangaProvider);
        try {
            if (provider) {
                reply.redirect(`/manga/${provider.toString.name}`);
            }
            else {
                reply
                    .status(404)
                    .send({ message: 'Page not found, please check the provider list.' });
            }
        }
        catch (err) {
            reply.status(500).send('Something went wrong. Please try again later.');
        }
    }));
});
exports.default = routes;
