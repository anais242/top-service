import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI manquant'); process.exit(1); }

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const VehiculeSchema = new mongoose.Schema({
  marque: String, modele: String, annee: Number, couleur: String,
  ville: { type: String, default: 'brazzaville' },
  prixParJour: Number, prixParHeure: Number, kilometrage: Number, carburant: String,
  transmission: String, nombrePlaces: Number, description: String,
  chauffeurDisponible: { type: Boolean, default: false },
  prixChauffeurParJour: Number,
  photos: [String], statut: { type: String, default: 'disponible' },
}, { timestamps: true });

const Vehicule = mongoose.models.Vehicule ?? mongoose.model('Vehicule', VehiculeSchema);

const IMG_DIR = path.resolve(
  'C:/Users/hp/Desktop/Top service/Image/Image vehicules'
);

const VEHICULES_DATA = [
  {
    marque: 'Toyota', modele: 'Yaris', annee: 2018, couleur: 'Noir',
    prixParJour: 20000, prixParHeure: 3000, kilometrage: 65000, carburant: 'essence',
    transmission: 'manuelle', nombrePlaces: 5, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 15000,
    description: 'Citadine compacte et économique, idéale pour les déplacements en ville.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.58.jpeg',
    publicId: 'toyota-yaris',
  },
  {
    marque: 'Toyota', modele: 'RAV4 II', annee: 2004, couleur: 'Gris',
    prixParJour: 30000, prixParHeure: 5000, kilometrage: 120000, carburant: 'essence',
    transmission: 'manuelle', nombrePlaces: 5, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 20000,
    description: 'SUV compact 2ème génération, robuste et fiable pour tous types de trajets.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.16 (2).jpeg',
    publicId: 'toyota-rav4-2',
  },
  {
    marque: 'Suzuki', modele: 'Grand Vitara', annee: 2010, couleur: 'Gris',
    prixParJour: 40000, prixParHeure: 6000, kilometrage: 95000, carburant: 'essence',
    transmission: 'automatique', nombrePlaces: 5, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 20000,
    description: 'SUV compact tout-terrain avec intérieur cuir noir et boîte automatique.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.58 (1).jpeg',
    publicId: 'suzuki-grand-vitara',
  },
  {
    marque: 'Toyota', modele: 'RAV4', annee: 2013, couleur: 'Rouge',
    prixParJour: 45000, prixParHeure: 7000, kilometrage: 80000, carburant: 'essence',
    transmission: 'automatique', nombrePlaces: 5, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 25000,
    description: 'SUV RAV4 3ème génération en rouge, intérieur gris clair, coffre spacieux.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.13.jpeg',
    publicId: 'toyota-rav4-rouge',
  },
  {
    marque: 'Toyota', modele: 'RAV4', annee: 2019, couleur: 'Gris',
    prixParJour: 50000, prixParHeure: 8000, kilometrage: 42000, carburant: 'essence',
    transmission: 'automatique', nombrePlaces: 5, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 25000,
    description: 'SUV RAV4 5ème génération, écran tactile, sièges gris, coffre avec hayon électrique.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.12.jpeg',
    publicId: 'toyota-rav4-gris',
  },
  {
    marque: 'Toyota', modele: 'Hilux', annee: 2020, couleur: 'Gris',
    prixParJour: 50000, prixParHeure: 8000, kilometrage: 55000, carburant: 'diesel',
    transmission: 'automatique', nombrePlaces: 5, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 25000,
    description: 'Pick-up double cabine dernière génération, benne aluminium, écran multimédia.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.14 (1).jpeg',
    publicId: 'toyota-hilux-silver',
  },
  {
    marque: 'Toyota', modele: 'Hilux 8G', annee: 2016, couleur: 'Blanc',
    prixParJour: 60000, prixParHeure: 9000, kilometrage: 75000, carburant: 'diesel',
    transmission: 'automatique', nombrePlaces: 5, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 25000,
    description: 'Toyota Hilux 8ème génération blanc, intérieur cuir noir, benne métallique.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.15.jpeg',
    publicId: 'toyota-hilux-8g',
  },
  {
    marque: 'Jetour', modele: 'Dashing', annee: 2023, couleur: 'Blanc',
    prixParJour: 70000, prixParHeure: 10000, kilometrage: 8000, carburant: 'essence',
    transmission: 'automatique', nombrePlaces: 5, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 30000,
    description: 'SUV Jetour Dashing neuf, design sport, écran large, sellerie sport.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.14 (4).jpeg',
    publicId: 'jetour-dashing',
  },
  {
    marque: 'Jetour', modele: 'X70 Plus', annee: 2022, couleur: 'Argent',
    prixParJour: 75000, prixParHeure: 10000, kilometrage: 15000, carburant: 'essence',
    transmission: 'automatique', nombrePlaces: 7, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 30000,
    description: 'Grand SUV 7 places, sellerie rouge premium, toit panoramique, écran tactile HD.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.12 (1).jpeg',
    publicId: 'jetour-x70-plus',
  },
  {
    marque: 'Toyota', modele: 'Fortuner', annee: 2018, couleur: 'Blanc',
    prixParJour: 75000, prixParHeure: 10000, kilometrage: 62000, carburant: 'diesel',
    transmission: 'automatique', nombrePlaces: 7, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 30000,
    description: 'SUV 7 places Toyota Fortuner, sellerie beige, coffre modulable, traction 4x4.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.14 (2).jpeg',
    publicId: 'toyota-fortuner',
  },
  {
    marque: 'Lexus', modele: 'GX 460', annee: 2015, couleur: 'Bleu nuit',
    prixParJour: 85000, prixParHeure: 12000, kilometrage: 78000, carburant: 'essence',
    transmission: 'automatique', nombrePlaces: 7, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 35000,
    description: 'SUV de luxe Lexus GX 460, intérieur cuir beige 7 places, 4x4 permanent.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.15 (2).jpeg',
    publicId: 'lexus-gx460',
  },
  {
    marque: 'Jetour', modele: 'T1', annee: 2024, couleur: 'Gris',
    prixParJour: 90000, prixParHeure: 12000, kilometrage: 5000, carburant: 'essence',
    transmission: 'automatique', nombrePlaces: 5, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 35000,
    description: 'Jetour T1 gris, SUV baroudeur design carré, sellerie turquoise, Apple CarPlay.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.13 (1).jpeg',
    publicId: 'jetour-t1-gris',
  },
  {
    marque: 'Jetour', modele: 'T1 Premium', annee: 2024, couleur: 'Noir',
    prixParJour: 120000, prixParHeure: 15000, kilometrage: 3000, carburant: 'essence',
    transmission: 'automatique', nombrePlaces: 5, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 40000,
    description: 'Jetour T1 version Premium noire, intérieur cuir vert luxe, sellerie prestige.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.14.jpeg',
    publicId: 'jetour-t1-noir',
  },
  {
    marque: 'Toyota', modele: 'Land Cruiser Prado', annee: 2024, couleur: 'Sable',
    prixParJour: 150000, prixParHeure: 20000, kilometrage: 2000, carburant: 'diesel',
    transmission: 'automatique', nombrePlaces: 7, ville: 'brazzaville',
    chauffeurDisponible: true, prixChauffeurParJour: 50000,
    description: 'Toyota Land Cruiser Prado 2024, Mode Select 4x4, coffre XXL, le summum du confort.',
    imageFile: 'WhatsApp Image 2026-04-22 at 07.58.17 (1).jpeg',
    publicId: 'toyota-prado',
  },
];

