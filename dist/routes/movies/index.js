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
const flixhq_1 = __importDefault(require("./flixhq"));
const viewasian_1 = __importDefault(require("./viewasian"));
const dramacool_1 = __importDefault(require("./dramacool"));
const fmovies_1 = __importDefault(require("./fmovies"));
const goku_1 = __importDefault(require("./goku"));
const movieshd_1 = __importDefault(require("./movieshd"));
const sflix_1 = __importDefault(require("./sflix"));
const multimovies_1 = __importDefault(require("./multimovies"));
const routes = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    yield fastify.register(flixhq_1.default, { prefix: '/flixhq' });
    yield fastify.register(viewasian_1.default, { prefix: '/viewasian' });
    yield fastify.register(dramacool_1.default, { prefix: '/dramacool' });
    yield fastify.register(fmovies_1.default, { prefix: '/fmovies' });
    yield fastify.register(goku_1.default, { prefix: '/goku' });
    yield fastify.register(movieshd_1.default, { prefix: '/movieshd' });
    yield fastify.register(sflix_1.default, { prefix: '/sflix' });
    yield fastify.register(multimovies_1.default, { prefix: '/multimovies' });
    fastify.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        reply.status(200).send('Welcome to Consumet Movies and TV Shows');
    }));
    fastify.get('/:movieProvider', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const queries = {
            movieProvider: '',
            page: 1,
        };
        queries.movieProvider = decodeURIComponent(request.params.movieProvider);
        queries.page = request.query.page;
        if (queries.page < 1)
            queries.page = 1;
        const provider = extensions_1.PROVIDERS_LIST.MOVIES.find((provider) => provider.toString.name === queries.movieProvider);
        try {
            if (provider) {
                reply.redirect(`/movies/${provider.toString.name}`);
            }
            else {
                reply
                    .status(404)
                    .send({ message: 'Page not found, please check the providers list.' });
            }
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Please try again later.' });
        }
    }));
});
exports.default = routes;
