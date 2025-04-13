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
const libgen_1 = __importDefault(require("./libgen"));
const routes = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    const lbgen = new extensions_1.BOOKS.Libgen();
    fastify.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        reply.status(200).send('Welcome to Consumet Books 📚');
    }));
    fastify.get('/s', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const { bookTitle, page } = request.query;
        if (!bookTitle)
            return reply.status(400).send({
                message: 'bookTitle query needed',
                error: 'invalid_input',
            });
        try {
            const data = yield lbgen.search(bookTitle, page);
            return reply.status(200).send(data);
        }
        catch (e) {
            return reply.status(500).send({
                message: e,
                error: 'internal_error',
            });
        }
    }));
    yield fastify.register(libgen_1.default, { prefix: '/libgen' });
});
exports.default = routes;
