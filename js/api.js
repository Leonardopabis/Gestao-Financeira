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
                                        <button type="button" class="action-button edit-button"
                                            aria-label="Editar transação">
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
async function carregarTransacoes() {
    try {
        const resposta = await fetch('http://localhost:3000/api/get-transactions')

        if (!resposta.ok) {
            throw new Error(`Erro http: ${resposta.status}`)
        }

        const dados = await resposta.json()

        const listaDeTransacoes = document.querySelector('.transaction-list-body')
        listaDeTransacoes.innerHTML = null
        dados.forEach(item => {
            let isReceita = null
            if (item.tipo.toLowerCase() === 'receita') {
                isReceita = true
                item.tipo = 'Receita'
            } else {
                isReceita = false
                item.tipo = 'Despesa'
            }

            const formatoBrasileiro = new Intl.NumberFormat('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            const valorFormatado = formatoBrasileiro.format(item.valor)

            const novaTransacao = criarItemHtml(item.descricao, item.categoria, item.tipo, valorFormatado, item.data, isReceita, item.id)
            listaDeTransacoes.insertAdjacentHTML('afterbegin', novaTransacao)

        });
        // funcao do botao de delete
        const deleteButtons = document.querySelectorAll(".delete-button")
        const modal = document.querySelector('.delete-modal')
        const modalContainer = document.querySelector('.delete-modal-container')
        const modalText = document.querySelector('.modal-text')

        modal.addEventListener('keydown', (event) => {
            if (event.key === 'Escape'){
                event.preventDefault()
            }
        })

        deleteButtons.forEach((button) => {
            button.addEventListener('click', async () => {
                const id = button.getAttribute('row-id')
                console.log(id)
                modalContainer.classList.remove('delete-modal-container')
                modal.showModal()
                document.body.classList.add('modal-aberto')
                const closeModal = document.querySelector('.fechar-modal')
                closeModal.addEventListener('click', () => {
                    modal.close()
                    document.body.classList.remove('modal-aberto')
                    modalContainer.classList.add('delete-modal-container')
                })
                // await deletarTransacao(id)
            })
        })
    } catch (erro) {
        console.error('Erro ao buscar dados', erro)
    }
}

function formartarData(dataISO) {
    const [ano, mes, dia] = dataISO.split('T')[0].split('-')

    return `${dia}/${mes}/${ano}`
}

carregarTransacoes()

// Criar nova transação
const formularioNovaTransacao = document.querySelector('#new-transaction-form')

formularioNovaTransacao.addEventListener('submit', async (event) => {
    event.preventDefault()

    const descricaoHtml = document.querySelector('#description').value
    const valorHtml = document.querySelector('#value').value
    const categoriaHtml = document.querySelector('#categories').value
    const tipoSelecionado = document.querySelector('input[name="type"]:checked')
    const dataHtml = document.querySelector('#transaction-date').value

    const valor = Number(valorHtml.replace(/\./g, '').replace(',', '.'))

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

    } catch (error) {
        console.log('Erro ao enviar: ', error)
    }

})

async function deletarTransacao(id) {
    const rowId = { id }
    try {
        const resposta = await fetch('http://localhost:3000/api/delete-transaction', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rowId),
        })
        const resultado = await resposta.json()
        console.log('Resposta do servidor: ', resultado)
    } catch (erro) {
        console.error(erro)
    }
    carregarTransacoes()
}

