import autoLoad from '@fastify/autoload'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import fastify from 'fastify'
import fastifyView from '@fastify/view'
import fastifyStatic from '@fastify/static'
import fastifySession from '@fastify/session'
import fastifyCookie from '@fastify/cookie'
import fastifyFormbody from '@fastify/formbody'
import { Eta } from 'eta'

const app = fastify({ logger: true })
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const eta = new Eta()

app.register(fastifyCookie)

app.register(fastifySession, {
    secret: process.env.SESSION_SECRET || 'changez-moi-en-production-avec-une-cle-longue-et-aleatoire',
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true en production avec HTTPS
        httpOnly: true,
        maxAge: 1800000 // 30 minutes
    },
    saveUninitialized: false
})

app.register(fastifyFormbody)

app.register(fastifyView, {
    engine: { eta },
    root: join(__dirname, 'views'),
    viewExt: 'eta'
})

// Servir dossier public
app.register(fastifyStatic, {
    root: join(__dirname, '..', 'public'),
    prefix: '/',
    decorateReply: false
})

app.register(autoLoad, {
    dir: join(__dirname, 'routes')
})

app.register(autoLoad, {
    dir: join(__dirname, 'api')
})

const start = async () => {
    try {
        const port = process.env.PORT || 3000
        await app.listen({ port, host: '0.0.0.0' })
        console.log(`Serveur lancé sur le port ${port}`)
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}

start()