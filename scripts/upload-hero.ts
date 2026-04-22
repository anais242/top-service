import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DIR = "C:/Users/hp/Desktop/Top service/Image/image ecran d'acceuil";

async function upload(fichier: string, publicId: string): Promise<string> {
  const buf = fs.readFileSync(path.join(DIR, fichier));
  return new Promise((res, rej) => {
    cloudinary.uploader.upload_stream(
      { folder: 'top-service/hero', public_id: publicId, resource_type: 'image', overwrite: true,
        transformation: [{ width: 1400, height: 700, crop: 'fill', quality: 'auto' }] },
      (err, r) => err ? rej(err) : res(r!.secure_url)
    ).end(buf);
  });
}

async function main() {
  const u1 = await upload('WhatsApp Image 2026-04-22 at 07.58.15 (1).jpeg', 'hero-1');
  console.log('HERO1=' + u1);
  const u2 = await upload('WhatsApp Image 2026-04-22 at 07.58.16 (1).jpeg', 'hero-2');
  console.log('HERO2=' + u2);
}
main().catch(e => { console.error(e); process.exit(1); });
