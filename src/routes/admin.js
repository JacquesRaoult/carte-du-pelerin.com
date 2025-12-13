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
        
        try {
            // Récupère les données pour le dashboard
            const stats = await fastify.db.getStats()
            
            return reply.view('admin.eta', {
                user,
                stats
            })
        } catch (error) {
            fastify.log.error(error)
            return reply.view('admin.eta', {
                user,
                stats: null,
                error: 'Erreur lors du chargement des données'
            })
        }
    })
    
    // Route pour gérer les pèlerins
    fastify.get('/admin/pilgrims', async (request, reply) => {
        try {
            const pilgrims = await fastify.db.getAllPilgrims()
            
            return reply.view('admin-pilgrims.eta', {
                user: request.session.user,
                pilgrims
            })
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send('Erreur serveur')
        }
    })
    
    // Route pour ajouter un pèlerin
    fastify.post('/admin/pilgrims/add', async (request, reply) => {
        try {
            const data = request.body
            await fastify.db.addPilgrim(data)
            
            return reply.redirect('/admin/pilgrims')
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send('Erreur lors de l\'ajout')
        }
    })
    
    // Route pour supprimer un pèlerin
    fastify.post('/admin/pilgrims/delete/:id', async (request, reply) => {
        try {
            const { id } = request.params
            await fastify.db.deletePilgrim(id)
            
            return reply.redirect('/admin/pilgrims')
        } catch (error) {
            fastify.log.error(error)
            return reply.code(500).send('Erreur lors de la suppression')
        }
    })
}