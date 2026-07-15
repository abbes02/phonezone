/**
 * Script de seed — Crée le compte admin initial
 * Usage: npx ts-node -r tsconfig-paths/register src/seed-admin.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function seedAdmin() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5433'),
    username: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? 'phone_shop_db',
    synchronize: true, // auto-crée les tables pour le seed
    logging: false,
    entities: [__dirname + '/auth/entities/user.entity{.ts,.js}'],
  });

  await dataSource.initialize();
  console.log('✅ Connecté à PostgreSQL');

  const userRepo = dataSource.getRepository('users');

  // Vérifier si l'admin existe déjà
  const existing = await userRepo.findOne({ where: { email: 'mehdiabbes@gmail.com' } });
  const passwordHash = await bcrypt.hash('mahdi123', 12);

  if (existing) {
    console.log('ℹ️  Le compte admin existe déjà — mise à jour du rôle et du mot de passe...');
    await userRepo.update({ email: 'mehdiabbes@gmail.com' }, { passwordHash, role: 'ADMIN', isActive: true });
    console.log('✅ Compte admin mis à jour');
  } else {
    await userRepo.save({
      fullName: 'Mehdi Abbes',
      email: 'mehdiabbes@gmail.com',
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    });
    console.log('✅ Compte admin créé avec succès !');
  }

  console.log('\n📋 Identifiants admin :');
  console.log('   Email    : mehdiabbes@gmail.com');
  console.log('   Mot de passe : mahdi123');
  console.log('   Rôle     : ADMIN\n');

  await dataSource.destroy();
  process.exit(0);
}

seedAdmin().catch(err => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
