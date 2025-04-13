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
const reconnecting_websocket_1 = __importDefault(require("reconnecting-websocket"));
const ws_1 = require("ws");
class RapidCloud {
    constructor() {
        this.baseUrl = 'wss://ws1.rapid-cloud.co/socket.io/?EIO=4&transport=websocket';
        this.sId = undefined;
        this.returnSID = (fastify, options) => __awaiter(this, void 0, void 0, function* () {
            fastify.get('/rapid-cloud', (request, reply) => __awaiter(this, void 0, void 0, function* () {
                reply.status(200).send(this.sId);
            }));
        });
        this.socket = new reconnecting_websocket_1.default(this.baseUrl, undefined, {
            WebSocket: ws_1.WebSocket,
        });
        try {
            this.socket.onopen = () => {
                this.socket.send('40');
            };
            this.socket.onmessage = ({ data }) => {
                if (data === null || data === void 0 ? void 0 : data.startsWith('40')) {
                    this.sId = JSON.parse(data.split('40')[1]).sid;
                }
                else if (data == '2') {
                    console.log("recieved pong from RapidCloud's server");
                    this.socket.send('3');
                }
            };
            this.socket.onerror = (err) => {
                console.error('Websocket error: ', err);
            };
            setInterval(() => {
                this.socket.send('3');
            }, 25000);
            setInterval(() => {
                this.socket.reconnect();
            }, 7200000);
        }
        catch (err) {
            console.log(err);
        }
    }
}
exports.default = RapidCloud;
