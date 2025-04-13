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
const anilist_1 = __importDefault(require("./anilist"));
const anilist_manga_1 = __importDefault(require("./anilist-manga"));
const mal_1 = __importDefault(require("./mal"));
const tmdb_1 = __importDefault(require("./tmdb"));
const routes = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    yield fastify.register(anilist_1.default, { prefix: '/anilist' });
    yield fastify.register(anilist_manga_1.default, { prefix: '/anilist-manga' });
    yield fastify.register(mal_1.default, { prefix: '/mal' });
    yield fastify.register(tmdb_1.default, { prefix: '/tmdb' });
    fastify.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        reply.status(200).send('Welcome to Consumet Meta');
    }));
    fastify.get('/:metaProvider', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queries = {
            metaProvider: '',
            page: 1,
        };
        queries.metaProvider = decodeURIComponent(request.params.metaProvider);
        queries.page = request.query.page;
        if (queries.page < 1)
            queries.page = 1;
        const provider = extensions_1.PROVIDERS_LIST.META.find((provider) => provider.toString.name === queries.metaProvider);
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
