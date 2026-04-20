import 'dotenv/config';
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
  role:       { type: String, enum: ['client', 'gerant'], default: 'client' },
  actif:      { type: Boolean, default: true },
});

const User = mongoose.models.User ?? mongoose.model('User', UserSchema);

const GERANT = {
  nom:       'Administrateur Top Service',
  email:     'gerant@topservice.cg',
  telephone: '+242 06 000 0000',
  motDePasse: 'Admin@2025',
  role:      'gerant' as const,
};

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('Connecté à MongoDB');

  const existe = await User.findOne({ email: GERANT.email });
  if (existe) {
    console.log(`Gérant déjà présent : ${GERANT.email}`);
    await mongoose.disconnect();
    return;
  }

  const hash = await bcrypt.hash(GERANT.motDePasse, 12);
  await User.create({ ...GERANT, motDePasse: hash });

  console.log('Gérant créé :');
  console.log(`  Email     : ${GERANT.email}`);
  console.log(`  Mot de passe : ${GERANT.motDePasse}`);
  console.log('  → Changez ce mot de passe après le premier login !');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
