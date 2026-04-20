import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadPhoto(fichier: Buffer, nomFichier: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'top-service/vehicules',
        public_id: nomFichier,
        resource_type: 'image',
        transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }],
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Upload échoué'));
        resolve(result.secure_url);
      }
    ).end(fichier);
  });
}

export async function supprimerPhoto(url: string): Promise<void> {
  // Extrait le public_id depuis l'URL Cloudinary
  const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/);
  if (!matches) return;
  await cloudinary.uploader.destroy(matches[1]);
}
