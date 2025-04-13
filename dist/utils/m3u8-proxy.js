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
const axios_1 = __importDefault(require("axios"));
class M3U8Proxy {
    constructor() {
        this.getM3U8 = (url, options) => __awaiter(this, void 0, void 0, function* () {
            const data = yield axios_1.default.get(url, options);
            return data.data;
        });
        this.toQueryString = (obj) => {
            const parts = [];
            for (const i in obj) {
                if (obj[i]) {
                    parts.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]));
                }
            }
            return parts.join('&');
        };
        this.getM3U8Proxy = (fastify, options) => __awaiter(this, void 0, void 0, function* () {
            fastify.get('/m3u8-proxy/*', (request, reply) => __awaiter(this, void 0, void 0, function* () {
                // split params
                const params = request.params['*'].split('/');
                const queries = request.query;
                console.log('params', params);
                // last element is the url
                const url = params.pop();
                // decode safe base64
                const decodedUrl = Buffer.from(url, 'base64').toString('ascii');
                const domain = Buffer.from(params.join(''), 'base64').toString('ascii');
                // queries to object
                const data = yield this.getM3U8(decodedUrl.startsWith('https')
                    ? decodedUrl
                    : domain + url + '?' + this.toQueryString(queries), {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35',
                        watchsb: 'streamsb',
                    },
                });
                //const decodedData = Buffer.from(data, 'binary').toString('utf8');
                reply.header('Content-Type', decodedUrl.startsWith('https') ? 'application/vnd.apple.mpegurl' : 'video/mp2t');
                reply.header('Access-Control-Allow-Origin', '*');
                reply.header('Access-Control-Allow-Headers', '*');
                reply.header('Access-Control-Allow-Methods', '*');
                reply.send(data);
            }));
            fastify.get('/m3u8/*', (request, reply) => __awaiter(this, void 0, void 0, function* () {
                const params = request.params['*'];
                var url = Buffer.from(params, 'base64').toString('utf8');
                try {
                    var req = yield axios_1.default.get(url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
                        },
                    });
                    const pattern = new RegExp('https://', 'g');
                    const final = req.data
                        .toString()
                        .replace(pattern, `https://cors.proxy.consumet.org/https://`);
                    reply
                        .header('Content-Type', 'application/vnd.apple.mpegurl')
                        .header('Content-Disposition', 'attachment; filename=stream.m3u8')
                        .status(200)
                        .send(Buffer.from(final));
                }
                catch (error) {
                    reply.status(400).send(error);
                }
            }));
        });
    }
}
exports.default = M3U8Proxy;
