require('dotenv').config();
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

import Redis from 'ioredis';
import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import fs from 'fs';

import books from './routes/books';
import anime from './routes/anime';
import manga from './routes/manga';
import comics from './routes/comics';
import lightnovels from './routes/light-novels';
import movies from './routes/movies';
import meta from './routes/meta';
import news from './routes/news';
import chalk from 'chalk';
import Utils from './utils';
const PORT = parseInt(process.env.PORT || '3000', 10);

console.log('Environment Variables:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  REDIS_HOST: process.env.REDIS_HOST ? 'set' : 'not set'
});

export const redis =
  process.env.REDIS_HOST &&
  new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  });
  if (redis) {
    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }
console.log(process.env.REDIS_HOST, process.env.REDIS_PORT, process.env.REDIS_PASSWORD);
  
const isDev = process.env.NODE_ENV !== 'production';

const fastify = Fastify({
  logger: isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        },
        level: 'debug',
      }
    : {
        level: 'info', // production logging in structured JSON
      },
});
console.log('✅ Fastify instance created');

export const tmdbApi = process.env.TMDB_KEY && process.env.TMDB_KEY;
(async () => {

  await fastify.register(FastifyCors, {
    origin: '*',
    methods: 'GET',
  });

  if (process.env.NODE_ENV === 'DEMO') {
    console.log(chalk.yellowBright('DEMO MODE ENABLED'));

    const map = new Map<string, { expiresIn: Date }>();
    // session duration in milliseconds (5 hours)
    const sessionDuration = 1000 * 60 * 60 * 5;

    fastify.addHook('onRequest', async (request, reply) => {
      const ip = request.ip;
      const session = map.get(ip);

      // check if the requester ip has a session (temporary access)
      if (session) {
        // if session is found, check if the session is expired
        const { expiresIn } = session;
        const currentTime = new Date();
        const sessionTime = new Date(expiresIn);

        // check if the session has been expired
        if (currentTime.getTime() > sessionTime.getTime()) {
          console.log('session expired');
          // if expired, delete the session and continue
          map.delete(ip);

          // redirect to the demo request page
          return reply.redirect('/apidemo');
        }
        console.log('session found. expires in', expiresIn);
        if (request.url === '/apidemo') return reply.redirect('/');
        return;
      }

      // if route is not /apidemo, redirect to the demo request page
      if (request.url === '/apidemo') return;

      console.log('session not found');
      reply.redirect('/apidemo');
    });

    fastify.post('/apidemo', async (request, reply) => {
      const { ip } = request;

      // check if the requester ip has a session (temporary access)
      const session = map.get(ip);

      if (session) return reply.redirect('/');

      // if no session, create a new session
      const expiresIn = new Date(Date.now() + sessionDuration);
      map.set(ip, { expiresIn });

      // redirect to the demo request page
      reply.redirect('/');
    });

    fastify.get('/apidemo', async (_, reply) => {
      try {
        const stream = fs.readFileSync(__dirname + '/../demo/apidemo.html');
        return reply.type('text/html').send(stream);
      } catch (err) {
        console.error(err);
        return reply.status(500).send({
          message: 'Could not load the demo page. Please try again later.',
        });
      }
    });

    // set interval to delete expired sessions every 1 hour
    setInterval(
      () => {
        const currentTime = new Date();
        for (const [ip, session] of map.entries()) {
          const { expiresIn } = session;
          const sessionTime = new Date(expiresIn);

          // check if the session is expired
          if (currentTime.getTime() > sessionTime.getTime()) {
            console.log('session expired for', ip);
            // if expired, delete the session and continue
            map.delete(ip);
          }
        }
      },
      1000 * 60 * 60,
    );
  }

  console.log(chalk.green(`Starting server on port ${PORT}... 🚀`));
  if (!process.env.REDIS_HOST)
    console.warn(chalk.yellowBright('Redis not found. Cache disabled.'));
  if (!process.env.TMDB_KEY)
    console.warn(
      chalk.yellowBright('TMDB api key not found. the TMDB meta route may not work.'),
    );

  await fastify.register(books, { prefix: '/books' });
  await fastify.register(anime, { prefix: '/anime' });
  await fastify.register(manga, { prefix: '/manga' });
  //await fastify.register(comics, { prefix: '/comics' });
  await fastify.register(lightnovels, { prefix: '/light-novels' });
  await fastify.register(movies, { prefix: '/movies' });
  await fastify.register(meta, { prefix: '/meta' });
  await fastify.register(news, { prefix: '/news' });

  await fastify.register(Utils, { prefix: '/utils' });

  try {
    fastify.get('/', (_, rp) => {
      rp.status(200).send(
        `Welcome to consumet api! 🎉 \n${process.env.NODE_ENV === 'DEMO'
          ? 'This is a demo of the api. You should only use this for testing purposes.'
          : ''
        }`,
      );
    });
    fastify.get('*', (request, reply) => {
      reply.status(404).send({
        message: '',
        error: 'page not found',
      });
    });
    
    fastify.get('/health', (_, reply) => {
      return reply.send({ status: 'OK' });
    });

    // fastify.listen({ port: PORT, host: '0.0.0.0' }, (e, address) => {
    //   if (e) throw e;
    //   console.log(`server listening on ${address}`);
    // });
    console.log('🚀 Starting server...');

    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`✅ Server listening on http://0.0.0.0:${PORT}`);

    

  } catch (err: any) {
    console.error('🔥 Failed to start server:', err);
    fastify.log.error(err);
    process.exit(1);
  }
})();
export default async function handler(req: any, res: any) {
  await fastify.ready()
  fastify.server.emit('request', req, res)
}