// ===================================================
// DADOS PADRÃO (produtos iniciais)
// ===================================================
const PRODUTOS_PADRAO = [
    { id:1, nome:"Tela iPhone 13 Pro - OLED", preco:189.90, precoOriginal:249.90, categoria:"telas", imagem:null, descricao:"Display OLED completo com touch", badge:"MAIS VENDIDO", estoque:true },
    { id:2, nome:"Tela iPhone 12 - Original", preco:169.90, precoOriginal:229.90, categoria:"telas", imagem:null, descricao:"Tela original Apple com garantia", badge:"OFERTA", estoque:true },
    { id:3, nome:"Tela Samsung S21 - AMOLED", preco:199.90, precoOriginal:null, categoria:"telas", imagem:null, descricao:"Display AMOLED de alta qualidade", badge:null, estoque:true },
    { id:4, nome:"Tela Motorola G30 - Incell", preco:89.90, precoOriginal:129.90, categoria:"telas", imagem:null, descricao:"Tela Incell com excelente custo-benefício", badge:"PROMOÇÃO", estoque:true },
    { id:5, nome:"Tela iPhone 11 - LCD", preco:149.90, precoOriginal:null, categoria:"telas", imagem:null, descricao:"Display LCD de qualidade premium", badge:null, estoque:true },
    { id:6, nome:"Bateria iPhone 12 - Original", preco:79.90, precoOriginal:99.90, categoria:"baterias", imagem:null, descricao:"Bateria original com alta durabilidade", badge:"MAIS VENDIDO", estoque:true },
    { id:7, nome:"Bateria Samsung A52 - 4500mAh", preco:69.90, precoOriginal:null, categoria:"baterias", imagem:null, descricao:"Bateria de longa duração", badge:null, estoque:true },
    { id:8, nome:"Flex Conector Lightning iPhone", preco:39.90, precoOriginal:59.90, categoria:"conectores", imagem:null, descricao:"Conector de carga original", badge:"OFERTA", estoque:true },
    { id:9, nome:"Flex USB-C Samsung Galaxy", preco:34.90, precoOriginal:null, categoria:"conectores", imagem:null, descricao:"Conector USB-C para Samsung", badge:null, estoque:true },
    { id:10, nome:"Tampa Traseira iPhone 13 Pro Max", preco:129.90, precoOriginal:169.90, categoria:"tampas", imagem:null, descricao:"Tampa traseira original em vidro", badge:"NOVO", estoque:true },
    { id:11, nome:"Kit Ferramentas Abertura - 32 Peças", preco:49.90, precoOriginal:null, categoria:"ferramentas", imagem:null, descricao:"Kit completo para manutenção", badge:"ESSENCIAL", estoque:true },
    { id:12, nome:"Cabo USB-C para Lightning - 1m", preco:29.90, precoOriginal:49.90, categoria:"cabos", imagem:null, descricao:"Cabo de carregamento rápido", badge:"OFERTA", estoque:true },
    { id:13, nome:"Fone de Ouvido Type-C - Original", preco:39.90, precoOriginal:null, categoria:"cabos", imagem:null, descricao:"Fone com microfone e controle de volume", badge:null, estoque:true },
    { id:14, nome:"Película 3D iPhone 13 Pro", preco:19.90, precoOriginal:null, categoria:"acessorios", imagem:null, descricao:"Proteção completa para a tela", badge:null, estoque:true },
    { id:15, nome:"Capinha Magnética iPhone 14", preco:59.90, precoOriginal:89.90, categoria:"acessorios", imagem:null, descricao:"Capa compatível com MagSafe", badge:"LANÇAMENTO", estoque:true }
];

const CONFIG_PADRAO = {
    nomeLoja: "Parts J&L",
    whatsapp: "5511999999999",
    instagram: "@partsjel",
    horarioAtendimento: "Seg-Sex: 8h às 18h | Sáb: 8h às 13h",
    pixDesconto: 5,
    parcelas: 12,
};

