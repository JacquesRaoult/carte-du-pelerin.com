import bcrypt from 'bcrypt'

export default async function (fastify, opts) {
    
    // Affiche la page de login
    fastify.get('/login', async (request, reply) => {
        // Si déjà connecté, redirige vers admin
        if (request.session?.user) {
            return reply.redirect('/admin')
        }
        
        return reply.view('login.eta', { error: null })
    })

    // Traite la soumission du formulaire
    fastify.post('/login', async (request, reply) => {
        const { username, password } = request.body
        
        try {
            // Récupère l'utilisateur depuis la base de données
            const user = await fastify.db.getUser(username)
            
            // Vérifie si l'utilisateur existe
            if (!user) {
                return reply.view('login.eta', { 
                    error: 'Identifiants incorrects' 
                })
            }
            
            // Compare le mot de passe
            const match = await bcrypt.compare(password, user.password_hash)
            
            if (!match) {
                return reply.view('login.eta', { 
                    error: 'Identifiants incorrects' 
                })
            }
            
            // Crée la session
            request.session.user = {
                id: user.id,
                username: user.username
            }
            
            // Redirige vers le panneau admin
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
        request.session.delete()
        return reply.redirect('/login')
    })
}