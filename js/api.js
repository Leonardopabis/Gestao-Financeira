// Criar estrutura html da transaçãox
const criarItemHtml = (descricao, categoria, tipo, valor, data, receita, id) => {
    const classeTipo = receita ? 'income' : 'expense'
    const classeValor = receita ? 'income-value' : 'expense-value'
    const sinalValor = receita ? '' : '- '
    const dataFormatada = formartarData(data)
    let imagem = ''
    let descricaoImagem = ''
    let categoriaFormatada = categoria.toLowerCase()
    if (categoriaFormatada === 'trabalho') {
        imagem = './img/filter-cifrao.png'
        descricaoImagem = 'ícone de cifrão para a categoria trabalho'
    } else if (categoriaFormatada === 'saúde') {
        imagem = './img/categoria-saude.png'
        descricaoImagem = 'ícode de um halter para a categoria saude'
    } else if (categoriaFormatada === 'transporte') {
        imagem = './img/categoria-transporte.png'
        descricaoImagem = 'ícode de um carro para a categoria transporte'
    } else if (categoriaFormatada === 'alimentação') {
        imagem = './img/categoria-alimentacao.png'
        descricaoImagem = 'ícone de um carrinho de compras para a categoria alimentação'
    }
    return `
                            <tr>
                                <td>
                                    <div class="transaction-description">
                                        <img src='${imagem}' alt='${descricaoImagem}'>
                                        <span>${descricao}</span>
                                    </div>
                                </td>

                                <td>
                                    <span class="category-badge">
                                        ${categoria}
                                    </span>
                                </td>

                                <td>
                                    <span class="transaction-type ${classeTipo}">
                                        ${tipo}
                                    </span>
                                </td>

                                <td class="transaction-value ${classeValor}">
                                    ${sinalValor}R$ ${valor}
                                </td>

                                <td>
                                    <time>
                                        ${dataFormatada}
                                    </time>
                                </td>

                                <td>
                                    <div class="transaction-actions">
                                        <button type="button" class="action-button edit-button" row-id="${id}" aria-label="Editar transação">
                                            <i class="fa-solid fa-pen"></i>
                                        </button>

                                        <button type="button" class="action-button delete-button" row-id="${id}" aria-label="Excluir transação">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
`
}

// Carregar dados do sql na lista
let todasAsTransacoes = []

async function carregarTransacoes() {

    try {

        let hoje = new Date().toISOString().split('T')[0]
        document.querySelector('#transaction-date').value = hoje
        document.querySelector('#data-header').value = hoje
        
        const resposta = await fetch('http://localhost:3000/api/get-transactions')

        if (!resposta.ok) {
            throw new Error(`Erro http: ${resposta.status}`)
        }

        todasAsTransacoes = await resposta.json()
        aplicarFiltros()

    } catch (erro) {
        console.error('Erro ao buscar dados', erro)
    }
}

function transformarDataEmObjeto(dataISO) {
    const [ano, mes, dia] = dataISO.split('T')[0].split('-').map(Number)
    return new Date(ano, mes-1, dia)
}

