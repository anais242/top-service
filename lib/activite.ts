import { connectDB } from '@/lib/db/mongodb';
import Activite, { type ActionActivite, type TypeActivite } from '@/models/Activite';

export async function logActivite(params: {
  clientId:   string;
  type:       TypeActivite;
  action:     ActionActivite;
  detail:     string;
  reference?: string;
}) {
  try {
    await connectDB();
    await Activite.create({
      client:    params.clientId,
      type:      params.type,
      action:    params.action,
      detail:    params.detail,
      reference: params.reference ?? null,
    });
  } catch (e) {
    console.error('[logActivite]', e);
  }
}
