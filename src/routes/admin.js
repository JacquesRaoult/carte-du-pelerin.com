export default async function (fastify, opts) {
  // Middleware de vérification d'authentification pour toutes les routes admin
  fastify.addHook('onRequest', async (request, reply) => {
    if (!request.session?.user) {
      return reply.redirect('/login')
    }
  })

  // Page principale du panneau admin
  fastify.get('/admin', async (request, reply) => {
    const user = request.session.user

    return reply.view('admin.eta', {
      user
    })
  })

  // Route de déconnexion
  fastify.get('/admin/logout', async (request, reply) => {
    request.session.destroy() // ← Changé ici
    return reply.redirect('/login')
  })
}