function verificarPeriodo(dataTransacao, periodoSelecionado) {
    const hoje = new Date()

    const dataHoje = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
    )

    if (periodoSelecionado === 'all') {
        return true
    }

    if (periodoSelecionado === 'filter-today') {
        return (
            dataTransacao.getDate() === dataHoje.getDate() &&
            dataTransacao.getMonth() === dataHoje.getMonth() &&
            dataTransacao.getFullYear() === dataHoje.getFullYear()
        )
    }

    if (periodoSelecionado === 'filter-this-week') {
        const inicioSemana = new Date(dataHoje)

        const diaDaSemana = dataHoje.getDay()
        const diferenca = diaDaSemana === 0 ? -6 : 1 - diaDaSemana

        inicioSemana.setDate(dataHoje.getDate() + diferenca)

        const finalSemana = new Date(inicioSemana)
        finalSemana.setDate(inicioSemana.getDate() + 7)

        return (
            dataTransacao >= inicioSemana &&
            dataTransacao < finalSemana
        )
    }

    if (periodoSelecionado === 'filter-this-month') {
        return (
            dataTransacao.getMonth() === dataHoje.getMonth() &&
            dataTransacao.getFullYear() === dataHoje.getFullYear()
        )
    }

    if (periodoSelecionado === 'filter-this-trimester') {
        const tresMesesAtras = new Date(dataHoje)
        tresMesesAtras.setMonth(dataHoje.getMonth() - 3)

        return dataTransacao >= tresMesesAtras
    }

    if (periodoSelecionado === 'filter-this-semester') {
        const seisMesesAtras = new Date(dataHoje)
        seisMesesAtras.setMonth(dataHoje.getMonth() - 6)

        return dataTransacao >= seisMesesAtras
    }

    if (periodoSelecionado === 'filter-this-year') {
        const umAnoAtras = new Date(dataHoje)
        umAnoAtras.setFullYear(dataHoje.getFullYear() - 1)

        return dataTransacao >= umAnoAtras
    }

    return true
}

function aplicarFiltros() {
    const busca = document.querySelector('#search').value.trim().toLowerCase()
    const categoriaSelecionada = document.querySelector('#filter-categories').value.toLowerCase()
    const tipoSelecionado = document.querySelector('#filter-types').value
    const periodoSelecionado = document.querySelector('#filter-period').value

    const transacoesFiltradas = todasAsTransacoes.filter((transacao) => {
        const descricao = transacao.descricao.trim().toLowerCase()
        const categoria = transacao.categoria.trim().toLowerCase()
        const tipo = transacao.tipo.trim().toLowerCase()
        const dataTransacao = transformarDataEmObjeto(transacao.data)

        const correspondeBusca = 
            busca === '' ||
            descricao.includes(busca)
            
        const correspondeCategoria = 
            categoriaSelecionada === 'all' ||
            categoria === categoriaSelecionada

        const correspondeTipo = 
            tipoSelecionado === 'all' ||
            (
                tipoSelecionado === 'filter-income' &&
                tipo === 'receita'
            ) ||
            (
                tipoSelecionado === 'filter-outcome' &&
                tipo === 'despesa'
            )

        const correspondePeriodo = verificarPeriodo(
            dataTransacao, periodoSelecionado
        )

        return (
            correspondeBusca &&
            correspondeCategoria &&
            correspondeTipo &&
            correspondePeriodo
        )
    })

    renderizarTransacoes(transacoesFiltradas)
    atualizarResumo(transacoesFiltradas)
}

const filtroBusca = document.querySelector('#search')
const filtroCategoria = document.querySelector('#filter-categories')
const filtroTipo = document.querySelector('#filter-types')
const filtroPeriodo = document.querySelector('#filter-period')
const botaoLimparFiltros = document.querySelector('.filter-reset-button')

filtroBusca.addEventListener('input', aplicarFiltros)
filtroCategoria.addEventListener('change', aplicarFiltros)
filtroTipo.addEventListener('change', aplicarFiltros)
filtroPeriodo.addEventListener('change', aplicarFiltros)

botaoLimparFiltros.addEventListener('click', (event) => {
    event.preventDefault()

    filtroBusca.value = ''
    filtroCategoria.value = 'all'
    filtroTipo.value = 'all'
    filtroPeriodo.value = 'filter-this-month'

    aplicarFiltros()
})

