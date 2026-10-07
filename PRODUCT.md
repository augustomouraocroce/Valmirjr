# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoas que querem comprar uma obra original do Valmir Jr, quase sempre pelo celular. São quatro públicos, todos confirmados:

- **Seguidores do Instagram** (@valmirjrrr) que chegam pelo link da bio e já conhecem o traço dele.
- **Clientes de tatuagem** que já foram tatuados por ele e querem uma obra dele na parede.
- **Colecionadores e compradores de arte** que avaliam técnica, medidas, procedência e preço com mais critério.
- **Público local de Belo Horizonte** que pode visitar o ateliê ou buscar a obra em mãos.

O usuário secundário é o próprio Valmir. Ele não é técnico e mantém o catálogo sozinho pelo painel `/admin`: cadastra obras, sobe fotos, muda preço e situação, edita bio e WhatsApp.

## Product Purpose

É a vitrine e o canal de venda direta das obras originais do Valmir Jr, artista plástico e tatuador de Belo Horizonte, MG. O visitante vê as obras e abre a de que gostou. O botão leva ao WhatsApp do artista com uma mensagem pronta (título, técnica, medidas, preço, foto e link). Sucesso é o visitante iniciar essa conversa: comprar, reservar, entrar na fila de uma obra reservada ou encomendar algo parecido com uma vendida.

## Positioning

São obras únicas, feitas à mão e assinadas, e a compra é feita direto com o artista, sem galeria nem loja intermediária. A produção transita entre a pele e a tela, e o traço firme da tatuagem encontra a liberdade da pintura. Essa ponte entre tatuador e pintor, com a conversa pessoal pelo WhatsApp, é o que um marketplace ou galeria genérica não consegue copiar.

## Operating Context

- Os visitantes chegam principalmente pelo link da bio no Instagram, no celular.
- A transação inteira acontece no WhatsApp (5531975180693): preço, reserva, frete e pagamento são combinados lá. O site não tem carrinho nem checkout.
- O envio é para todo o Brasil, com frete combinado pelo WhatsApp. Em BH a obra também pode ser buscada ou vista no ateliê.
- Cada obra tem link próprio (`/#obra/<titulo>`), que pode ser compartilhado.

## Capabilities and Constraints

- Site estático em HTML, CSS e JS puro, sem build, publicado no Netlify a partir da `main` no domínio borocoshop.com.
- O conteúdo vem de `data/obras.json` e `data/site.json`, editados pelo Decap CMS em `/admin`, com login via GitHub OAuth para colaboradores. O painel é noindex e não tem link no site.
- Toda mudança de design precisa continuar funcionando com o que o Valmir cadastra pelo painel. Isso inclui fotos de proporção variada, preço vazio ("Sob consulta"), obra sem descrição e várias fotos extras.
- A situação de cada obra é `disponivel`, `reservada` ou `vendida`, e muda o botão:
  - disponível: "Quero esta obra";
  - reservada: "Entrar na fila";
  - vendida: "Encomendar algo parecido".
- O catálogo tem filtros Todas, Disponíveis e Vendidas. Obras vendidas continuam visíveis como portfólio e como porta para encomenda.
- Escopo: o foco é vender obras originais. A tatuagem deve aparecer como um caminho claro para quem quer tatuar, mas agendamento e portfólio de tatuagem não ficam no site.
- Idioma: português do Brasil.

## Brand Commitments

- O nome é **Valmir Jr**, com o subtítulo "Artista plástico & tatuador — Belo Horizonte, MG".
- A voz é direta, calorosa e em primeira pessoa do artista na conversa ("Olá, Valmir!"), sem jargão de galeria.
- O favicon é derivado de uma obra do artista (`images/site/`).
- O retrato do artista é `images/site/rostinha.jpg`, exibido inteiro como polaroid.

## Evidence on Hand

- Existem fotos reais das obras e preços definidos pelo Valmir. Elas ainda vão substituir os exemplos (`images/obras/exemplo-*.svg` e as entradas "Obra exemplo" em `data/obras.json`).
- Também existem a bio real (`data/site.json`), o retrato do artista, o Instagram @valmirjrrr e o e-mail vjrttt@gmail.com.
- **Não existem**, e não podem ser inventados: histórico de exposições, imprensa, prêmios, depoimentos de compradores ou números de vendas.

## Product Principles

1. **A obra vem primeiro.** O site existe para mostrar a obra e levar até a conversa. Nada compete com a imagem.
2. **Uma conversa, não um checkout.** Todo caminho termina no WhatsApp com contexto pronto, e o artista fecha a venda pessoalmente.
3. **Vendida também vende.** Obras vendidas provam a produção e abrem encomendas, nunca são becos sem saída.
4. **O Valmir precisa conseguir manter sozinho.** Toda solução precisa funcionar com o que ele cadastra pelo painel, sem ajuda técnica.
5. **A informação tem que ser verdadeira.** Técnica, medidas, preço e situação são exatos. Credenciais e prova social só entram quando forem reais.
