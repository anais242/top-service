import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI manquant'); process.exit(1); }

const UserSchema = new mongoose.Schema({
  nom:        { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  telephone:  { type: String, required: true },
  motDePasse: { type: String, required: true },
  role:       { type: String, enum: ['client', 'gerant'], default: 'client' },
  actif:      { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User ?? mongoose.model('User', UserSchema);

const UTILISATEURS = [
  {
    nom: 'Client Test',
    email: 'client@test.com',
    telephone: '+242 06 000 0001',
    motDePasse: 'Test1234!',
    role: 'client',
  },
  {
    nom: 'Administrateur Top Service',
    email: 'gerant@topservice.cg',
    telephone: '+242 06 000 0000',
    motDePasse: 'Admin@2025',
    role: 'gerant',
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('✅ Connecté à MongoDB\n');

  for (const u of UTILISATEURS) {
    const existe = await User.findOne({ email: u.email });
    if (existe) {
      console.log(`⚠️  Déjà présent : ${u.email}`);
      continue;
    }
    const hash = await bcrypt.hash(u.motDePasse, 12);
    await User.create({ ...u, motDePasse: hash });
    console.log(`✅ Créé [${u.role}] : ${u.email} / ${u.motDePasse}`);
  }

  await mongoose.disconnect();
  console.log('\nTerminé.');
}

seed().catch((err) => { console.error(err); process.exit(1); });
