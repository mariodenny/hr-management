export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  res.setHeader('Set-Cookie', [
    `token=; Path=/; HttpOnly; Max-Age=0`,
  ]);

  return res.status(200).json({ message: 'Logged out' });
}
