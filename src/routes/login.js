import bcrypt from 'bcrypt'

export default async function (fastify, opts) {
  fastify.get('/login', async (request, reply) => {
    if (request.session?.user) {
      return reply.redirect('/admin')
    }
    return reply.view('login.eta', { error: null })
  })

  fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body

    try {
      const user = await fastify.db.getUser(username)

      if (!user) {
        return reply.view('login.eta', {
          error: 'Identifiants incorrects'
        })
      }

      const match = await bcrypt.compare(password, user.password_hash)

      if (!match) {
        return reply.view('login.eta', {
          error: 'Identifiants incorrects'
        })
      }

      request.session.user = {
        id: user.id,
        username: user.username
      }

      return reply.redirect('/admin')
    } catch (error) {
      fastify.log.error(error)
      return reply.view('login.eta', {
        error: 'Erreur serveur'
      })
    }
  })

  // Route de déconnexion
  fastify.get('/logout', async (request, reply) => {
    request.session.destroy() // ← Changé ici aussi
    return reply.redirect('/login')
  })
}