function renderizarTransacoes(transacoes) {
    const lista = document.querySelector('.transaction-list-body')

    lista.innerHTML = ''

    transacoes.forEach((item) => {
        const isReceita = item.tipo.toLowerCase() === 'receita'
        const tipoFormatado = isReceita ? 'Receita' : 'Despesa'

        const formatoBrasileiro = new Intl.NumberFormat('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

        const valorFormatado = formatoBrasileiro.format(item.valor)

        const novaTransacao = criarItemHtml(
            item.descricao,
            item.categoria,
            tipoFormatado,
            valorFormatado,
            item.data,
            isReceita,
            item.id
        )

        lista.insertAdjacentHTML('afterbegin', novaTransacao)
    })

    configurarBotoesDeleteEEdit()
}

function atualizarResumo(transacoes) {
    let totalReceitas = 0
    let totalDespesas = 0

    transacoes.forEach((item) => {
        if (item.tipo.toLowerCase() === 'receita'){
            totalReceitas += Number(item.valor)
        } else {
            totalDespesas += Number(item.valor)
        }
    })

    carregarValoresResumo(totalReceitas, totalDespesas)
}


const modal = document.querySelector('.delete-modal')
const modalContainer = document.querySelector('.delete-modal-container')
const modalText = document.querySelector('.modal-text')

modal.addEventListener('cancel', (event) => {
    event.preventDefault()
})


let id = null

let editTransactionDescricao = document.querySelector('#edit-description')
let editTransactionValor = document.querySelector('#edit-value')
let editTransactionCategoria = document.querySelector('#edit-categories')
let editTransactionTipo = document.querySelectorAll(`input[name="edit-type"]`)
let editTransactionData = document.querySelector('#edit-transaction-date')


async function configurarBotoesDeleteEEdit() {
    const deleteButtons = document.querySelectorAll('.delete-button')
    const editButtons = document.querySelectorAll('.edit-button')

    deleteButtons.forEach((button) => {
        button.addEventListener('click', () => {
            id = button.getAttribute('row-id')
            console.log(id)
            modal.showModal()
            document.body.classList.add('modal-aberto')
            modalContainer.classList.remove('delete-modal-container')
        })
    })

    editButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            id = button.getAttribute('row-id')
            console.log(id)
            const {
                descricao,
                categoria,
                tipo,
                valor,
                data
            } = await carregarEditItem(id)

            editTransactionDescricao.value = descricao
            editTransactionValor.value = valor
            editTransactionCategoria.value = categoria
            editTransactionTipo.forEach((input) => {
                if (input.value === tipo.toString()) {
                    input.checked = true;
                }
            });
            const dataFormat = data.substring(0, 10)
            editTransactionData.value = dataFormat

            editModal.showModal()
            document.body.classList.add('modal-aberto')
            editModalContainer.classList.remove('edit-modal-container')

        })
    })
}

function fecharModalDelete() {
    modal.close()
    document.body.classList.remove('modal-aberto')
    modalContainer.classList.add('delete-modal-container')
}

function fecharModalEdit() {
    editModal.close()
    document.body.classList.remove('modal-aberto')
    editModalContainer.classList.add('edit-modal-container')
    const editFields = [editTransactionDescricao, editTransactionValor, editTransactionCategoria, editTransactionTipo, editTransactionData]
    editFields.forEach((editField) => {
        editField.classList.remove('valid-form-input')
        editField.classList.remove('invalid-form-input')
    })
}

const closeModal = document.querySelector('.fechar-delete-modal')
closeModal.addEventListener('click', fecharModalDelete)

const closeEditModal = document.querySelector('.fechar-edit-modal')
closeEditModal.addEventListener('click', fecharModalEdit)

const confirmModal = document.querySelector('.confirmar-delete-modal')
confirmModal.addEventListener('click', async () => {
    if (!id) return

    await deletarTransacaoNoBanco(id)
    fecharModalDelete()
    id = null
})

//modal de edicao
const editModal = document.querySelector('.edit-modal')
const editModalContainer = document.querySelector('.edit-modal-container')

editModal.addEventListener('cancel', (event) => {
    event.preventDefault()
})

