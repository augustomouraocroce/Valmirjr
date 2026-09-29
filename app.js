(function () {
  'use strict';

  var STATUS = {
    disponivel: { rotulo: 'Disponível', selo: '' },
    reservada: { rotulo: 'Reservada', selo: 'Reservada' },
    vendida: { rotulo: 'Vendida', selo: 'Vendida' }
  };

  var site = {};
  var obras = [];
  var filtroAtual = 'todas';

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
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);
  }

  function mensagemObra(o) {
    var status = o.status || 'disponivel';
    var linhas;
    if (status === 'vendida') {
      linhas = [
        'Olá, Valmir! Vi a obra *' + o.titulo + '* no seu site (já vendida).',
        'Tenho interesse em algo parecido / uma encomenda.',
        '',
        'Imagem: ' + absoluta(o.imagem)
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
    if (site.foto) foto.src = site.foto; else foto.closest('figure').hidden = true;

    var bio = $('[data-bio]');
    bio.innerHTML = '';
    String(site.bio || '').split(/\n\s*\n/).forEach(function (par) {
      if (!par.trim()) return;
      var p = document.createElement('p');
      p.textContent = par.trim();
      bio.appendChild(p);
    });

    var wpp = $('[data-wpp-geral]');
    wpp.href = linkWhatsApp('Olá, Valmir! Vim pelo seu site e gostaria de conversar sobre suas obras.');

    var insta = $('[data-insta]');
    if (site.instagram) insta.href = 'https://www.instagram.com/' + site.instagram.replace(/^@/, '') + '/';
    else insta.hidden = true;
  }

  /* ---------- Grade ---------- */
  function renderGrade() {
    var grade = $('#grade');
    grade.innerHTML = '';
    var lista = obras.filter(function (o) {
      if (filtroAtual === 'todas') return true;
      if (filtroAtual === 'disponivel') return o.status !== 'vendida';
      return o.status === filtroAtual;
    });

    lista.forEach(function (o, i) {
      var st = STATUS[o.status] || STATUS.disponivel;
      var li = document.createElement('li');
      li.className = 'card' + (o.status === 'vendida' ? ' vendida' : '');
      li.innerHTML =
        '<button type="button">' +
          '<div class="card-img">' +
            '<img alt="" width="800" height="1000" decoding="async"' + (i > 3 ? ' loading="lazy"' : '') + '>' +
            (st.selo ? '<span class="selo"></span>' : '') +
          '</div>' +
          '<h3 class="card-nome"></h3>' +
          '<p class="card-meta"><span class="card-preco"></span></p>' +
        '</button>';
      var img = $('img', li);
      img.src = o.imagem;
      img.alt = o.titulo + (o.tecnica ? ' — ' + o.tecnica : '');
      if (st.selo) $('.selo', li).textContent = st.selo;
      $('.card-nome', li).textContent = o.titulo;
      $('.card-preco', li).textContent = preco(o.preco);
      $('button', li).addEventListener('click', function () { location.hash = 'obra/' + o.id; });
      grade.appendChild(li);
    });

    $('#vazio').hidden = lista.length > 0;
  }

  function ligarFiltros() {
    $$('.filtro').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filtroAtual = btn.dataset.filtro;
        $$('.filtro').forEach(function (b) {
          var ativo = b === btn;
          b.classList.toggle('ativo', ativo);
          b.setAttribute('aria-selected', ativo);
        });
        renderGrade();
      });
    });
  }

  /* ---------- Detalhe ---------- */
  var dialogo = $('#detalhe');
  var rolagemAntes = 0;

  function abrirObra(id) {
    var o = obras.find(function (x) { return x.id === id; });
    if (!o) return;

    var imagens = [o.imagem].concat((o.imagens_extras || []).map(function (x) { return typeof x === 'string' ? x : x && x.imagem; })).filter(Boolean);
    var galeria = $('#galeria');
    var pontos = $('#pontos');
    galeria.innerHTML = '';
    pontos.innerHTML = '';
    imagens.forEach(function (src, i) {
      var img = document.createElement('img');
      img.src = src;
      img.alt = o.titulo + (imagens.length > 1 ? ' — imagem ' + (i + 1) : '');
      galeria.appendChild(img);
      if (imagens.length > 1) pontos.appendChild(document.createElement('span'));
    });
    galeria.scrollLeft = 0;
    atualizarPontos();

    var st = STATUS[o.status] || STATUS.disponivel;
    $('#detalhe-titulo').textContent = o.titulo;
    $('#detalhe-preco').textContent = o.status === 'vendida' ? 'Vendida' : preco(o.preco) + (o.status === 'reservada' ? ' · Reservada' : '');

    var ficha = $('#ficha');
    ficha.innerHTML = '';
    [['Técnica', o.tecnica], ['Dimensões', o.dimensoes], ['Ano', o.ano], ['Status', st.rotulo]].forEach(function (par) {
      if (!par[1]) return;
      var dt = document.createElement('dt'); dt.textContent = par[0];
      var dd = document.createElement('dd'); dd.textContent = par[1];
      ficha.appendChild(dt); ficha.appendChild(dd);
    });
    $('#detalhe-desc').textContent = o.descricao || '';

    var comprar = $('#comprar');
    var icone = $('.botao-wpp svg').outerHTML;
    comprar.innerHTML = icone + (o.status === 'vendida' ? 'Encomendar algo parecido' : o.status === 'reservada' ? 'Entrar na fila' : 'Quero esta obra');
    comprar.href = linkWhatsApp(mensagemObra(o));

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
    document.body.classList.remove('travado');
    document.title = (site.nome || 'Valmir Jr') + ' — Obras originais';
    window.scrollTo(0, rolagemAntes);
  }

  function atualizarPontos() {
    var galeria = $('#galeria');
    var i = Math.round(galeria.scrollLeft / (galeria.clientWidth || 1));
    $$('#pontos span').forEach(function (p, j) { p.classList.toggle('ativo', j === i); });
  }

  function lerRota() {
    var m = location.hash.match(/^#obra\/(.+)$/);
    if (m) abrirObra(decodeURIComponent(m[1]));
    else if (dialogo.open) fecharObra();
  }

  function sairDaObra() {
    if (/^#obra\//.test(location.hash)) {
      history.pushState('', document.title, location.pathname + location.search);
    }
    fecharObra();
  }

  $('[data-fechar]').addEventListener('click', sairDaObra);
  dialogo.addEventListener('cancel', function (e) { e.preventDefault(); sairDaObra(); });
  dialogo.addEventListener('click', function (e) { if (e.target === dialogo) sairDaObra(); });
  $('#galeria').addEventListener('scroll', function () { window.requestAnimationFrame(atualizarPontos); }, { passive: true });
  window.addEventListener('hashchange', lerRota);
  window.addEventListener('popstate', lerRota);

  var topo = $('.topo');
  window.addEventListener('scroll', function () { topo.classList.toggle('rolou', window.scrollY > 4); }, { passive: true });

  /* ---------- Início ---------- */
  function carregar(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }

  Promise.all([carregar('/data/site.json'), carregar('/data/obras.json')])
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
          return Object.assign({}, o, { id: id, status: o.status || 'disponivel' });
        });
      preencherSite();
      ligarFiltros();
      renderGrade();
      lerRota();
    })
    .catch(function (err) {
      console.error(err);
      $('#vazio').hidden = false;
      $('#vazio').textContent = 'Não foi possível carregar as obras. Tente recarregar a página.';
    });
})();
