function changeTab(tabName) {

    const titles = {
        'record': 'Novo Lançamento',
        'reports': 'Meus Relatórios',
        'settings': 'Configurações'
    };

    const backBtn = document.getElementById('back_btn');
    const profileIcon = document.getElementById('profile_icon');
    const headerTittle = document.querySelector('#header h1');
    const valueBoxes = document.getElementById('value_boxes_container');

    document.getElementById('screen_home').classList.add('hidden_screen');
    document.getElementById('screen_record').classList.add('hidden_screen');
    document.getElementById('screen_reports').classList.add('hidden_screen');

    document.getElementById('screen_' + tabName).classList.remove('hidden_screen');

    document.querySelector('#header h1').innerText = titles[tabName];

    if (tabName === 'home') {
        backBtn.style.display = 'none';
        profileIcon.style.display = 'block';
        headerTittle.innerText = 'Escola Rainha';
    } else {
        backBtn.style.display = 'block';
        profileIcon.style.display = 'none';
    }

    if (tabName === 'record') {
        valueBoxes.style.display = 'none';
    } else {
        valueBoxes.style.display = 'flex';
    }

}

function saveTransaction() {
    // 1. PEGAR OS ELEMENTOS
    const description = document.getElementById('input_description')?.value;
    const amountVal = document.getElementById('input_amount')?.value;
    const dateValue = document.getElementById('input_due_date')?.value;
    const flow = document.getElementById('input_flow')?.value;
    const category = document.getElementById('input_category')?.value;
    //revisar esta parte
    const status = document.getElementById('input_status')?.value;

    // Validação de preenchimento
    if (!description || !amountVal || !dateValue) {
        alert("Por favor, preencha todos os capos");
        return;
    }

    const isIncome = flow === "income";
    const type = isIncome ? 'income' : 'expense';
    // Converter texto para número
    const amount = parseFloat(amountVal);
    const userPaid = status === 'yes';

    //calculo das datas
    const today = new Date();
    today.setHours(0,0,0,0);

    const itemDate = new Date(dateValue);

    // 3. DEFINIR O SINAL
    const symbol = isIncome ? "+ € " : "- € ";
    const displayAmount = symbol + amount.toFixed(2);

    // 4. DEFINIR CLASSES (Corrigido o switch e a variável)
    let boxClass = "";
    let badgeClass = "";
    let statusLabel = ""; 

    if(userPaid) {
        boxClass = "box_paid";
        badgeClass = "status_paid";
        statusLabel = isIncome ? "RECEBIDO" : "PAGO"
    } else {
       if (itemDate < today) {
            // Data é passado = Atrasado
            boxClass = "box_late";
            badgeClass = "status_late";
            statusLabel = "ATRASADO";
        } else {
            // Data é futuro = Agendado
            // Se for receita usa azul, despesa usa amarelo
            boxClass = "box_pending"; 
            badgeClass = "status_pending";
            statusLabel = "PENDENTE";
        }
    }

    // 5. FORMATAR DATA
    const dateObj = new Date(dateValue);
    const dateFormatted = dateObj.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short'
    });

    // 6. CRIAR HTML
    const newTransactionHTML = `<div class="report_box ${boxClass}" data-type="${type}">
                        <div class="box_header" onclick="toggleCard(this)">
                            <div class="box_column_left">
                                <p class="text_primary">${description}</p>
                                <p class="text_secondary">${dateFormatted}</p>
                            </div>
                            <div class="box_row_right">
                                <div class="box_column_center">
                                    <p class="text_value">${displayAmount}</p>
                                </div>
                                <div class="box_column_right">
                                    <div class="badge ${badgeClass}">${statusLabel}</div>
                                    <svg class="arrow_icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="box_body">
                            <p><strong>Categoria:</strong> ${category}</p>
                            <div id="buttons_box">
                                <button class="btn_quick_delete" onclick="delete_card(this)">Deletar</button>
                                ${!userPaid ? `<button class="btn_quick_pay" onclick="pay_card(this)">Pagar</button>` : ''}                               
                            </div>
                        </div>
                    </div>`;

    // 7. INSERIR E LIMPAR
    // Passo A: Encontrar o cabeçalho dentro do container
    const listHeader = document.querySelector('.list_header');

    // Passo B: Inserir o novo item DEPOIS (afterend) do cabeçalho
    if (listHeader) {
        // Isso coloca o item logo abaixo do cabeçalho, empurrando os antigos para baixo
        listHeader.insertAdjacentHTML('afterend', newTransactionHTML);
    } else {
        // Segurança: Se por acaso você apagar o cabeçalho um dia, ele insere no topo
        const reportsContainer = document.getElementById('reports_container');
        reportsContainer.insertAdjacentHTML('afterbegin', newTransactionHTML);
    }

    document.getElementById('input_description').value = '';
    document.getElementById('input_amount').value = '';
    document.getElementById('input_due_date').value = '';

    changeTab('reports');

    const correctTabBtn = document.querySelector(`.tab_btn[onclick*="${type}"]`);

    if (correctTabBtn) {
        switchTab(type, correctTabBtn);
    }
    updateTotals();
    updateChart();
}

function toggleCard(selectedElement) {
    const card = selectedElement.closest('.report_box');

    card.classList.toggle('expanded');
}

function delete_card(card_btn) {

    if (!confirm("Tem certeza que deseja excluir este card?")) {
        return
    }

    let card = card_btn.closest('.report_box');

    card.remove();
    updateTotals();
    updateChart();
}

