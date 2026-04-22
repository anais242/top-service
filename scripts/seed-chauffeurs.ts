import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI manquant dans .env.local');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  nom:        { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  telephone:  { type: String, required: true },
  motDePasse: { type: String, required: true },
  role:       { type: String, enum: ['client', 'gerant', 'chauffeur'], default: 'client' },
  actif:      { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User ?? mongoose.model('User', UserSchema);

const CHAUFFEURS = [
  { nom: 'Jean-Pierre Moukala',   email: 'jp.moukala@topservice.cg',    telephone: '+242 06 111 2233', motDePasse: 'Chauffeur@2025' },
  { nom: 'Christian Nzouzi',      email: 'c.nzouzi@topservice.cg',      telephone: '+242 05 222 3344', motDePasse: 'Chauffeur@2025' },
  { nom: 'Parfait Ngambika',      email: 'p.ngambika@topservice.cg',     telephone: '+242 06 333 4455', motDePasse: 'Chauffeur@2025' },
  { nom: 'Rodrigue Boukoulou',    email: 'r.boukoulou@topservice.cg',    telephone: '+242 05 444 5566', motDePasse: 'Chauffeur@2025' },
  { nom: 'Emmanuel Loubota',      email: 'e.loubota@topservice.cg',      telephone: '+242 06 555 6677', motDePasse: 'Chauffeur@2025' },
];

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('Connecté à MongoDB\n');

  for (const c of CHAUFFEURS) {
    const existe = await User.findOne({ email: c.email });
    if (existe) {
      console.log(`✓ Déjà présent : ${c.nom} (${c.email})`);
      continue;
    }
    const hash = await bcrypt.hash(c.motDePasse, 12);
    await User.create({ ...c, motDePasse: hash, role: 'chauffeur' });
    console.log(`+ Créé : ${c.nom} — ${c.email} — ${c.telephone}`);
  }

  console.log('\nTerminé. Mot de passe de tous : Chauffeur@2025');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
