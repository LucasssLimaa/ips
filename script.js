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
    const statusEl = document.getElementById('input_status');
    const descEl = document.getElementById('input_description');
    const amountEl = document.getElementById('input_amount');
    const dateEl = document.getElementById('input_due_date');
    const flowEl = document.getElementById('input_flow');
    const categoryEl = document.getElementById('input_category');

    // Validação básica para garantir que os elementos existem
    if (!descEl || !amountEl || !dateEl || !categoryEl || !flowEl) return;

    // 2. PEGAR OS VALORES (Aqui estava o erro principal)
    const description = descEl.value;
    const amountVal = amountEl.value;
    const dateValue = dateEl.value;
    const status = statusEl.value;
    const flow = flowEl.value;
    const category = categoryEl.value;

    //revisar esta parte
    const isIncome = document.getElementById('input_flow').checked;
    const type = isIncome ? 'income' : 'expense';

    // Validação de preenchimento
    if (!description || !amountVal || !dateValue) {
        alert("Por favor, preencha a descrição, valor e data");
        return;
    }

    // Converter texto para número
    const amount = parseFloat(amountVal);

    // 3. DEFINIR O SINAL
    let displayAmount = "";
    if (flow === "Despesa") {
        displayAmount = "- € " + amount.toFixed(2);
    } else {
        displayAmount = "+ € " + amount.toFixed(2);
    }

    // 4. DEFINIR CLASSES (Corrigido o switch e a variável)
    let boxClass = "";
    let badgeClass = "";
    let statusLabel = status; // Corrigido o nome da variável

    switch (status) {
        case 'Pago':
            boxClass = "box_paid";
            badgeClass = "status_paid";
            break;
        case 'Atrasado':
            boxClass = "box_late";
            badgeClass = "status_late";
            break;
        case 'Pendente':
            boxClass = "box_pending";
            badgeClass = "status_pending";
            break; // Adicionado o break que faltava
        default:
            boxClass = "";
            badgeClass = "";
    }

    // 5. FORMATAR DATA
    const dateObj = new Date(dateValue);
    const dateFormatted = dateObj.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short'
    });

    // 6. CRIAR HTML
    const newTransactionHTML = `<div class="report_box ${boxClass} data-type="${type}">
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
                                <button class="btn_quick_pay" onclick="pay_card(this)">Pagar</button>
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
    descEl.value = '';
    amountEl.value = '';

    changeTab('reports');
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