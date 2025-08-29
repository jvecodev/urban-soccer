![Urban Soccer Banner](./public/urbanSoccer.png)

# Urban Soccer: A Lenda do Asfalto - Trainee Wise System

## 📖 Sobre o Projeto

**Urban Soccer** é um ambicioso projeto que visa criar uma experiência imersiva de **RPG de Ação em um universo de futebol de rua**. Inspirado pela dramaticidade e pelas jogadas fantásticas de animes como *Super Campeões*, o jogo transporta o jogador para a **"Cidade do Futebol"**, uma metrópole vibrante onde o esporte é um estilo de vida e as lendas nascem no asfalto.

O objetivo é criar uma **jornada** onde o jogador começa como um atleta desconhecido e, através de desafios, torneios e uma narrativa envolvente, constrói sua própria equipe, reputação e legado para se tornar o maior jogador que a cidade já viu.

> Este repositório contém o **código-fonte do frontend**, desenvolvido com **Angular**.

---

## ✨ Conceito e Narrativa

A história se desenrola na *Cidade do Futebol*, um lugar onde as competições de rua são tão prestigiadas quanto os campeonatos oficiais. O jogador deverá:

- **Explorar um Mundo Aberto**: Navegar pelos diversos bairros da cidade, cada um com seus próprios campos, desafios, lojas e segredos.
- **Construir uma Lenda**: Começar do zero, participando de partidas de rua para ganhar reputação e dinheiro.
- **Montar o Time dos Sonhos**: Recrutar outros jogadores espalhados pela cidade, cada um com habilidades, personalidades e histórias únicas.
- **Evolução de Personagem**: Desenvolver as habilidades do seu jogador através de um sistema de progressão de RPG, com atributos, técnicas especiais e customização de equipamentos.
- **Narrativa Dinâmica**: Interagir com diferentes facções de jogadores, técnicos e personalidades da cidade, onde suas escolhas e desempenho em campo moldam o desenrolar da história.

---

## 🚀 Tecnologias Utilizadas

O projeto é construído sobre uma **stack moderna** para garantir performance, escalabilidade e uma experiência rica para o usuário:

- **Frontend**: Angular 20+Framework robusto para UI, menus, telas de gerenciamento de equipe e renderização do jogo. **Utilizando o Prime NG**
- **Backend (Planejado)**: FastAPI (Python)API de alta performance para lógica do jogo, dados de jogadores e partidas.
- **Inteligência Artificial (Planejado)**: LLM (Large Language Model)Para diálogos dinâmicos com NPCs, narração em tempo real e histórias adaptativas.
- **Containerização**: Docker & Docker Compose
  Garantindo consistência entre ambientes de desenvolvimento e produção.

---

## 🎨 Identidade Visual

A identidade visual do Urban Soccer transmite a energia da **cultura de rua**, a intensidade do esporte e a atmosfera de uma cidade que nunca dorme.

### Paleta de Cores

| Cor              | Hex     | Uso Recomendado                                   |
| ---------------- | ------- | ------------------------------------------------- |
| Azul Noite       | #14223D | Cor de fundo principal para telas e menus         |
| Roxo Urbano      | #7C2C78 | Painéis secundários e gradientes                |
| Laranja Vibrante | #EB6E19 | Ação principal (botões primários, alertas)    |
| Ciano Elétrico  | #30C9F9 | Acento secundário (ícones, barras de progresso) |
| Cinza Claro      | #C9CBCA | Cor principal para textos de corpo                |

### Tipografia

- **Teko**: Títulos de grande impacto
- **Russo One**: Subtítulos e nomes
- **Press Start 2P**: Stats e elementos retrô da UI
- **Inter**: Corpo de texto e diálogos

Acompanhe toda a estilização pelo arquivo [style-guide](./style-guide.md)

---

## 🛠️ Como Executar o Projeto

Atualmente, este repositório contém apenas o **frontend em Angular**.

Existem duas maneiras de executá-lo: **localmente** ou via **Docker** (recomendado).

### 🔹 Pré-requisitos

- Node.js (20.x ou superior)
- NPM (vem junto com o Node.js)
- Angular CLI (`npm install -g @angular/cli`)
- Docker e Docker Compose

---

### 1. Execução Local (Angular CLI)

Clone o repositório:

```bash
git clone <https://github.com/jvecodev/urban-soccer>
cd urban-soccer
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor em desenvolvimento

```bash
ng serve
```

Ou com o Docker

```bash
docker-compose up --build
```

Acesse a aplicação
Abra seu navegador e acesse http://localhost:4200/.

---

## 🏗️ Estrutura do Projeto

```bash
urban-soccer/
├── .vscode/               # Configurações do VS Code
├── node_modules/          # Dependências do projeto
├── public/                # Assets estáticos (como o favicon)
├── src/
│   ├── app/               # Código principal da aplicação (componentes, rotas, etc.)
│   │   ├── app.config.ts  # Configuração da aplicação
│   │   ├── app.html       # Template HTML principal
│   │   ├── app.routes.ts  # Definição de rotas
│   │   ├── app.scss       # Estilos do componente principal
│   │   ├── app.spec.ts    # Testes do componente principal
│   │   └── app.ts         # Lógica do componente principal
│   ├── index.html         # Página HTML principal
│   ├── main.ts            # Ponto de entrada da aplicação
│   └── styles.scss        # Estilos globais
├── .dockerignore          # Arquivos a serem ignorados pelo Docker
├── .editorconfig          # Configuração do editor de código
├── .gitignore             # Arquivos a serem ignorados pelo Git
├── angular.json           # Configuração do workspace do Angular
├── Dockerfile             # Instruções para construir a imagem Docker
├── docker-compose.yml     # Orquestração dos containers
├── nginx.conf             # Configuração do servidor Nginx para o Angular
├── package.json           # Dependências e scripts do projeto
├── style-guide.md         # Guia de Estilo Visual
└── tsconfig.json          # Configuração do TypeScript
```