// ===================================================
// GERENCIAMENTO DE DADOS (localStorage)
// ===================================================
function getDados() {
    return {
        produtos: JSON.parse(localStorage.getItem('pjl_produtos') || 'null') || [...PRODUTOS_PADRAO],
        config: JSON.parse(localStorage.getItem('pjl_config') || 'null') || {...CONFIG_PADRAO},
        admin: JSON.parse(localStorage.getItem('pjl_admin') || 'null') || null,
    };
}

function salvarProdutosLS(lista) { localStorage.setItem('pjl_produtos', JSON.stringify(lista)); }
function salvarConfigLS(cfg)     { localStorage.setItem('pjl_config',   JSON.stringify(cfg));  }

// ===================================================
// VARIÁVEIS GLOBAIS
// ===================================================
let { produtos, config: CONFIG } = getDados();
let produtosFiltrados = [...produtos];
let categoriaAtual = 'todas';

// ===================================================
// RENDERIZAÇÃO DE PRODUTOS
// ===================================================
function renderizarProdutos() {
    const grid = document.getElementById('produtosGrid');
    const count = document.getElementById('produtosCount');
    const mensagemVazio = document.getElementById('mensagemVazio');
    grid.innerHTML = '';

    if (produtosFiltrados.length === 0) {
        mensagemVazio.style.display = 'block';
        grid.style.display = 'none';
        count.textContent = '0 produtos';
        return;
    }

    mensagemVazio.style.display = 'none';
    grid.style.display = 'grid';
    count.textContent = `${produtosFiltrados.length} produto${produtosFiltrados.length !== 1 ? 's' : ''}`;

    produtosFiltrados.forEach((produto, index) => {
        const card = document.createElement('div');
        card.className = 'produto-card';
        card.style.animationDelay = `${index * 0.05}s`;

        const badgeHTML = produto.badge ? `<div class="produto-badge">${produto.badge}</div>` : '';
        const imagemHTML = produto.imagem
            ? `<img src="${produto.imagem}" alt="${produto.nome}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><i class="fas fa-mobile-alt produto-placeholder" style="display:none;"></i>`
            : `<i class="fas fa-mobile-alt produto-placeholder"></i>`;
        const precoOriginalHTML = produto.precoOriginal
            ? `<div class="preco-original">De R$ ${parseFloat(produto.precoOriginal).toFixed(2)}</div>`
            : '';

        card.innerHTML = `
            ${badgeHTML}
            <div class="produto-imagem">${imagemHTML}</div>
            <div class="produto-info">
                <h3 class="produto-nome">${produto.nome}</h3>
                <p class="produto-descricao">${produto.descricao}</p>
                <div class="produto-precos">${precoOriginalHTML}<div class="preco-atual">R$ ${parseFloat(produto.preco).toFixed(2)}</div></div>
                <div class="produto-acoes">
                    <button class="btn-comprar" onclick="comprarViaWhatsApp(${produto.id})"><i class="fab fa-whatsapp"></i> COMPRAR</button>
                    <button class="btn-detalhes" onclick="abrirModal(${produto.id})"><i class="fas fa-info-circle"></i></button>
                </div>
            </div>`;
        grid.appendChild(card);
    });
}

