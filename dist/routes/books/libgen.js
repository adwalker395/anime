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
    const libgen = new extensions_1.BOOKS.Libgen();
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the libgen provider. check out the provider's website @ http://libgen.rs/",
            routes: ['/s', '/fs'],
            documentation: 'https://docs.consumet.org/#tag/libgen (needs to be updated)',
        });
    });
    fastify.get('/s', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const { bookTitle, page } = request.query;
        if (bookTitle.length < 4)
            return reply.status(400).send({
                message: 'length of bookTitle must be > 4 characters',
                error: 'short_length',
            });
        if (isNaN(page)) {
            return reply.status(400).send({
                message: 'page is missing',
                error: 'invalid_input',
            });
        }
        try {
            const data = yield libgen.search(bookTitle, page);
            return reply.status(200).send(data);
        }
        catch (e) {
            return reply.status(400).send(e);
        }
    }));
});
exports.default = routes;
