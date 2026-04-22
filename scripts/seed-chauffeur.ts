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
});

const User = mongoose.models.User ?? mongoose.model('User', UserSchema);

const CHAUFFEUR = {
  nom:        'Jean-Pierre Moukala',
  email:      'chauffeur@topservice.cg',
  telephone:  '+242 06 111 2233',
  motDePasse: 'Chauffeur@2025',
  role:       'chauffeur' as const,
};

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('Connecté à MongoDB');

  const existe = await User.findOne({ email: CHAUFFEUR.email });
  if (existe) {
    console.log(`Chauffeur déjà présent : ${CHAUFFEUR.email}`);
    await mongoose.disconnect();
    return;
  }

  const hash = await bcrypt.hash(CHAUFFEUR.motDePasse, 12);
  await User.create({ ...CHAUFFEUR, motDePasse: hash });

  console.log('Chauffeur créé :');
  console.log(`  Nom          : ${CHAUFFEUR.nom}`);
  console.log(`  Email        : ${CHAUFFEUR.email}`);
  console.log(`  Mot de passe : ${CHAUFFEUR.motDePasse}`);
  console.log(`  Téléphone    : ${CHAUFFEUR.telephone}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
