import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI manquant'); process.exit(1); }

const VehiculeSchema = new mongoose.Schema({
  marque: String, modele: String, annee: Number, couleur: String,
  prixParJour: Number, kilometrage: Number, carburant: String,
  transmission: String, nombrePlaces: Number, description: String,
  photos: [String], statut: { type: String, default: 'disponible' },
}, { timestamps: true });

const Vehicule = mongoose.models.Vehicule ?? mongoose.model('Vehicule', VehiculeSchema);

const VEHICULES = [
  {
    marque: 'Toyota', modele: 'Land Cruiser', annee: 2021, couleur: 'Blanc',
    prixParJour: 75000, kilometrage: 32000, carburant: 'diesel',
    transmission: 'automatique', nombrePlaces: 7, statut: 'disponible',
    description: 'SUV robuste idéal pour les routes africaines. Climatisation, GPS, toit ouvrant.',
    photos: ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=1200&h=800&fit=crop'],
  },
  {
    marque: 'Toyota', modele: 'Corolla', annee: 2022, couleur: 'Argent',
    prixParJour: 25000, kilometrage: 18000, carburant: 'essence',
    transmission: 'manuelle', nombrePlaces: 5, statut: 'disponible',
    description: 'Berline économique et fiable. Parfaite pour les déplacements en ville.',
    photos: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&h=800&fit=crop'],
  },
  {
    marque: 'Mercedes-Benz', modele: 'Classe E', annee: 2020, couleur: 'Noir',
    prixParJour: 90000, kilometrage: 45000, carburant: 'diesel',
    transmission: 'automatique', nombrePlaces: 5, statut: 'disponible',
    description: 'Berline de luxe avec intérieur cuir, système audio premium et conduite assistée.',
    photos: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&h=800&fit=crop'],
  },
  {
    marque: 'Hyundai', modele: 'Tucson', annee: 2021, couleur: 'Gris',
    prixParJour: 35000, kilometrage: 27000, carburant: 'essence',
    transmission: 'automatique', nombrePlaces: 5, statut: 'disponible',
    description: 'SUV compact moderne avec écran tactile, caméra de recul et régulateur de vitesse.',
    photos: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=800&fit=crop'],
  },
  {
    marque: 'Mitsubishi', modele: 'L200', annee: 2020, couleur: 'Blanc',
    prixParJour: 45000, kilometrage: 55000, carburant: 'diesel',
    transmission: 'manuelle', nombrePlaces: 5, statut: 'disponible',
    description: 'Pick-up 4x4 puissant. Idéal pour transporter du matériel ou rouler hors piste.',
    photos: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&h=800&fit=crop'],
  },
  {
    marque: 'Honda', modele: 'CR-V', annee: 2022, couleur: 'Bleu',
    prixParJour: 40000, kilometrage: 12000, carburant: 'essence',
    transmission: 'automatique', nombrePlaces: 5, statut: 'disponible',
    description: 'SUV familial spacieux avec grand coffre, Honda Sensing et connectivité Apple CarPlay.',
    photos: ['https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=1200&h=800&fit=crop'],
  },
  {
    marque: 'Nissan', modele: 'Patrol', annee: 2019, couleur: 'Sable',
    prixParJour: 80000, kilometrage: 68000, carburant: 'diesel',
    transmission: 'automatique', nombrePlaces: 8, statut: 'maintenance',
    description: 'Grand SUV 8 places, traction intégrale permanente. Parfait pour les longs trajets.',
    photos: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&h=800&fit=crop'],
  },
  {
    marque: 'Kia', modele: 'Sportage', annee: 2023, couleur: 'Rouge',
    prixParJour: 32000, kilometrage: 5000, carburant: 'essence',
    transmission: 'automatique', nombrePlaces: 5, statut: 'disponible',
    description: 'Tout neuf ! SUV compact avec garantie constructeur, système multimédia dernière génération.',
    photos: ['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=1200&h=800&fit=crop'],
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('✅ Connecté à MongoDB\n');

  const existants = await Vehicule.countDocuments();
  if (existants > 0) {
    console.log(`⚠️  ${existants} véhicule(s) déjà en base. Suppression et recréation...`);
    await Vehicule.deleteMany({});
  }

  await Vehicule.insertMany(VEHICULES);
  console.log(`✅ ${VEHICULES.length} véhicules créés avec succès.`);

  await mongoose.disconnect();
  console.log('\nTerminé.');
}

seed().catch((err) => { console.error(err); process.exit(1); });
