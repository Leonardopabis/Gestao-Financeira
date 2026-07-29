## Gestão Financeira

Sistema web para organização de receitas e despesas pessoais.

## 📖 Sobre

O projeto foi desenvolvido para facilitar o controle financeiro, permitindo cadastrar, visualizar, editar e excluir transações.

A aplicação também calcula automaticamente o saldo, o total de receitas e o total de despesas, além de permitir a filtragem das transações.

---

## ✨ Funcionalidades

- Cadastro de receitas e despesas
- Edição e exclusão de transações
- Resumo financeiro automático
- Busca por descrição
- Filtros por categoria, tipo e período
- Validação dos formulários

---

## 🛠 Tecnologias

### Front-end

- HTML
- CSS
- JavaScript

### Back-end

- Node.js
- Express
- MySQL

---

## 🏗 Arquitetura

```text
Usuário
   │
   ▼
Front-end
   │
   ▼
API Express
   │
   ▼
MySQL
```

---

## ⚙️ Fluxo da aplicação

1. O usuário cadastra uma transação.
2. O front-end envia os dados para a API.
3. A API salva as informações no MySQL.
4. As transações são carregadas na tabela.
5. O resumo financeiro e os filtros são atualizados.

---

## 📷 Demonstração

<!-- Adicione aqui uma imagem ou GIF do projeto -->
<img width="959" height="413" alt="image" src="https://github.com/user-attachments/assets/f516668e-d2d4-485c-b098-8fb32e7b2f49" />
- Só é possível cadastrar uma transação com todos os campos validados
- Após cadastradas, as transações são puxadas do banco e mostradas na tabela das transações
- Os filtros selecionam especificamente as transações
- O saldo atual, receitas e despesas são calculados automaticamente com base nas transações mostradas

---

## 📌 Aprendizados

Durante o desenvolvimento foram praticados conceitos como:

- APIs REST
- Operações CRUD
- Programação assíncrona
- Manipulação do DOM
- Integração entre front-end e back-end
- Banco de dados MySQL
- Filtros e validação de formulários

---

## 👨‍💻 Autor

Leonardo Filipake Pabis
