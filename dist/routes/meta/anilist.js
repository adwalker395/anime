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
const models_1 = require("@consumet/extensions/dist/models");
const anilist_1 = __importDefault(require("@consumet/extensions/dist/providers/meta/anilist"));
const models_2 = require("@consumet/extensions/dist/models");
const cache_1 = __importDefault(require("../../utils/cache"));
const main_1 = require("../../main");
const _9anime_1 = __importDefault(require("@consumet/extensions/dist/providers/anime/9anime"));
const zoro_1 = __importDefault(require("@consumet/extensions/dist/providers/anime/zoro"));
const routes = (fastify, options) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.get('/', (_, rp) => {
        rp.status(200).send({
            intro: "Welcome to the anilist provider: check out the provider's website @ https://anilist.co/",
            routes: ['/:query', '/info/:id', '/watch/:episodeId'],
            documentation: 'https://docs.consumet.org/#tag/anilist',
        });
    });
    fastify.get('/:query', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const anilist = generateAnilistMeta();
        const query = request.params.query;
        const page = request.query.page;
        const perPage = request.query.perPage;
        const res = yield anilist.search(query, page, perPage);
        reply.status(200).send(res);
    }));
    fastify.get('/advanced-search', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const query = request.query.query;
        const page = request.query.page;
        const perPage = request.query.perPage;
        const type = request.query.type;
        let genres = request.query.genres;
        const id = request.query.id;
        const format = request.query.format;
        let sort = request.query.sort;
        const status = request.query.status;
        const year = request.query.year;
        const season = request.query.season;
        const anilist = generateAnilistMeta();
        if (genres) {
            JSON.parse(genres).forEach((genre) => {
                if (!Object.values(models_1.Genres).includes(genre)) {
                    return reply.status(400).send({ message: `${genre} is not a valid genre` });
                }
            });
            genres = JSON.parse(genres);
        }
        if (sort)
            sort = JSON.parse(sort);
        if (season)
            if (!['WINTER', 'SPRING', 'SUMMER', 'FALL'].includes(season))
                return reply.status(400).send({ message: `${season} is not a valid season` });
        const res = yield anilist.advancedSearch(query, type, page, perPage, format, sort, genres, id, year, status, season);
        reply.status(200).send(res);
    }));
    fastify.get('/trending', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        const perPage = request.query.perPage;
        const anilist = generateAnilistMeta();
        main_1.redis
            ? reply
                .status(200)
                .send(yield cache_1.default.fetch(main_1.redis, `anilist:trending;${page};${perPage}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield anilist.fetchTrendingAnime(page, perPage); }), 60 * 60))
            : reply.status(200).send(yield anilist.fetchTrendingAnime(page, perPage));
    }));
    fastify.get('/popular', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        const perPage = request.query.perPage;
        const anilist = generateAnilistMeta();
        main_1.redis
            ? reply
                .status(200)
                .send(yield cache_1.default.fetch(main_1.redis, `anilist:popular;${page};${perPage}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield anilist.fetchPopularAnime(page, perPage); }), 60 * 60))
            : reply.status(200).send(yield anilist.fetchPopularAnime(page, perPage));
    }));
    fastify.get('/airing-schedule', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const page = request.query.page;
        const perPage = request.query.perPage;
        const weekStart = request.query.weekStart;
        const weekEnd = request.query.weekEnd;
        const notYetAired = request.query.notYetAired;
        const anilist = generateAnilistMeta();
        const _weekStart = Math.ceil(Date.now() / 1000);
        const res = yield anilist.fetchAiringSchedule(page !== null && page !== void 0 ? page : 1, perPage !== null && perPage !== void 0 ? perPage : 20, weekStart !== null && weekStart !== void 0 ? weekStart : _weekStart, weekEnd !== null && weekEnd !== void 0 ? weekEnd : _weekStart + 604800, notYetAired !== null && notYetAired !== void 0 ? notYetAired : true);
        reply.status(200).send(res);
    }));
    fastify.get('/genre', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const genres = request.query.genres;
        const page = request.query.page;
        const perPage = request.query.perPage;
        const anilist = generateAnilistMeta();
        if (typeof genres === 'undefined')
            return reply.status(400).send({ message: 'genres is required' });
        JSON.parse(genres).forEach((genre) => {
            if (!Object.values(models_1.Genres).includes(genre)) {
                return reply.status(400).send({ message: `${genre} is not a valid genre` });
            }
        });
        const res = yield anilist.fetchAnimeGenres(JSON.parse(genres), page, perPage);
        reply.status(200).send(res);
    }));
    fastify.get('/recent-episodes', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const provider = request.query.provider;
        const page = request.query.page;
        const perPage = request.query.perPage;
        const anilist = generateAnilistMeta(provider);
        const res = yield anilist.fetchRecentEpisodes(provider, page, perPage);
        reply.status(200).send(res);
    })),
        fastify.get('/random-anime', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
            const anilist = generateAnilistMeta();
            const res = yield anilist.fetchRandomAnime().catch((err) => {
                return reply.status(404).send({ message: 'Anime not found' });
            });
            reply.status(200).send(res);
        }));
    fastify.get('/servers/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.params.id;
        const provider = request.query.provider;
        let anilist = generateAnilistMeta(provider);
        const res = yield anilist.fetchEpisodeServers(id);
        anilist = new extensions_1.META.Anilist();
        reply.status(200).send(res);
    }));
    fastify.get('/episodes/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const id = request.params.id;
        const provider = request.query.provider;
        let fetchFiller = request.query.fetchFiller;
        let dub = request.query.dub;
        const locale = request.query.locale;
        let anilist = generateAnilistMeta(provider);
        if (dub === 'true' || dub === '1')
            dub = true;
        else
            dub = false;
        if (fetchFiller === 'true' || fetchFiller === '1')
            fetchFiller = true;
        else
            fetchFiller = false;
        try {
            main_1.redis
                ? reply
                    .status(200)
                    .send(yield cache_1.default.fetch(main_1.redis, `anilist:episodes;${id};${dub};${fetchFiller};${anilist.provider.name.toLowerCase()}`, () => __awaiter(void 0, void 0, void 0, function* () {
                    return anilist.fetchEpisodesListById(id, dub, fetchFiller);
                }), dayOfWeek === 0 || dayOfWeek === 6 ? 60 * 120 : (60 * 60) / 2))
                : reply
                    .status(200)
                    .send(yield anilist.fetchEpisodesListById(id, dub, fetchFiller));
        }
        catch (err) {
            return reply.status(404).send({ message: 'Anime not found' });
        }
    }));
    // anilist info without episodes
    fastify.get('/data/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.params.id;
        const anilist = generateAnilistMeta();
        const res = yield anilist.fetchAnilistInfoById(id);
        reply.status(200).send(res);
    }));
    // anilist info with episodes
    fastify.get('/info/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.params.id;
        const today = new Date();
        const dayOfWeek = today.getDay();
        const provider = request.query.provider;
        let fetchFiller = request.query.fetchFiller;
        let isDub = request.query.dub;
        const locale = request.query.locale;
        let anilist = generateAnilistMeta(provider);
        if (isDub === 'true' || isDub === '1')
            isDub = true;
        else
            isDub = false;
        if (fetchFiller === 'true' || fetchFiller === '1')
            fetchFiller = true;
        else
            fetchFiller = false;
        try {
            main_1.redis
                ? reply
                    .status(200)
                    .send(yield cache_1.default.fetch(main_1.redis, `anilist:info;${id};${isDub};${fetchFiller};${anilist.provider.name.toLowerCase()}`, () => __awaiter(void 0, void 0, void 0, function* () { return anilist.fetchAnimeInfo(id, isDub, fetchFiller); }), dayOfWeek === 0 || dayOfWeek === 6 ? 60 * 120 : (60 * 60) / 2))
                : reply
                    .status(200)
                    .send(yield anilist.fetchAnimeInfo(id, isDub, fetchFiller));
        }
        catch (err) {
            reply.status(500).send({ message: err.message });
        }
    }));
    // anilist character info
    fastify.get('/character/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.params.id;
        const anilist = generateAnilistMeta();
        const res = yield anilist.fetchCharacterInfoById(id);
        reply.status(200).send(res);
    }));
    fastify.get('/watch/:episodeId', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const episodeId = request.params.episodeId;
        const provider = request.query.provider;
        const server = request.query.server;
        let isDub = request.query.dub;
        if (server && !Object.values(models_2.StreamingServers).includes(server))
            return reply.status(400).send('Invalid server');
        if (isDub === 'true' || isDub === '1')
            isDub = true;
        else
            isDub = false;
        let anilist = generateAnilistMeta(provider);
        try {
            main_1.redis
                ? reply
                    .status(200)
                    .send(yield cache_1.default.fetch(main_1.redis, `anilist:watch;${episodeId};${anilist.provider.name.toLowerCase()};${server};${isDub ? 'dub' : 'sub'}`, () => __awaiter(void 0, void 0, void 0, function* () {
                    return provider === 'zoro' || provider === 'animekai'
                        ? yield anilist.fetchEpisodeSources(episodeId, server, isDub ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB)
                        : yield anilist.fetchEpisodeSources(episodeId, server);
                }), 600))
                : reply
                    .status(200)
                    .send(provider === 'zoro' || provider === 'animekai'
                    ? yield anilist.fetchEpisodeSources(episodeId, server, isDub ? models_1.SubOrSub.DUB : models_1.SubOrSub.SUB)
                    : yield anilist.fetchEpisodeSources(episodeId, server));
            anilist = new extensions_1.META.Anilist(undefined, {
                url: process.env.PROXY,
            });
        }
        catch (err) {
            reply
                .status(500)
                .send({ message: 'Something went wrong. Contact developer for help.' });
        }
    }));
    //anilist staff info from character id (for example: voice actors)
    //http://127.0.0.1:3000/meta/anilist/staff/95095  (gives info of sukuna's voice actor (Junichi Suwabe) )
    fastify.get('/staff/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const id = request.params.id;
        const anilist = generateAnilistMeta();
        try {
            main_1.redis
                ? reply
                    .status(200)
                    .send(yield cache_1.default.fetch(main_1.redis, `anilist:staff;${id}`, () => __awaiter(void 0, void 0, void 0, function* () { return yield anilist.fetchStaffById(Number(id)); }), 60 * 60))
                : reply.status(200).send(yield anilist.fetchStaffById(Number(id)));
        }
        catch (err) {
            reply.status(404).send({ message: err.message });
        }
    }));
});
const generateAnilistMeta = (provider = undefined) => {
    var _a, _b, _c;
    if (typeof provider !== 'undefined') {
        let possibleProvider = extensions_1.PROVIDERS_LIST.ANIME.find((p) => p.name.toLowerCase() === provider.toLocaleLowerCase());
        if (possibleProvider instanceof _9anime_1.default) {
            possibleProvider = new extensions_1.ANIME.NineAnime((_a = process.env) === null || _a === void 0 ? void 0 : _a.NINE_ANIME_HELPER_URL, {
                url: (_b = process.env) === null || _b === void 0 ? void 0 : _b.NINE_ANIME_PROXY,
            }, (_c = process.env) === null || _c === void 0 ? void 0 : _c.NINE_ANIME_HELPER_KEY);
        }
        return new extensions_1.META.Anilist(possibleProvider, {
            url: process.env.PROXY,
        });
    }
    else {
        // default provider is Zoro
        return new anilist_1.default(new zoro_1.default(), {
            url: process.env.PROXY,
        });
    }
};
exports.default = routes;