const confirmEditModal = document.querySelector('.confirm-edit-button')
confirmEditModal.addEventListener('click', async () => {
    if (editTransactionDescricao.classList.contains('invalid-form-input')) {
        alert('Digite uma descrição válida')
        return
    }
    if (editTransactionValor.classList.contains('invalid-form-input')) {
        alert('Digite um valor válido')
        return
    }
    if (!id) return
    await editarTransacaoNoBanco(id)
    fecharModalEdit()
    id = null
})



function formartarData(dataISO) {
    const [ano, mes, dia] = dataISO.split('T')[0].split('-')

    return `${dia}/${mes}/${ano}`
}

// Criar nova transação
const formularioNovaTransacao = document.querySelector('#new-transaction-form')

formularioNovaTransacao.addEventListener('submit', async (event) => {
    event.preventDefault()

    const descricaoHtml = document.querySelector('#description').value
    const inputDescricao = document.querySelector('#description')
    if (!inputDescricao.classList.contains('valid-form-input')) {
        alert('Descrição inválida')
        return
    }

    const valorHtml = document.querySelector('#value').value
    const inputvalor = document.querySelector('#value')
    if(!inputvalor.classList.contains('valid-form-input')){
        alert('Valor inválido')
        return
    }


    const categoriaHtml = document.querySelector('#categories').value
    const selectCategoria = document.querySelector('#categories')
    if (!selectCategoria.classList.contains('valid-form-input')){
        alert('Selecione uma categoria')
        return
    }


    const tipoSelecionado = document.querySelector('input[name="type"]:checked')

    let dataHtml = document.querySelector('#transaction-date').value

    const valor = transformarValorEmValorSql(valorHtml)

    if (!tipoSelecionado) {
        alert('Selecione Receita ou Despesa')
        return
    }

    const tipoHtml = tipoSelecionado.value;

    if (Number.isNaN(valor)) {
        alert('Digite um valor válido')
        return
    }

    const dadosForm = {
        descricao: descricaoHtml,
        categoria: categoriaHtml,
        tipo: tipoHtml,
        valor: valor,
        data: dataHtml
    }

    try {
        const resposta = await fetch('http://localhost:3000/api/add-new-transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosForm),
        })
        const resultado = await resposta.json()
        console.log('Resposta do servidor: ', resultado)
        console.log('dados enviados')
        carregarTransacoes()
        formularioNovaTransacao.reset()

        const inputsValidados = formularioNovaTransacao.querySelectorAll('.valid-form-input')
        inputsValidados.forEach(input => input.classList.remove('valid-form-input'))

    } catch (error) {
        console.log('Erro ao enviar: ', error)
    }

})

async function deletarTransacaoNoBanco(id) {
    try {
        const resposta = await fetch('http://localhost:3000/api/delete-transaction', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        })
        const resultado = await resposta.json()
        console.log('Resposta do servidor: ', resultado)
    } catch (erro) {
        console.error(erro)
    }
    carregarTransacoes()
}

async function getTransactionById(id) {
    const resposta = await fetch('http://localhost:3000/api/get-transaction-by-id', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
    })

    if (!resposta.ok) {
        throw new Error('Erro ao buscar transação')
    }
    const resultado = await resposta.json()
    console.log('resposta do server: ', resultado)
    return resultado
}
//fazer o destructuring
async function carregarEditItem(id) {
    const transacao = await getTransactionById(id)

    const descricao = transacao.resultado[0].descricao
    const categoria = transacao.resultado[0].categoria
    const tipo = transacao.resultado[0].tipo
    const valor = transacao.resultado[0].valor
    const data = transacao.resultado[0].data
    return { descricao, categoria, tipo, valor, data }
}

