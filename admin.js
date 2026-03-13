// ===================================================
// ADMIN JS — Autenticação com hash SHA-256
// ===================================================

// Credenciais padrão armazenadas como hash SHA-256
// Usuário: admin   → hash abaixo
// Senha:   admin123 → hash abaixo
// Para gerar novo hash: SHA256("suasenha")
const ADMIN_HASH_PADRAO = {
    usuario: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // "admin"
    senha:   "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"  // "admin123"
};

// ===================================================
// FUNÇÃO DE HASH (Web Crypto API — nativa do browser)
// ===================================================
async function sha256(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===================================================
// OBTER CREDENCIAIS SALVAS (sempre em hash)
// ===================================================
function getAdminCred() {
    return JSON.parse(localStorage.getItem('pjl_admin') || 'null') || ADMIN_HASH_PADRAO;
}

function salvarAdminLS(cred) {
    localStorage.setItem('pjl_admin', JSON.stringify(cred));
}

// ===================================================
// LOGIN / LOGOUT
// ===================================================
function abrirLoginAdmin() {
    document.getElementById('adminLoginOverlay').classList.add('active');
    document.getElementById('loginUsuario').value = '';
    document.getElementById('loginSenha').value = '';
    document.getElementById('loginErro').style.display = 'none';
    setTimeout(() => document.getElementById('loginUsuario').focus(), 100);
}

function fecharLoginAdmin() {
    document.getElementById('adminLoginOverlay').classList.remove('active');
}

async function fazerLogin() {
    const u = document.getElementById('loginUsuario').value.trim();
    const s = document.getElementById('loginSenha').value;
    if (!u || !s) return;

    const hashU = await sha256(u);
    const hashS = await sha256(s);
    const cred = getAdminCred();

    if (hashU === cred.usuario && hashS === cred.senha) {
        fecharLoginAdmin();
        document.getElementById('adminPanel').classList.add('active');
        document.body.style.overflow = 'hidden';
        trocarPagina('dashboard');
        mostrarToast('Bem-vindo ao Admin! ✅', 'success');
    } else {
        document.getElementById('loginErro').style.display = 'block';
        document.getElementById('loginSenha').value = '';
        document.getElementById('loginSenha').focus();
    }
}

function sairAdmin() {
    document.getElementById('adminPanel').classList.remove('active');
    document.body.style.overflow = '';
    mostrarToast('Saiu do painel admin', 'info');
}

// ===================================================
// NAVEGAÇÃO ENTRE PÁGINAS ADMIN
// ===================================================
function trocarPagina(pagina) {
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));

    const pageEl = document.getElementById(`page-${pagina}`);
    if (pageEl) pageEl.classList.add('active');
    const navEl = document.querySelector(`[data-page="${pagina}"]`);
    if (navEl) navEl.classList.add('active');

    if (pagina === 'dashboard')     renderizarDashboard();
    if (pagina === 'produtos')      renderizarTabelaAdmin();
    if (pagina === 'configuracoes') carregarConfiguracoes();
    if (pagina === 'seguranca')     limparFormSeguranca();
    if (pagina === 'novo-produto' && produtoEditandoId === null) limparFormProduto();
}

