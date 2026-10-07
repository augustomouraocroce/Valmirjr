(function () {
  'use strict';

  var STATUS = {
    disponivel: { rotulo: 'Disponível' },
    reservada: { rotulo: 'Reservada' },
    vendida: { rotulo: 'Vendida' }
  };

  // Explica, ao lado do botão, o que acontece com obras que não estão livres.
  var SITUACAO = {
    reservada: 'Alguém já reservou esta obra. Entre na fila e o Valmir avisa você se ela for liberada.',
    vendida: 'Esta obra já foi vendida. Se você gostou, o Valmir pode criar uma peça parecida sob encomenda.'
  };

  var site = {};
  var obras = [];
  var filtroAtual = 'todas';
  var entrouPelaGrade = false; // a obra foi aberta por um clique aqui (há uma entrada no histórico para voltar)

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  var $ = function (sel, raiz) { return (raiz || document).querySelector(sel); };
  var $$ = function (sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); };

  function slug(texto) {
    return String(texto || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function preco(valor) {
    var n = Number(String(valor == null ? '' : valor).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.'));
    if (!valor || !isFinite(n) || n <= 0) return 'Sob consulta';
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: n % 1 ? 2 : 0 });
  }

  function absoluta(url) {
    try { return new URL(url, location.origin).href; } catch (e) { return url; }
  }

  function linkWhatsApp(texto) {
    var numero = String(site.whatsapp || '').replace(/\D/g, '');
    if (!numero) return '';
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);
  }

  function mensagemObra(o) {
    var status = o.status || 'disponivel';
    var linhas;
    if (status === 'vendida') {
      linhas = [
        'Olá, Valmir! Vi a obra *' + o.titulo + '* no seu site. Sei que já foi vendida, mas gostaria de encomendar algo parecido.',
        '',
        'Imagem: ' + absoluta(o.imagem),
        'Link: ' + location.origin + '/#obra/' + o.id
      ];
    } else {
      var ficha = [o.tecnica, o.dimensoes, o.ano].filter(Boolean).join(' · ');
      linhas = [
        'Olá, Valmir! Tenho interesse na obra:',
        '',
        '*' + o.titulo + '*',
        ficha,
        'Valor: ' + preco(o.preco),
        '',
        'Imagem: ' + absoluta(o.imagem),
        'Link: ' + location.origin + '/#obra/' + o.id,
        '',
        status === 'reservada' ? 'Vi que está reservada. Posso entrar na fila caso seja liberada?' : 'Ela ainda está disponível?'
      ];
    }
    return linhas.filter(function (l, i, arr) { return l !== '' || arr[i - 1] !== ''; }).join('\n');
  }

  /* ---------- Conteúdo fixo ---------- */
  function preencherSite() {
    $$('[data-nome]').forEach(function (el) { el.textContent = site.nome || 'Valmir Jr'; });
    $$('[data-aviso]').forEach(function (el) { el.textContent = site.aviso_envio || ''; });
    $('[data-subtitulo]').textContent = site.subtitulo || '';
    $('[data-ano]').textContent = new Date().getFullYear();

    var foto = $('[data-foto]');
    if (site.foto) foto.src = site.foto;
    foto.closest('figure').hidden = !site.foto;
    foto.onerror = function () { foto.closest('figure').hidden = true; };

    var bio = $('[data-bio]');
    bio.innerHTML = '';
    String(site.bio || '').split(/\n\s*\n/).forEach(function (par) {
      if (!par.trim()) return;
      var p = document.createElement('p');
      p.textContent = par.trim();
      bio.appendChild(p);
    });

    var lista = $('#como-comprar');
    lista.innerHTML = '';
    (site.como_comprar || []).forEach(function (item) {
      var texto = typeof item === 'string' ? item : item && item.texto;
      if (!texto) return;
      var li = document.createElement('li');
      li.textContent = texto;
      lista.appendChild(li);
    });
    lista.hidden = !lista.children.length;

    var wpp = $('[data-wpp-geral]');
    wpp.href = linkWhatsApp('Olá, Valmir! Vim pelo seu site e gostaria de conversar sobre suas obras.');
    wpp.hidden = !wpp.getAttribute('href');

    var tatuagem = linkWhatsApp('Olá, Valmir! Vim pelo seu site e quero fazer uma tatuagem.');
    $$('[data-wpp-tatuagem]').forEach(function (a) { a.href = tatuagem; });
    $$('[data-tatuar]').forEach(function (p) { p.hidden = !tatuagem; });

    var insta = $('[data-insta]');
    var usuario = String(site.instagram || '').trim().replace(/^@/, '');
    if (usuario) insta.href = 'https://www.instagram.com/' + encodeURIComponent(usuario) + '/';
    insta.hidden = !usuario;
  }

  /* ---------- Grade ---------- */
  function renderGrade() {
    var grade = $('#grade');
    grade.innerHTML = '';
    grade.removeAttribute('aria-busy');
    var lista = obras.filter(function (o) {
      return filtroAtual === 'todas' || o.status === filtroAtual;
    });

    lista.forEach(function (o, i) {
      var st = STATUS[o.status] || STATUS.disponivel;
      var li = document.createElement('li');
      li.className = 'card' + (o.status === 'vendida' ? ' vendida' : '');
      li.innerHTML =
        '<button type="button">' +
          '<div class="card-img">' +
            '<img alt="" decoding="async"' + (i > 3 ? ' loading="lazy"' : '') + '>' +
          '</div>' +
          '<h3 class="card-nome"></h3>' +
          '<p class="card-meta"><span class="card-preco"></span></p>' +
        '</button>';
      var img = $('img', li);
      img.addEventListener('error', function () { li.classList.add('sem-foto'); });
      img.addEventListener('load', function () { img.classList.add('carregou'); });
      img.src = o.imagem;
      img.alt = o.titulo + (o.tecnica ? ' — ' + o.tecnica : '');
      $('.card-nome', li).textContent = o.titulo;
      $('.card-preco', li).textContent = o.status === 'vendida' ? 'Vendida' : preco(o.preco) + (o.status === 'reservada' ? ' · ' + st.rotulo : '');
      $('button', li).addEventListener('click', function () {
        entrouPelaGrade = true;
        location.hash = 'obra/' + o.id;
      });
      grade.appendChild(li);
    });

    var vazio = $('#vazio');
    vazio.hidden = lista.length > 0;
    $('#tentar').hidden = true;
    if (!lista.length) mostrarVazio();
    $('#contagem').textContent = lista.length === 1 ? '1 obra' : lista.length + ' obras';
  }

  function mostrarVazio() {
    var texto = $('#vazio-texto');
    var wpp = linkWhatsApp('Olá, Valmir! Vim pelo seu site e gostaria de encomendar um trabalho.');
    if (filtroAtual === 'vendida' || !wpp) {
      texto.textContent = filtroAtual === 'vendida' ? 'Nenhuma obra vendida por enquanto.' : 'Nenhuma obra por aqui ainda.';
      return;
    }
    var link = '<a data-wpp-vazio target="_blank" rel="noopener"></a>';
    texto.innerHTML = filtroAtual === 'disponivel'
      ? 'Nenhuma obra disponível agora. Para ter uma peça parecida, ' + link + '.'
      : 'Ainda não há obras publicadas. Para encomendar um trabalho, ' + link + '.';
    var a = $('[data-wpp-vazio]', texto);
    a.textContent = 'chame o Valmir no WhatsApp';
    a.href = wpp;
  }

  function ligarFiltros() {
    $$('.filtro').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filtroAtual = btn.dataset.filtro;
        $$('.filtro').forEach(function (b) {
          var ativo = b === btn;
          b.classList.toggle('ativo', ativo);
          b.setAttribute('aria-pressed', ativo);
        });
        if ($('#grade').hasAttribute('aria-busy') || !$('#tentar').hidden) return; // ainda carregando ou com erro
        renderGrade();
      });
    });
  }

  /* ---------- Detalhe ---------- */
  var dialogo = $('#detalhe');
  var rolagemAntes = 0;

  function abrirObra(id) {
    var o = obras.find(function (x) { return x.id === id; });
    if (!o) {
      // Link antigo ou obra removida: volta para a grade sem deixar o endereço quebrado.
      history.replaceState(null, '', location.pathname + location.search);
      if (dialogo.open) fecharObra();
      return;
    }

    var imagens = [o.imagem].concat((o.imagens_extras || []).map(function (x) { return typeof x === 'string' ? x : x && x.imagem; })).filter(Boolean);
    var galeria = $('#galeria');
    var pontos = $('#pontos');
    galeria.innerHTML = '';
    pontos.innerHTML = '';
    imagens.forEach(function (src, i) {
      var img = document.createElement('img');
      img.src = src;
      img.alt = o.titulo + (imagens.length > 1 ? ' — imagem ' + (i + 1) + ' de ' + imagens.length : '');
      if (i > 0) img.loading = 'lazy';
      galeria.appendChild(img);
      if (imagens.length > 1) {
        var ponto = document.createElement('button');
        ponto.type = 'button';
        ponto.setAttribute('aria-label', 'Ver imagem ' + (i + 1) + ' de ' + imagens.length);
        ponto.addEventListener('click', function () { irParaImagem(i); });
        pontos.appendChild(ponto);
      }
    });
    $$('.seta').forEach(function (s) { s.hidden = imagens.length < 2; });
    galeria.scrollLeft = 0;
    atualizarPontos();

    var st = STATUS[o.status] || STATUS.disponivel;
    $('#detalhe-titulo').textContent = o.titulo;
    $('#detalhe-preco').textContent = o.status === 'vendida' ? 'Vendida' : preco(o.preco);
    $('#compra-status').textContent = o.status === 'vendida' ? '' : st.rotulo;

    var ficha = $('#ficha');
    ficha.innerHTML = '';
    [['Técnica', o.tecnica], ['Dimensões', o.dimensoes], ['Moldura', o.moldura], ['Ano', o.ano]].forEach(function (par) {
      if (!par[1]) return;
      var dt = document.createElement('dt'); dt.textContent = par[0];
      var dd = document.createElement('dd'); dd.textContent = par[1];
      ficha.appendChild(dt); ficha.appendChild(dd);
    });
    $('#detalhe-desc').textContent = o.descricao || '';

    var situacao = $('#detalhe-situacao');
    situacao.textContent = SITUACAO[o.status] || '';
    situacao.hidden = !situacao.textContent;

    var comprar = $('#comprar');
    var icone = $('.botao-wpp svg').outerHTML;
    comprar.innerHTML = icone + (o.status === 'vendida' ? 'Encomendar algo parecido' : o.status === 'reservada' ? 'Entrar na fila' : 'Quero esta obra') +
      '<span class="sr-only"> (abre o WhatsApp)</span>';
    comprar.href = linkWhatsApp(mensagemObra(o));
    comprar.hidden = !comprar.getAttribute('href');

    document.title = o.titulo + ' — ' + (site.nome || 'Valmir Jr');
    if (!dialogo.open) {
      rolagemAntes = window.scrollY;
      document.body.classList.add('travado');
      dialogo.showModal();
    }
    $('.detalhe-corpo').scrollTop = 0;
  }

  function fecharObra() {
    if (dialogo.open) dialogo.close();
    entrouPelaGrade = false;
    document.body.classList.remove('travado');
    document.title = (site.nome || 'Valmir Jr') + ' — Obras originais';
    window.scrollTo(0, rolagemAntes);
  }

  function atualizarPontos() {
    var galeria = $('#galeria');
    var i = imagemAtual();
    var total = galeria.children.length;
    $$('#pontos button').forEach(function (p, j) {
      p.classList.toggle('ativo', j === i);
      if (j === i) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current');
    });
    $('.seta-ant').disabled = i <= 0;
    $('.seta-prox').disabled = i >= total - 1;
  }

  function imagemAtual() {
    var galeria = $('#galeria');
    return Math.round(galeria.scrollLeft / (galeria.clientWidth || 1));
  }

  function irParaImagem(i) {
    var galeria = $('#galeria');
    var total = galeria.children.length;
    i = Math.max(0, Math.min(total - 1, i));
    var suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    galeria.scrollTo({ left: i * galeria.clientWidth, behavior: suave ? 'smooth' : 'auto' });
  }

  function lerRota() {
    var m = location.hash.match(/^#obra\/(.+)$/);
    if (m) abrirObra(decodeURIComponent(m[1]));
    else if (dialogo.open) fecharObra();
  }

  function sairDaObra() {
    if (/^#obra\//.test(location.hash)) {
      // Aberta pela grade: volta no histórico, assim o "Voltar" do celular não reabre a obra.
      // Aberta por link direto: limpa o endereço sem criar entrada nova.
      if (entrouPelaGrade) { history.back(); return; }
      history.replaceState(null, '', location.pathname + location.search);
    }
    fecharObra();
  }

  $('[data-fechar]').addEventListener('click', sairDaObra);
  dialogo.addEventListener('cancel', function (e) { e.preventDefault(); sairDaObra(); });
  dialogo.addEventListener('click', function (e) { if (e.target === dialogo) sairDaObra(); });
  $('#galeria').addEventListener('scroll', function () { window.requestAnimationFrame(atualizarPontos); }, { passive: true });
  $$('.seta').forEach(function (s) {
    s.addEventListener('click', function () { irParaImagem(imagemAtual() + Number(s.dataset.seta)); });
  });
  dialogo.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if ($('#galeria').children.length < 2) return;
    e.preventDefault();
    irParaImagem(imagemAtual() + (e.key === 'ArrowRight' ? 1 : -1));
  });
  window.addEventListener('hashchange', lerRota);
  window.addEventListener('popstate', lerRota);

  var topo = $('.topo');
  window.addEventListener('scroll', function () { topo.classList.toggle('rolou', window.scrollY > 4); }, { passive: true });

  /* ---------- Início ---------- */
  function carregar(url) {
    var controle = 'AbortController' in window ? new AbortController() : null;
    var prazo = controle && setTimeout(function () { controle.abort(); }, 12000);
    return fetch(url, { cache: 'no-cache', signal: controle && controle.signal })
      .then(function (r) {
        if (!r.ok) throw new Error(url + ' ' + r.status);
        return r.json();
      })
      .finally(function () { clearTimeout(prazo); });
  }

  function falhou(err) {
    console.error(err);
    var grade = $('#grade');
    grade.innerHTML = '';
    grade.removeAttribute('aria-busy');
    $('#vazio').hidden = false;
    $('#vazio-texto').textContent = navigator.onLine === false
      ? 'Você está sem internet. Conecte-se e tente de novo para ver as obras.'
      : 'Não foi possível carregar as obras agora. Tente de novo em instantes.';
    $('#tentar').hidden = false;
  }

  function iniciar() {
    return Promise.all([carregar('/data/site.json'), carregar('/data/obras.json')])
      .then(function (res) {
        site = res[0] || {};
        var usados = {};
        obras = ((res[1] && res[1].obras) || [])
          .filter(function (o) { return o && o.titulo && o.imagem && !o.oculta; })
          .map(function (o) {
            var base = slug(o.titulo) || 'obra';
            var id = base, n = 2;
            while (usados[id]) id = base + '-' + n++;
            usados[id] = true;
            var status = STATUS[o.status] ? o.status : 'disponivel';
            return Object.assign({}, o, { id: id, status: status, titulo: String(o.titulo).trim() });
          });
        preencherSite();
        renderGrade();
        lerRota();
      })
      .catch(falhou);
  }

  $('#tentar').addEventListener('click', function () {
    var botao = this;
    botao.disabled = true;
    botao.textContent = 'Carregando…';
    iniciar().then(function () {
      botao.disabled = false;
      botao.textContent = 'Tentar de novo';
    });
  });

  ligarFiltros();
  iniciar();
})();
