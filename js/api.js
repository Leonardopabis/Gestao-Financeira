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
        await configurarBotoesDeleteEEdit()
    } catch (erro) {
        console.error('Erro ao buscar dados', erro)
    }
}

const modal = document.querySelector('.delete-modal')
const modalContainer = document.querySelector('.delete-modal-container')
const modalText = document.querySelector('.modal-text')

modal.addEventListener('cancel', (event) => {
    event.preventDefault()
})

let id = null

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
        button.addEventListener('click', () => {
            id = button.getAttribute('row-id')
            console.log(id)
            getTransactionById(id)
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





function formartarData(dataISO) {
    const [ano, mes, dia] = dataISO.split('T')[0].split('-')

    return `${dia}/${mes}/${ano}`
}



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
        return resultado.resultado
}

async function carregarEditItem() {
    const { resultado: {descricao} } = await getTransactionById(11)
    console.log(descricao)
}
carregarEditItem()
// const {
//     descricao,
//     categoria,
//     tipo,
//     valor,
//     data
// }

carregarTransacoes()
