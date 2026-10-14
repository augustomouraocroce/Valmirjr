// Login do painel (/admin) com GitHub — passo 2: troca o código pelo token
// e entrega o token à janela do painel no formato que o Decap CMS espera.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = request.headers.get('Cookie') || '';
  const saved = (cookie.match(/(?:^|;\s*)decap_oauth_state=([^;]+)/) || [])[1];

  if (!code || !state || !saved || state !== saved) {
    return page(url.origin, 'error', { message: 'Login expirou ou é inválido. Tente de novo.' });
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'valmirjr-painel' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/api/callback`,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.access_token) {
    return page(url.origin, 'error', { message: data.error_description || 'GitHub não devolveu o acesso.' });
  }
  return page(url.origin, 'success', { token: data.access_token, provider: 'github' });
}

function page(origin, status, content) {
  const msg = `authorization:github:${status}:${JSON.stringify(content)}`;
  const html = `<!doctype html><meta charset="utf-8"><title>Entrando…</title>
<p style="font:15px system-ui;padding:24px">${status === 'success' ? 'Entrando no painel…' : 'Não foi possível entrar. Feche esta janela e tente de novo.'}</p>
<script>
(function () {
  var origin = ${JSON.stringify(origin)};
  var msg = ${JSON.stringify(msg)};
  function receber(e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(msg, origin);
    window.removeEventListener('message', receber);
    ${status === 'success' ? 'setTimeout(function () { window.close(); }, 500);' : ''}
  }
  window.addEventListener('message', receber);
  if (window.opener) window.opener.postMessage('authorizing:github', origin);
})();
</script>`;
  return new Response(html, {
    status: status === 'success' ? 200 : 400,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': 'decap_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    },
  });
}
