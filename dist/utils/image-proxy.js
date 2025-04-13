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
class ImageProxy {
    getImageProxy(fastify, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const getImage = (url, options) => __awaiter(this, void 0, void 0, function* () {
                const data = yield axios_1.default
                    .get(url, Object.assign({ responseType: 'arraybuffer' }, options))
                    .catch((err) => {
                    return { data: err.response.data };
                });
                return data.data;
            });
            fastify.get('/image-proxy', (request, reply) => __awaiter(this, void 0, void 0, function* () {
                const { url } = request.query;
                // get headers from the query
                const { headers } = request.query;
                if (!url || !headers) {
                    reply.status(400).send('No URL provided');
                    return;
                }
                // return the image
                reply.header('Content-Type', 'image/jpeg');
                reply.header('Cache-Control', 'public, max-age=31536000');
                reply.header('Access-Control-Allow-Origin', '*');
                reply.header('Access-Control-Allow-Methods', 'GET');
                reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                reply.header('Access-Control-Allow-Credentials', 'true');
                reply.send(yield getImage(url, { headers: JSON.parse(headers) }));
            }));
        });
    }
}
exports.default = ImageProxy;
