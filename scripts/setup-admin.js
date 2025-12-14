import bcrypt from 'bcrypt'
import readline from 'readline'
import { pool } from '../src/services/database.js'

// Fonction pour demander confirmation à l'utilisateur
function promptUser (question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase().trim())
    })
  })
}

async function setupAdmin () {
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 8) {
    console.error('❌ Définissez ADMIN_PASSWORD (min 8 caractères)')
    process.exit(1)
  }

  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD

  console.log('🔐 Génération du hash...')
  const passwordHash = await bcrypt.hash(password, 10)

  try {
    await pool.execute(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    )
    console.log('✅ Admin créé avec succès!')
    console.log(`   Username: ${username}`)
    console.log('⚠️  Supprimez ADMIN_PASSWORD du .env maintenant!')
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️  L\'utilisateur existe déjà')

      // Option : mettre à jour le mot de passe
      const response = await promptUser('Voulez-vous mettre à jour le mot de passe? (y/n) ')
      if (response === 'y') {
        await pool.execute(
          'UPDATE users SET password_hash = ? WHERE username = ?',
          [passwordHash, username]
        )
        console.log('✅ Mot de passe mis à jour!')
      }
    } else {
      console.error('❌ Erreur:', error.message)
    }
  } finally {
    // Ferme le pool proprement
    await pool.end()
  }
}

setupAdmin().catch(console.error)
