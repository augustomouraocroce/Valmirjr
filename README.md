# Site — Valmir Jr

Site estático (HTML/CSS/JS puro, sem build), pensado primeiro para celular, com:

- **Grade de obras originais** (filtros Todas / Disponíveis / Vendidas), no estilo da página *originals* da Lola Dupré.
- **Página da obra** (tela cheia no celular, com fotos que deslizam para o lado). Cada obra tem link próprio: `/#obra/<titulo>`.
- **Botão "Quero esta obra"**: abre o WhatsApp do artista com uma mensagem pronta (título, técnica, medidas, preço, link da foto e link da obra).
  Obras vendidas mostram "Encomendar algo parecido", e as reservadas mostram "Entrar na fila".
- **Mini bio** e **contato**.
- **Painel privado em `/admin`** para o Valmir cadastrar obras, subir fotos, mudar preço/status e editar a bio e o WhatsApp. O painel não tem link no site, fica fora do Google (noindex) e só abre para quem foi convidado.

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
2. **Branch**: em `admin/config.yml`, `backend.branch` precisa ser a mesma branch que o Netlify publica (hoje está `main`).
3. **Painel privado**: em *Site configuration → Identity*, clique em **Enable Identity**. Depois:
   - *Registration preferences* → **Invite only** (ninguém consegue se cadastrar sozinho);
   - *Services → Git Gateway* → **Enable**;
   - *Identity → Invite users* → convide o e-mail do Valmir. Ele recebe o convite, define uma senha e entra em `seusite.com/admin`.
4. **Domínio**: *Domain management → Add a domain* com a URL de vocês.

## Antes de publicar

- Troque o número de exemplo `5531999999999` pelo WhatsApp real (em `data/site.json` ou pelo painel). Use só números: 55 + DDD + número.
- Troque as obras de exemplo e a foto do artista pelas fotos reais. Isso pode ser feito pelo painel.

## Como o Valmir adiciona uma obra

`/admin` → **Obras** → **Obras à venda** → **Adicionar obra** → foto, título, preço, situação → **Publicar**.
O site atualiza sozinho em cerca de 1 minuto. Para marcar como vendida, é só mudar a **Situação**.

## Testar localmente

```bash
python3 -m http.server 8000   # abra http://localhost:8000
```
