// Login do painel (/admin) com GitHub, rodando como Cloudflare Pages Function.
// Passo 1: manda a pessoa para a tela de autorização do GitHub.
// Precisa das variáveis GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET no projeto do Cloudflare.
export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_CLIENT_ID) {
    return new Response('GITHUB_CLIENT_ID não configurado no Cloudflare.', { status: 500 });
  }
  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const auth = new URL('https://github.com/login/oauth/authorize');
  auth.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  auth.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
  auth.searchParams.set('scope', url.searchParams.get('scope') || 'repo,user');
  auth.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: auth.toString(),
      'Set-Cookie': `decap_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      'Cache-Control': 'no-store',
    },
  });
}