function filtrarPorCategoria(categoria) {
    categoriaAtual = categoria;
    aplicarFiltros();
    document.querySelectorAll('.categoria-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`[data-categoria="${categoria}"]`).classList.add('active');
    document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
}

function buscarProdutos(termo) { aplicarFiltros(termo); }

function aplicarFiltros(termoBusca = '') {
    produtosFiltrados = produtos.filter(produto => {
        const matchCategoria = categoriaAtual === 'todas' || produto.categoria === categoriaAtual;
        const matchBusca = termoBusca === '' ||
            produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
            produto.descricao.toLowerCase().includes(termoBusca.toLowerCase());
        return matchCategoria && matchBusca;
    });
    renderizarProdutos();
}

// ===================================================
// WHATSAPP
// ===================================================
function comprarViaWhatsApp(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    const mensagem = `Olá! Tenho interesse no produto:\n\n*${produto.nome}*\nR$ ${parseFloat(produto.preco).toFixed(2)}\n\nGostaria de mais informações!`;
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`, '_blank');
}

// ===================================================
// MODAL DE PRODUTO
// ===================================================
function abrirModal(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    document.getElementById('modalNome').textContent = produto.nome;
    document.getElementById('modalDescricao').textContent = produto.descricao;
    document.getElementById('modalPreco').textContent = `R$ ${parseFloat(produto.preco).toFixed(2)}`;
    const mi = document.getElementById('modalImagem');
    mi.innerHTML = produto.imagem
        ? `<img src="${produto.imagem}" alt="${produto.nome}" onerror="this.style.display='none'">`
        : '<i class="fas fa-mobile-alt produto-placeholder"></i>';
    document.getElementById('modalComprar').onclick = () => comprarViaWhatsApp(produtoId);
    document.getElementById('modalProduto').classList.add('active');
}

function fecharModal() { document.getElementById('modalProduto').classList.remove('active'); }

// ===================================================
// PARTÍCULAS HERO
// ===================================================
function criarParticulas() {
    const container = document.getElementById('particlesContainer');
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.width = Math.random() * 5 + 2 + 'px';
        p.style.height = p.style.width;
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 10 + 's';
        p.style.animationDuration = (Math.random() * 10 + 5) + 's';
        container.appendChild(p);
    }
}

// ===================================================
// ATUALIZAR INFORMAÇÕES DE CONTATO
// ===================================================
function atualizarInformacoesContato() {
    const num = CONFIG.whatsapp.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
    document.getElementById('numeroWhatsDisplay').innerHTML = `📱 ${num}`;
    document.getElementById('horarioDisplay').textContent = CONFIG.horarioAtendimento;
    document.getElementById('instagramDisplay').textContent = CONFIG.instagram;
    const url = `https://wa.me/${CONFIG.whatsapp}`;
    document.getElementById('btnWhatsHeader').href = url;
    document.getElementById('btnWhatsGrande').href = url;
    document.getElementById('socialWhats').href = url;
    document.getElementById('whatsFloat').onclick = () => window.open(url, '_blank');
}

// ===================================================
// RECARREGAR PRODUTOS DO SITE (chamado pelo admin)
// ===================================================
function recarregarProdutosSite() {
    const d = getDados();
    produtos = d.produtos;
    aplicarFiltros(document.getElementById('campoBusca').value);
}

// ===================================================
// EVENT LISTENERS
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
    const d = getDados();
    produtos = d.produtos;
    CONFIG = d.config;

    renderizarProdutos();
    criarParticulas();
    atualizarInformacoesContato();

    // Categorias
    document.querySelectorAll('.categoria-item').forEach(item => {
        item.addEventListener('click', () => filtrarPorCategoria(item.dataset.categoria));
    });

    // Categorias footer
    document.querySelectorAll('.footer-links a[data-categoria]').forEach(link => {
        link.addEventListener('click', (e) => { e.preventDefault(); filtrarPorCategoria(link.dataset.categoria); });
    });

    // Busca
    document.getElementById('campoBusca').addEventListener('input', e => buscarProdutos(e.target.value));

    // Modal produto
    document.getElementById('modalClose').addEventListener('click', fecharModal);
    document.getElementById('modalProduto').addEventListener('click', e => { if (e.target.id === 'modalProduto') fecharModal(); });

    // Botão admin no header
    document.getElementById('btnAbrirAdmin').addEventListener('click', e => { e.preventDefault(); abrirLoginAdmin(); });

    // Scroll suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && !this.dataset.categoria && !this.id) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
