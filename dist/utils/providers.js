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
class Providers {
    constructor() {
        this.getProviders = (fastify, options) => __awaiter(this, void 0, void 0, function* () {
            fastify.get('/providers', {
                preValidation: (request, reply, done) => {
                    const { type } = request.query;
                    const providerTypes = Object.keys(extensions_1.PROVIDERS_LIST).map((element) => element);
                    if (type === undefined) {
                        reply.status(400);
                        done(new Error('Type must not be empty. Available types: ' + providerTypes.toString()));
                    }
                    if (!providerTypes.includes(type)) {
                        reply.status(400);
                        done(new Error('Type must be either: ' + providerTypes.toString()));
                    }
                    done(undefined);
                },
            }, (request, reply) => __awaiter(this, void 0, void 0, function* () {
                const { type } = request.query;
                const providers = Object.values(extensions_1.PROVIDERS_LIST[type]).sort((one, two) => one.name.localeCompare(two.name));
                reply.status(200).send(providers.map((element) => element.toString));
            }));
        });
    }
}
exports.default = Providers;
