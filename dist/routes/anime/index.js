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
const gogoanime_1 = __importDefault(require("./gogoanime"));
const animepahe_1 = __importDefault(require("./animepahe"));
const zoro_1 = __importDefault(require("./zoro"));
const _9anime_1 = __importDefault(require("./9anime"));
const animefox_1 = __importDefault(require("./animefox"));
const anify_1 = __importDefault(require("./anify"));
const crunchyroll_1 = __importDefault(require("./crunchyroll"));
const bilibili_1 = __importDefault(require("./bilibili"));
const marin_1 = __importDefault(require("./marin"));
const anix_1 = __importDefault(require("./anix"));
const animekai_1 = __importDefault(require("./animekai"));
const routes = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    yield fastify.register(gogoanime_1.default, { prefix: '/gogoanime' });
    yield fastify.register(animepahe_1.default, { prefix: '/animepahe' });
    yield fastify.register(zoro_1.default, { prefix: '/zoro' });
    yield fastify.register(_9anime_1.default, { prefix: '/9anime' });
    yield fastify.register(animefox_1.default, { prefix: '/animefox' });
    yield fastify.register(anify_1.default, { prefix: '/anify' });
    yield fastify.register(crunchyroll_1.default, { prefix: '/crunchyroll' });
    yield fastify.register(bilibili_1.default, { prefix: '/bilibili' });
    yield fastify.register(marin_1.default, { prefix: '/marin' });
    yield fastify.register(anix_1.default, { prefix: '/anix' });
    yield fastify.register(animekai_1.default, { prefix: '/animekai' });
    fastify.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        reply.status(200).send('Welcome to Consumet Anime 🗾');
    }));
    fastify.get('/:animeProvider', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queries = {
            animeProvider: '',
            page: 1,
        };
        queries.animeProvider = decodeURIComponent(request.params.animeProvider);
        queries.page = request.query.page;
        if (queries.page < 1)
            queries.page = 1;
        const provider = extensions_1.PROVIDERS_LIST.ANIME.find((provider) => provider.toString.name === queries.animeProvider);
        try {
            if (provider) {
                reply.redirect(`/anime/${provider.toString.name}`);
            }
            else {
                reply
                    .status(404)
                    .send({ message: 'Provider not found, please check the providers list.' });
            }
        }
        catch (err) {
            reply.status(500).send('Something went wrong. Please try again later.');
        }
    }));
});
exports.default = routes;