function pay_card(card_btn) {

    // 1. Confirmação
    if (!confirm("Tem certeza que deseja marcar como PAGO?")) {
        return;
    }

    // 2. Pega o card principal
    let card = card_btn.closest('.report_box');

    // 3. LIMPEZA: Remove as classes antigas (Atrasado/Pendente)
    // Se não remover, o vermelho pode continuar ganhando do verde
    card.classList.remove('box_late', 'box_pending');

    // 4. Adiciona a classe de Pago
    card.classList.add('box_paid');

    // --- ATUALIZAÇÃO VISUAL INTERNA ---

    // 5. Atualiza a Etiqueta (Badge) para "PAGO"
    // Usamos querySelector DENTRO do card para achar só a badge deste item
    let badge = card.querySelector('.badge');
    if (badge) {
        badge.innerText = "PAGO";
        // Reseta as classes da badge e põe a verde
        badge.className = "badge status_paid";
    }

    // 6. Esconde o botão de pagar (pois já foi pago)
    card_btn.style.display = 'none';

    // Opcional: Fechar o card automaticamente após pagar
    // card.classList.remove('expanded');
    updateTotals();
    updateChart();
}

function switchTab(type, clickedButton) {
    
    document.querySelectorAll('.tab_btn').forEach(btn => {
        btn.classList.remove('active');
    })

    clickedButton.classList.add('active');

    const allItens = document.querySelectorAll('.report_box');

    allItens.forEach(item => {

        const itemType = item.getAttribute('data-type');

        if(itemType === type) {
            item.style.display = 'flex';
            item.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
            item.style.display = 'none';
        }
    })
}

function updateTotals() {
    let saldoAtual = 0;
    let aReceber = 0;
    let aPagar = 0;

    const allItems = document.querySelectorAll('.report_box');

    allItems.forEach(item => {
        // 1. Limpar valor
        const textVal = item.querySelector('.text_value').innerText;
        let valor = parseFloat(textVal.replace(/[^\d,-]/g, '').replace(',', '.'));
        valor = Math.abs(valor);

        // 2. Pegar Tipo e Texto
        const type = item.getAttribute('data-type'); // 'income' ou 'expense'
        // Pegamos o texto e forçamos maiúsculas para garantir que 'Pago' vira 'PAGO'
        const badgeText = item.querySelector('.badge').innerText.toUpperCase(); 

        // --- A CORREÇÃO ESTÁ AQUI ---

        // CENÁRIO 1: JÁ FOI CONCRETIZADO (A etiqueta diz PAGO)
        if (badgeText === "PAGO") {
            if (type === 'income') {
                saldoAtual += valor; // Dinheiro entrou no caixa
            } else {
                saldoAtual -= valor; // Dinheiro saiu do caixa
            }
        }
        
        // CENÁRIO 2: ESTÁ EM ABERTO (Atrasado, Pendente, Agendado...)
        // Qualquer coisa que não seja "PAGO" cai aqui
        else {
            if (type === 'income') {
                // Ex: "Atrasado" no Faturamento -> Vai para A Receber
                aReceber += valor;
            } else {
                // Ex: "Atrasado" na Despesa -> Vai para A Pagar
                aPagar += valor;
            }
        }
    });

    // 3. Atualizar na Tela
    const formatoPT = { style: 'currency', currency: 'EUR' };

    // Verifica se os elementos existem antes de atualizar
    const elSaldo = document.getElementById('val_balance');
    const elReceber = document.getElementById('val_receivable'); // Sua caixa azul
    const elPagar = document.getElementById('val_payable');      // Sua caixa vermelha

    if(elSaldo) elSaldo.innerText = saldoAtual.toLocaleString('pt-PT', formatoPT);
    if(elReceber) elReceber.innerText = aReceber.toLocaleString('pt-PT', formatoPT);
    if(elPagar) elPagar.innerText = aPagar.toLocaleString('pt-PT', formatoPT);
}

function updateChart() {
    const ctx = document.getElementById('myChart');
    if (!ctx) return;

    // 1. EXTRAIR DADOS DO HTML
    // Pegamos todos os cards e invertemos (do antigo para o novo)
    const cards = Array.from(document.querySelectorAll('.report_box')).reverse();

    let labels = [];
    let dataPoints = [];
    let currentBalance = 0; // Começa do zero e vai acumulando

    // Se quiser que o gráfico comece num dia específico, adicione lógica aqui
    // Por agora, ele reconstrói a história desde o primeiro lançamento
    
    cards.forEach(card => {
        // Pega Data
        const dateText = card.querySelector('.text_secondary').innerText.split(',')[0];
        
        // Pega Valor
        const valText = card.querySelector('.text_value').innerText;
        let val = parseFloat(valText.replace(/[^\d,-]/g, '').replace(',', '.'));
        val = Math.abs(val);

        // Pega Tipo
        const type = card.getAttribute('data-type');
        
        // --- A GRANDE MUDANÇA ESTÁ AQUI ---
        // Removemos o IF que bloqueava os pendentes.
        // Agora somamos TUDO, seja pago ou agendado.
        
        if (type === 'income') {
            currentBalance += val;
        } else {
            currentBalance -= val;
        }

        labels.push(dateText);
        dataPoints.push(currentBalance);
    });

    // 2. CONFIGURAR O GRÁFICO
    if (financeChart) {
        financeChart.destroy();
    }

    financeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Fluxo Projetado', // Mudei o nome para Projetado
                data: dataPoints,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return "Saldo: € " + context.raw.toLocaleString('pt-PT', {minimumFractionDigits: 2});
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: { 
                    beginAtZero: false, // Permite mostrar saldo negativo se houver
                    grid: { color: '#f1f5f9' }
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateTotals();
});
// Variável global para guardar o gráfico (para podermos atualizar depois)
let financeChart = null;

document.addEventListener("DOMContentLoaded", () => {
    updateTotals();
    updateChart(); // <--- Adicione aqui
});
