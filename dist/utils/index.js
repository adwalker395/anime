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
const bilibili_1 = __importDefault(require("./bilibili"));
const image_proxy_1 = __importDefault(require("./image-proxy"));
const m3u8_proxy_1 = __importDefault(require("./m3u8-proxy"));
const providers_1 = __importDefault(require("./providers"));
const key_1 = __importDefault(require("./key"));
const routes = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    //await fastify.register(new RapidCloud().returnSID);
    yield fastify.register(new bilibili_1.default('en_US').returnDASH);
    yield fastify.register(new bilibili_1.default('en_US').returnVTT);
    yield fastify.register(new image_proxy_1.default().getImageProxy);
    yield fastify.register(new m3u8_proxy_1.default().getM3U8Proxy);
    yield fastify.register(new providers_1.default().getProviders);
    yield fastify.register(new key_1.default().getKey);
    fastify.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        reply.status(200).send('Welcome to Consumet Utils!');
    }));
});
exports.default = routes;
