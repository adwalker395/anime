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
class ZoroKey {
    constructor() {
        this.getKey = (fastify, options) => __awaiter(this, void 0, void 0, function* () {
            fastify.get('/key/:keyID', (request, reply) => __awaiter(this, void 0, void 0, function* () {
                const keyID = parseInt(request.params.keyID);
                if (keyID !== 4 && keyID !== 6)
                    return reply.status(400).send({ message: 'keyID can either be 4 or 6.' });
                try {
                    const { data } = yield axios_1.default.get(`http://9anime.to/key/e${keyID}.txt`);
                    reply.status(200).send(data);
                }
                catch (err) {
                    reply
                        .status(500)
                        .send({ message: 'Something went wrong. Contact developer for help.' });
                }
            }));
        });
    }
}
exports.default = ZoroKey;