async function editarTransacaoNoBanco(id) {
    const novaDescricao = editTransactionDescricao.value
    const novaCategoria = editTransactionCategoria.value
    const novoValor = editTransactionValor.value
    const novoValorSql = transformarValorEmValorSql(novoValor)
    const novoTipo = document.querySelector('input[name="edit-type"]:checked').value
    const novaData = editTransactionData.value

    const dadosEdit = {
        id,
        novaDescricao,
        novaCategoria,
        novoValorSql,
        novoTipo,
        novaData
    }

    const resposta = await fetch('http://localhost:3000/api/edit-transaction-by-id', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosEdit),
    })
    const resultado = await resposta.json()
    console.log('Resposta do servidor: ', resultado)
    console.log('Transação editada')


    console.log(novaCategoria)
    console.log(novaDescricao)
    console.log(novoValor)
    console.log(novoTipo)
    console.log(novaData)



    carregarTransacoes()
}

function transformarValorEmValorSql(valor) {
    const valorSql = Number(valor.replace(/\./g, '').replace(',', '.'))
    return valorSql
}

function carregarValoresResumo(receitas, despesas) {
    const saldoAtual = document.querySelector('.saldo-atual')
    const totalDespesasHtml = document.querySelector('.total-despesas')
    const totalReceitasHtml = document.querySelector('.total-receitas')
    saldoAtual.innerHTML = `R$ ${receitas - despesas}`

    totalDespesasHtml.innerHTML = `R$ ${despesas}`
    totalReceitasHtml.innerHTML = `R$ ${receitas}`
}

carregarTransacoes()

//verificacao dos campos

const inputsFormsNewEdit = document.querySelectorAll('#new-transaction-form .form-field input, #new-transaction-form .form-field select, #edit-transaction-form .form-field input, #edit-transaction-form .form-field select')
inputsFormsNewEdit.forEach((input) => {
    input.addEventListener('focus', () => {
        input.classList.add('input-focus')
    })
    input.addEventListener('blur', () => {
        input.classList.remove('input-focus')
        
    })
})

const inputsTextDescription = document.querySelectorAll('#description, #edit-description')
inputsTextDescription.forEach((input) => {
    input.addEventListener('input', () => {
        const valor = input.value
        if (valor !== null && valor.trim() !== '' && valor.length < 20) {
            input.classList.add('valid-form-input')
            input.classList.remove('invalid-form-input')
        } else {
            input.classList.remove('valid-form-input')
            input.classList.add('invalid-form-input')
        }
    })
    input.addEventListener('blur', () => {
        if (input.value.trim() === '') {
            input.classList.add('invalid-form-input')
            input.classList.remove('valid-form-input')
        }
    })
})

const inputsTextValues = document.querySelectorAll('#value, #edit-value')
inputsTextValues.forEach((input) => {
    input.addEventListener('input', () => {
        const valor = input.value
        input.value = valor.replace(/[^0-9,]/g, '');
        
        if (input.value.trim() !== '') {
            input.classList.add('valid-form-input')
            input.classList.remove('invalid-form-input')
            if (input.value.split(',').length - 1 !== 1 && input.value.split(',').length - 1 !== 0) {
                input.classList.add('invalid-form-input')
                input.classList.remove('valid-form-input')
            } 
        }
        else {
            input.classList.add('invalid-form-input')
            input.classList.remove('valid-form-input')
        }
    })
    input.addEventListener('blur', () => {
        if (input.value.trim() === '') {
            input.classList.add('invalid-form-input')
            input.classList.remove('valid-form-input')
        }
    })
})

const inputsSelectCategories = document.querySelectorAll('#categories, #edit-categories')
inputsSelectCategories.forEach((input) => {
    input.addEventListener('change', () => {
        if (input.value !== '') {
            input.classList.add('valid-form-input')
            input.classList.remove('invalid-form-input')
        } else {
            input.classList.add('invalid-form-input')
            input.classList.remove('valid-form-input')
        }
    })
    input.addEventListener('blur', () => {
        if (input.value === '') {
            input.classList.add('invalid-form-input')
            input.classList.remove('valid-form-input')
        }
    })
})

// Secao do filtro
