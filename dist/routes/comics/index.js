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
const routes = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    //await fastify.register(getcomics, { prefix: '/getcomics' });
    fastify.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        reply.status(200).send('Welcome to Consumet Comics 🦸‍♂️');
    }));
    fastify.get('/s', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const { comicTitle, page } = request.query;
        reply.status(300).redirect(`getcomics/s?comicTitle=${comicTitle}&page=${page}`);
    }));
});
exports.default = routes;