async function uploadImage(imageFile: string, publicId: string): Promise<string> {
  const filePath = path.join(IMG_DIR, imageFile);
  const buffer = fs.readFileSync(filePath);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'top-service/vehicules',
        public_id: publicId,
        resource_type: 'image',
        overwrite: true,
        transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }],
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Upload échoué'));
        resolve(result.secure_url);
      }
    ).end(buffer);
  });
}

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('✅ Connecté à MongoDB\n');

  const existants = await Vehicule.countDocuments();
  if (existants > 0) {
    console.log(`🗑️  Suppression de ${existants} ancien(s) véhicule(s)...`);
    await Vehicule.deleteMany({});
    console.log('✅ Anciens véhicules supprimés\n');
  }

  const vehiculesAvecPhotos = [];

  for (const v of VEHICULES_DATA) {
    const { imageFile, publicId, ...data } = v;
    console.log(`📤 Upload image: ${v.modele}...`);
    try {
      const url = await uploadImage(imageFile, publicId);
      console.log(`   ✅ ${url}`);
      vehiculesAvecPhotos.push({ ...data, photos: [url] });
    } catch (err) {
      console.error(`   ❌ Erreur upload ${v.modele}:`, err);
      vehiculesAvecPhotos.push({ ...data, photos: [] });
    }
  }

  await Vehicule.insertMany(vehiculesAvecPhotos);
  console.log(`\n✅ ${vehiculesAvecPhotos.length} véhicules insérés en base.`);

  await mongoose.disconnect();
  console.log('Terminé.');
}

seed().catch((err) => { console.error(err); process.exit(1); });
