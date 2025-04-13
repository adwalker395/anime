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
    const ann = new extensions_1.NEWS.ANN();
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the Anime News Network provider: check out the provider's website @ https://www.animenewsnetwork.com/",
            routes: ['/recent-feeds', '/info'],
            documentation: 'https://docs.consumet.org/#tag/animenewsnetwork',
        });
    });
    fastify.get('/recent-feeds', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        let { topic } = req.query;
        try {
            const feeds = yield ann.fetchNewsFeeds(topic);
            reply.status(200).send(feeds);
        }
        catch (e) {
            reply.status(500).send({
                message: e.message,
            });
        }
    }));
    fastify.get('/info', (req, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.query;
        if (typeof id === 'undefined')
            return reply.status(400).send({
                message: 'id is required',
            });
        try {
            const info = yield ann.fetchNewsInfo(id);
            reply.status(200).send(info);
        }
        catch (error) {
            reply.status(500).send({
                message: error.message,
            });
        }
    }));
});
exports.default = routes;