function limparFormSeguranca() {
    ['novoUsuario','novaSenha','confirmarSenha','senhaAtual'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

// ===================================================
// DASHBOARD
// ===================================================
function renderizarDashboard() {
    const d = getDados();
    const total = d.produtos.length;
    const categorias = [...new Set(d.produtos.map(p => p.categoria))].length;
    const comImagem = d.produtos.filter(p => p.imagem).length;
    const semEstoque = d.produtos.filter(p => !p.estoque).length;

    document.getElementById('dashStats').innerHTML = `
        <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-box"></i></div><div class="stat-info"><h3>${total}</h3><p>Total de Produtos</p></div></div>
        <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-th-large"></i></div><div class="stat-info"><h3>${categorias}</h3><p>Categorias</p></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fas fa-image"></i></div><div class="stat-info"><h3>${comImagem}</h3><p>Com Imagem</p></div></div>
        <div class="stat-card"><div class="stat-icon pink"><i class="fas fa-exclamation-triangle"></i></div><div class="stat-info"><h3>${semEstoque}</h3><p>Sem Estoque</p></div></div>
    `;

    const recentes = [...d.produtos].slice(-5).reverse();
    document.getElementById('tabelaRecentes').innerHTML = `
        <thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Ações</th></tr></thead>
        <tbody>${recentes.map(p => `
            <tr>
                <td>${p.nome}</td>
                <td><span class="badge-cat">${p.categoria}</span></td>
                <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
                <td><div class="td-acoes">
                    <button class="btn-admin warning" onclick="editarProduto(${p.id});trocarPagina('novo-produto')"><i class="fas fa-edit"></i></button>
                    <button class="btn-admin danger" onclick="confirmarExclusao(${p.id})"><i class="fas fa-trash"></i></button>
                </div></td>
            </tr>`).join('')}
        </tbody>
    `;
}

// ===================================================
// TABELA DE PRODUTOS ADMIN
// ===================================================
function renderizarTabelaAdmin(filtro = '') {
    const d = getDados();
    const lista = filtro
        ? d.produtos.filter(p => p.nome.toLowerCase().includes(filtro.toLowerCase()) || p.categoria.toLowerCase().includes(filtro.toLowerCase()))
        : d.produtos;

    document.getElementById('totalProdutosAdmin').textContent = lista.length;
    document.getElementById('tabelaProdutosAdmin').innerHTML = lista.map(p => `
        <tr>
            <td>${p.imagem
                ? `<img src="${p.imagem}" class="prod-thumb" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="prod-thumb-placeholder" style="display:none"><i class="fas fa-mobile-alt"></i></div>`
                : `<div class="prod-thumb-placeholder"><i class="fas fa-mobile-alt"></i></div>`}</td>
            <td><strong>${p.nome}</strong><br><small style="color:var(--texto-cinza)">${p.descricao.substring(0,40)}...</small></td>
            <td>R$ ${parseFloat(p.preco).toFixed(2)}${p.precoOriginal ? `<br><small style="text-decoration:line-through;color:var(--texto-cinza)">R$ ${parseFloat(p.precoOriginal).toFixed(2)}</small>` : ''}</td>
            <td><span class="badge-cat">${p.categoria}</span></td>
            <td>${p.badge
                ? `<span style="font-size:0.75rem;background:rgba(255,0,110,0.2);color:var(--magenta);padding:0.2rem 0.6rem;border-radius:50px;border:1px solid rgba(255,0,110,0.3);">${p.badge}</span>`
                : '<span style="color:var(--texto-cinza);font-size:0.8rem;">—</span>'}</td>
            <td>${p.estoque
                ? '<span style="color:var(--verde-whats);font-size:0.8rem;"><i class="fas fa-check-circle"></i> Sim</span>'
                : '<span style="color:#ff4444;font-size:0.8rem;"><i class="fas fa-times-circle"></i> Não</span>'}</td>
            <td><div class="td-acoes">
                <button class="btn-admin warning" onclick="editarProduto(${p.id});trocarPagina('novo-produto')" title="Editar"><i class="fas fa-edit"></i> Editar</button>
                <button class="btn-admin danger" onclick="confirmarExclusao(${p.id})" title="Excluir"><i class="fas fa-trash"></i></button>
            </div></td>
        </tr>`).join('');
}

function filtrarProdutosAdmin(v) { renderizarTabelaAdmin(v); }

// ===================================================
// FORMULÁRIO DE PRODUTO
// ===================================================
let produtoEditandoId = null;

function limparFormProduto() {
    produtoEditandoId = null;
    document.getElementById('produtoEditandoId').value = '';
    ['formNome','formCategoria','formDescricao','formPreco','formPrecoOriginal','formBadge','formImagem'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('formEstoque').checked = true;
    document.getElementById('imgPreviewBox').innerHTML = `<div class="img-preview-placeholder"><i class="fas fa-image"></i><span>Preview da imagem aparecerá aqui</span></div>`;
    document.getElementById('tituloPaginaProduto').textContent = '➕ Novo Produto';
    document.getElementById('subtituloPaginaProduto').textContent = 'Preencha as informações do produto';
    document.getElementById('breadcrumbForm').textContent = 'Novo Produto';
}

function editarProduto(id) {
    const d = getDados();
    const p = d.produtos.find(x => x.id === id);
    if (!p) return;
    produtoEditandoId = id;
    document.getElementById('produtoEditandoId').value = id;
    document.getElementById('formNome').value = p.nome;
    document.getElementById('formCategoria').value = p.categoria;
    document.getElementById('formDescricao').value = p.descricao;
    document.getElementById('formPreco').value = p.preco;
    document.getElementById('formPrecoOriginal').value = p.precoOriginal || '';
    document.getElementById('formBadge').value = p.badge || '';
    document.getElementById('formImagem').value = p.imagem || '';
    document.getElementById('formEstoque').checked = p.estoque;
    previewImagem(p.imagem);
    document.getElementById('tituloPaginaProduto').textContent = '✏️ Editar Produto';
    document.getElementById('subtituloPaginaProduto').textContent = `Editando: ${p.nome}`;
    document.getElementById('breadcrumbForm').textContent = 'Editar Produto';
}

function previewImagem(url) {
    const box = document.getElementById('imgPreviewBox');
    if (url && url.trim()) {
        box.innerHTML = `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<div class=\\'img-preview-placeholder\\'><i class=\\'fas fa-exclamation-triangle\\'></i><span>URL inválida</span></div>'">`;
    } else {
        box.innerHTML = `<div class="img-preview-placeholder"><i class="fas fa-image"></i><span>Preview da imagem aparecerá aqui</span></div>`;
    }
}

function salvarProduto() {
    const nome     = document.getElementById('formNome').value.trim();
    const categoria = document.getElementById('formCategoria').value;
    const descricao = document.getElementById('formDescricao').value.trim();
    const preco     = parseFloat(document.getElementById('formPreco').value);
    const precoOriginalRaw = document.getElementById('formPrecoOriginal').value;
    const precoOriginal = precoOriginalRaw ? parseFloat(precoOriginalRaw) : null;
    const badge    = document.getElementById('formBadge').value || null;
    const imagem   = document.getElementById('formImagem').value.trim() || null;
    const estoque  = document.getElementById('formEstoque').checked;

    if (!nome)               { mostrarToast('Preencha o nome do produto!', 'error'); return; }
    if (!categoria)          { mostrarToast('Selecione a categoria!', 'error'); return; }
    if (!preco || preco <= 0){ mostrarToast('Informe um preço válido!', 'error'); return; }

    const d = getDados();
    const editId = document.getElementById('produtoEditandoId').value;

    if (editId) {
        const idx = d.produtos.findIndex(p => p.id == editId);
        if (idx !== -1) {
            d.produtos[idx] = { ...d.produtos[idx], nome, categoria, descricao, preco, precoOriginal, badge, imagem, estoque };
            mostrarToast('Produto atualizado com sucesso! ✅', 'success');
        }
    } else {
        const novoId = d.produtos.length > 0 ? Math.max(...d.produtos.map(p => p.id)) + 1 : 1;
        d.produtos.push({ id: novoId, nome, categoria, descricao, preco, precoOriginal, badge, imagem, estoque });
        mostrarToast('Produto adicionado com sucesso! ✅', 'success');
    }

    salvarProdutosLS(d.produtos);
    recarregarProdutosSite();
    limparFormProduto();
    setTimeout(() => trocarPagina('produtos'), 800);
}

function confirmarExclusao(id) {
    const d = getDados();
    const p = d.produtos.find(x => x.id === id);
    abrirConfirm(`Excluir "${p.nome}"?`, 'Essa ação não pode ser desfeita.', '🗑️', () => {
        const idx = d.produtos.findIndex(x => x.id === id);
        d.produtos.splice(idx, 1);
        salvarProdutosLS(d.produtos);
        recarregarProdutosSite();
        renderizarTabelaAdmin();
        renderizarDashboard();
        mostrarToast('Produto excluído!', 'info');
    });
}

// ===================================================
// CONFIGURAÇÕES
// ===================================================
function carregarConfiguracoes() {
    const d = getDados();
    document.getElementById('configWhatsapp').value   = d.config.whatsapp;
    document.getElementById('configHorario').value    = d.config.horarioAtendimento;
    document.getElementById('configInstagram').value  = d.config.instagram;
    document.getElementById('configNomeLoja').value   = d.config.nomeLoja;
    document.getElementById('configPixDesconto').value = d.config.pixDesconto;
    document.getElementById('configParcelas').value   = d.config.parcelas;
}

function salvarConfiguracoes() {
    const whatsapp = document.getElementById('configWhatsapp').value.trim().replace(/\D/g, '');
    if (!whatsapp || whatsapp.length < 10) { mostrarToast('Número do WhatsApp inválido!', 'error'); return; }

    const novaConfig = {
        whatsapp,
        horarioAtendimento: document.getElementById('configHorario').value.trim(),
        instagram:  document.getElementById('configInstagram').value.trim(),
        nomeLoja:   document.getElementById('configNomeLoja').value.trim(),
        pixDesconto: parseInt(document.getElementById('configPixDesconto').value) || 5,
        parcelas:   parseInt(document.getElementById('configParcelas').value) || 12,
    };

    salvarConfigLS(novaConfig);
    // Atualiza CONFIG global do main.js
    if (typeof atualizarInformacoesContato === 'function') {
        const d = getDados();
        CONFIG = d.config;
        atualizarInformacoesContato();
    }
    mostrarToast('Configurações salvas com sucesso! ✅', 'success');
}

// ===================================================
// SEGURANÇA — ALTERAR CREDENCIAIS (salva em hash)
// ===================================================
async function alterarCredenciais() {
    const novoU    = document.getElementById('novoUsuario').value.trim();
    const novaS    = document.getElementById('novaSenha').value;
    const confirmS = document.getElementById('confirmarSenha').value;
    const senhaAtu = document.getElementById('senhaAtual').value;

    const cred = getAdminCred();
    const hashAtual = await sha256(senhaAtu);

    if (hashAtual !== cred.senha)    { mostrarToast('Senha atual incorreta!', 'error'); return; }
    if (!novoU || novoU.length < 3)  { mostrarToast('Usuário deve ter pelo menos 3 caracteres!', 'error'); return; }
    if (!novaS || novaS.length < 6)  { mostrarToast('Senha deve ter pelo menos 6 caracteres!', 'error'); return; }
    if (novaS !== confirmS)          { mostrarToast('As senhas não coincidem!', 'error'); return; }

    const hashNovoU = await sha256(novoU);
    const hashNovaS = await sha256(novaS);
    salvarAdminLS({ usuario: hashNovoU, senha: hashNovaS });
    limparFormSeguranca();
    mostrarToast('Credenciais alteradas com sucesso! 🔒', 'success');
}

// ===================================================
// EXPORTAR / IMPORTAR
// ===================================================
function exportarDados() {
    const d = getDados();
    // Não exporta as credenciais admin por segurança
    const exportar = { produtos: d.produtos, config: d.config };
    const blob = new Blob([JSON.stringify(exportar, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `partsjl_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    mostrarToast('Dados exportados com sucesso! 📥', 'success');
}

function importarDados(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const dados = JSON.parse(e.target.result);
            if (dados.produtos) salvarProdutosLS(dados.produtos);
            if (dados.config)   salvarConfigLS(dados.config);
            const d = getDados();
            if (typeof recarregarProdutosSite === 'function') recarregarProdutosSite();
            if (typeof atualizarInformacoesContato === 'function') {
                CONFIG = d.config;
                atualizarInformacoesContato();
            }
            mostrarToast('Dados importados com sucesso! 📤', 'success');
        } catch {
            mostrarToast('Arquivo JSON inválido!', 'error');
        }
    };
    reader.readAsText(file);
    input.value = '';
}

function confirmarResetDados() {
    abrirConfirm('Resetar para padrão?', 'Todos os produtos e configurações voltarão ao estado original.', '⚠️', () => {
        localStorage.removeItem('pjl_produtos');
        localStorage.removeItem('pjl_config');
        if (typeof recarregarProdutosSite === 'function') recarregarProdutosSite();
        if (typeof atualizarInformacoesContato === 'function') {
            const d = getDados();
            CONFIG = d.config;
            atualizarInformacoesContato();
        }
        trocarPagina('dashboard');
        mostrarToast('Dados resetados para o padrão!', 'info');
    });
}

// ===================================================
// TOAST NOTIFICATION
// ===================================================
let toastTimeout;
function mostrarToast(msg, tipo = 'success') {
    const t = document.getElementById('adminToast');
    clearTimeout(toastTimeout);
    t.className = `admin-toast ${tipo}`;
    t.innerHTML = `<i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${msg}`;
    t.classList.add('show');
    toastTimeout = setTimeout(() => t.classList.remove('show'), 3500);
}

// ===================================================
// MODAL DE CONFIRMAÇÃO
// ===================================================
let confirmCallback = null;
function abrirConfirm(titulo, msg, icon, callback) {
    document.getElementById('confirmTitle').textContent = titulo;
    document.getElementById('confirmMsg').textContent = msg;
    document.getElementById('confirmIcon').textContent = icon;
    confirmCallback = callback;
    document.getElementById('confirmModal').classList.add('active');
}
function fecharConfirm() {
    document.getElementById('confirmModal').classList.remove('active');
    confirmCallback = null;
}

// ===================================================
// INICIALIZAÇÃO DO ADMIN
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
    // Login - Enter
    document.getElementById('loginSenha').addEventListener('keypress', e => { if (e.key === 'Enter') fazerLogin(); });
    document.getElementById('loginUsuario').addEventListener('keypress', e => { if (e.key === 'Enter') document.getElementById('loginSenha').focus(); });
    document.getElementById('btnFazerLogin').addEventListener('click', fazerLogin);

    // Fechar login ao clicar fora
    document.getElementById('adminLoginOverlay').addEventListener('click', e => {
        if (e.target.id === 'adminLoginOverlay') fecharLoginAdmin();
    });

    // Confirmar modal
    document.getElementById('confirmYes').addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        fecharConfirm();
    });
    document.getElementById('confirmModal').addEventListener('click', e => {
        if (e.target.id === 'confirmModal') fecharConfirm();
    });
});
