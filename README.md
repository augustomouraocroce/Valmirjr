# Site — Valmir Jr

Site estático (HTML/CSS/JS puro, sem build), pensado primeiro para celular, com:

- **Grade de obras originais** (filtros Todas / Disponíveis / Vendidas), no estilo da página *originals* da Lola Dupré.
- **Página da obra** (tela cheia no celular, com fotos que deslizam para o lado). Cada obra tem link próprio: `/#obra/<titulo>`.
- **Botão "Quero esta obra"**: abre o WhatsApp do artista com uma mensagem pronta (título, técnica, medidas, preço, link da foto e link da obra).
  Obras vendidas mostram "Encomendar algo parecido", e as reservadas mostram "Entrar na fila".
- **Mini bio** e **contato**.
- **Painel privado em `/admin`** para o Valmir cadastrar obras, subir fotos, mudar preço/status e editar a bio e o WhatsApp. O painel não tem link no site, fica fora do Google (noindex) e só abre para quem é colaborador do repositório no GitHub.

## Estrutura

| Arquivo | Para que serve |
|---|---|
| `index.html`, `styles.css`, `app.js` | O site |
| `data/obras.json` | Lista de obras (editada pelo painel) |
| `data/site.json` | Nome, bio, WhatsApp, Instagram, foto (editado pelo painel) |
| `images/obras/` | Fotos das obras (uploads do painel caem aqui) |
| `admin/` | Painel (Decap CMS) |
| `netlify.toml` | Configuração do Netlify |

## Hospedagem: Cloudflare Pages

O site é estático (sem build). O login do painel roda em `functions/api/` (Pages Functions).

1. **Cloudflare → Workers & Pages → Create → Pages → Connect to Git**: repositório `augustomouraocroce/Valmirjr`, branch `main`, *Framework preset* **None**, *Build command* vazio, *Build output directory* `/`.
2. **Settings → Variables and Secrets** do projeto: `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` (tipo *Secret*) do OAuth App "Painel Valmir Jr" no GitHub.
3. No OAuth App do GitHub, a *Redirect URI* passa a ser `https://borocoshop.com/api/callback`.
4. **Domínio**: adicione `borocoshop.com` ao Cloudflare (plano Free), troque os servidores de nomes na GoDaddy pelos 2 que o Cloudflare mostrar e, no projeto Pages, em *Custom domains*, adicione `borocoshop.com` e `www.borocoshop.com`.
5. Cabeçalhos HTTP ficam em `_headers`.
6. Quem usa o painel precisa ser **colaborador** do repositório no GitHub.

As fotos das obras devem ter no máximo ~1600 px no lado maior (200–400 KB). Fotos direto do celular (3 MB) deixam o site lento.

## Antes de publicar

- WhatsApp configurado: `5531975180693`. Para trocar, use o painel ou edite `data/site.json` (só números: 55 + DDD + número).
- Troque as obras de exemplo e a foto do artista pelas fotos reais. Isso pode ser feito pelo painel.

## Como o Valmir adiciona uma obra

`/admin` → **Obras** → **Obras à venda** → **Adicionar obra** → foto, título, preço, situação → **Publicar**.
O site atualiza sozinho em cerca de 1 minuto. Para marcar como vendida, é só mudar a **Situação**.

## Testar localmente

```bash
python3 -m http.server 8000   # abra http://localhost:8000
```
