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

## Publicar no Netlify

1. No Netlify: **Add new site → Import from Git** e escolha este repositório. Não precisa de comando de build; o diretório publicado é `.`.
2. **Branch**: o site é publicado a partir da `main`. Em *Site configuration → Build & deploy → Branches*, a *Production branch* deve ser `main`, a mesma de `backend.branch` em `admin/config.yml`.
3. **Painel privado** (login com GitHub; o Netlify Identity foi descontinuado):
   - No GitHub, em *Settings → Developer settings → OAuth Apps → New OAuth App*, preencha *Homepage URL* `https://borocoshop.com` e *Authorization callback URL* `https://api.netlify.com/auth/done`. Depois gere um *Client secret*.
   - No Netlify, em *Project configuration → Access & security → OAuth → Install a provider*, escolha **GitHub** e cole o *Client ID* e o *Client secret*.
   - Quem for usar o painel precisa de uma conta no GitHub e ser **colaborador** do repositório (*Settings → Collaborators → Add people*).
4. **Domínio** (`borocoshop.com`, registrado na GoDaddy): ele usa o **Netlify DNS**. Na GoDaddy, em *DNS → Servidores de nomes*, ficam os 4 servidores `dns1…dns4.p04.nsone.net`.
5. **HTTPS**: em *Domain management → HTTPS*, clique em **Verify DNS configuration** e depois em **Provision certificate**. Ligue o **Force HTTPS**.

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
