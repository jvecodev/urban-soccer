![Banner do Urban Soccer](./public/Logo-Transparente.png)

# Urban Soccer: A Lenda do Asfalto - Um RPG Textual com IA

## 📖 Sobre o Projeto

**Urban Soccer** é uma experiência imersiva de **RPG de Ação textual**, onde cada partida é uma história única, narrada e moldada por Inteligência Artificial. Inspirado pela dramaticidade de animes como *Super Campeões*, o jogo transporta o jogador para a **"Cidade do Futebol"**, uma metrópole vibrante onde o esporte é um estilo de vida e as lendas nascem no asfalto.

O objetivo é criar uma **jornada interativa**, onde o jogador, através de escolhas e ações, guia seu atleta em uma narrativa dinâmica gerada em tempo real por um Large Language Model (LLM).

> Este repositório contém o **código-fonte do frontend**, desenvolvido com **Angular**.

---

## ✨ Conceito e Narrativa

A história se desenrola na *Cidade do Futebol*, onde as competições de rua são tão prestigiadas quanto os campeonatos oficiais. O jogador deverá:

-   **Criar sua Lenda**: Desenvolver um personagem único, escolhendo entre diferentes arquétipos de jogadores.
-   **Viver a Partida**: Participar de partidas textuais onde cada lance é narrado por uma IA, criando uma experiência de rádio esportivo personalizada.
-   **Tomar Decisões Críticas**: Suas escolhas durante a partida, gerenciadas por um LLM, definem o rumo do jogo e o desenvolvimento da sua carreira.
-   **Construir sua Carreira**: Evoluir as habilidades do seu jogador, gerenciar campanhas e construir um legado para se tornar o maior jogador que a cidade já viu.

---

## 🚀 Tecnologias Utilizadas

O projeto é construído sobre uma **stack moderna** para garantir performance, escalabilidade e uma experiência rica para o usuário:

-   **Frontend**: **Angular 20+**, utilizando **PrimeNG** para componentes de UI robustos e responsivos.
-   **Backend (Planejado)**: **FastAPI (Python)**, uma API de alta performance para a lógica do jogo, gerenciamento de dados e integração com a IA.
-   **Inteligência Artificial (Planejado)**: **LLM (Large Language Model)** para diálogos dinâmicos, narração em tempo real e histórias adaptativas.
-   **Containerização**: **Docker & Docker Compose** para garantir consistência entre os ambientes de desenvolvimento e produção.

---

## 🎨 Identidade Visual

A identidade visual do Urban Soccer transmite a energia da **cultura de rua**, a intensidade do esporte e a atmosfera de uma cidade que nunca dorme.

### Paleta de Cores

| Cor | Hex | Uso Recomendado |
| :--- | :--- | :--- |
| Azul Noite | `#14223D` | Cor de fundo principal para telas e menus. |
| Roxo Urbano | `#7C2C78` | Painéis secundários e gradientes. |
| Laranja Vibrante| `#EB6E19` | Ação principal (botões primários, alertas). |
| Ciano Elétrico | `#30C9F9` | Acento secundário (ícones, barras de progresso).|
| Cinza Claro | `#C9CBCA` | Cor principal para textos de corpo. |

### Tipografia

-   **Teko**: Títulos de grande impacto.
-   **Russo One**: Subtítulos e nomes.
-   **Press Start 2P**: Stats e elementos retrô da UI.
-   **Inter**: Corpo de texto e diálogos.

Acompanhe toda a estilização pelo arquivo [style-guide.md](./style-guide.md).

---

## 🛠️ Como Executar o Projeto

Atualmente, este repositório contém apenas o **frontend em Angular**.

Existem duas maneiras de executá-lo: **localmente** ou via **Docker** (recomendado).

### 🔹 Pré-requisitos

-   **Node.js** (versão 20.x ou superior)
-   **NPM** (geralmente instalado com o Node.js)
-   **Angular CLI** (instale globalmente com `npm install -g @angular/cli`)
-   **Docker** e **Docker Compose** (para a execução com container)

---

### 1. Execução Local (Angular CLI)

1.  **Clone o repositório:**

    ```bash
    git clone [https://github.com/jvecodev/urban-soccer.git](https://github.com/jvecodev/urban-soccer.git)
    cd urban-soccer
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**

    ```bash
    ng serve
    ```

4.  **Acesse a aplicação:**
    Abra seu navegador e acesse `http://localhost:4200/`.

### 2. Execução com Docker (Recomendado)

1.  **Clone o repositório** (se ainda não o fez):

    ```bash
    git clone [https://github.com/jvecodev/urban-soccer.git](https://github.com/jvecodev/urban-soccer.git)
    cd urban-soccer
    ```

2.  **Construa e inicie o container:**

    ```bash
    docker-compose up --build
    ```

3.  **Acesse a aplicação:**
    Abra seu navegador e acesse `http://localhost:4200/`.

---

## 🏗️ Estrutura do Projeto

A estrutura de pastas segue o padrão do Angular, organizada para escalabilidade e manutenção.

```bash
urban-soccer/
├── .vscode/               # Configurações do VS Code
├── node_modules/          # Dependências do Node.js
├── public/                # Assets estáticos (imagens, favicons)
├── src/
│   ├── app/
│   │   ├── components/    # Componentes reutilizáveis (átomos, organismos)
│   │   ├── guards/        # Guards de rota (ex: auth-guard)
│   │   ├── models/        # Interfaces e tipos de dados (player, user, etc.)
│   │   ├── pages/         # Componentes de página (home, login, dashboard)
│   │   ├── services/      # Lógica de negócio e comunicação com API
│   │   ├── shared/        # Estilos ou módulos compartilhados
│   │   ├── app.config.ts  # Configuração da aplicação
│   │   ├── app.routes.ts  # Definição de rotas
│   │   └── app.ts         # Componente principal
│   ├── index.html         # Página HTML principal
│   ├── main.ts            # Ponto de entrada da aplicação
│   └── styles.scss        # Estilos globais
├── .dockerignore          # Arquivos ignorados pelo Docker
├── .editorconfig          # Configuração do editor
├── .gitignore             # Arquivos ignorados pelo Git
├── angular.json           # Configuração do workspace do Angular
├── Dockerfile             # Instruções para construir a imagem Docker
├── docker-compose.yml     # Orquestração dos containers
├── nginx.conf             # Configuração do Nginx para servir a aplicação
├── package.json           # Dependências e scripts do projeto
├── style-guide.md         # Guia de Estilo Visual
└── tsconfig.json          # Configuração do TypeScript
```

