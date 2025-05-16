import { XataClient } from '@xata.io/client';

const xata = new XataClient({
  apiKey: process.env.XATA_API_KEY,
  branch: 'main' // or your branch
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { post_id } = req.body;
  if (!post_id) return res.status(400).json({ error: 'post_id missing' });

  try {
    const existing = await xata.db.post_views.filter({ post_id }).getFirst();

    if (existing) {
      await xata.db.post_views.update(existing.id, {
        views: existing.views + 1,
        last_viewed: new Date().toISOString()
      });
    } else {
      await xata.db.post_views.create({
        post_id,
        views: 1,
        last_viewed: new Date().toISOString()
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
