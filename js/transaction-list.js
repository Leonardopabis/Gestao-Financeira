const criarItemHtml = (descricao, categoria, tipo, valor, data, receita) => {
    const classeTipo = receita ? 'income' : 'expense'
    const classeValor = receita ? 'income-value' : 'expense-value'
    const sinalValor = receita ? '' : '- '
    const dataFormatada = formartarData(data)
    return `
                            <tr>
                                <td>
                                    <div class="transaction-description">
                                        <img src="./img/filter-cifrao.png" alt="Ícone de despesa">
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

                                        <button type="button" class="action-button delete-button"
                                            aria-label="Excluir transação">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
`
}

async function carregarTransacoes() {
    try {
        const resposta = await fetch('http://localhost:3000/api/transaction')

        if (!resposta.ok) {
            throw new Error(`Erro http: ${resposta.status}`)
        }

        const dados = await resposta.json()

        const listaDeTransacoes = document.querySelector('.transaction-list-body')
        dados.forEach(item => {
            let isReceita = null
            if (item.tipo === 'Receita') {
                isReceita = true
            } else {
                isReceita = false
            }
            const novaTransacao = criarItemHtml(item.descricao, item.categoria, item.tipo, item.valor, item.data, isReceita)
            listaDeTransacoes.insertAdjacentHTML('afterbegin', novaTransacao)
        });
    } catch (erro) {
        console.error('Erro ao buscar dados', erro)
    }
}

function formartarData(dataISO) {
    const [ano, mes, dia] = dataISO.split('T')[0].split('-')

    return `${dia}/${mes}/${ano}`
}

carregarTransacoes()