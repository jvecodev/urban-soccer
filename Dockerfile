#Build da Aplicação Angular

FROM node:20-alpine as build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de gerenciamento de pacotes
COPY package.json package-lock.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o código-fonte da aplicação para o container
COPY . .

# Executa o script de build para produção, definido no package.json
RUN npm run build

#Estágio 2: Servidor Web (Nginx)

FROM nginx:alpine

# Copia os arquivos construídos do estágio 'build' para o diretório padrão do Nginx
COPY --from=build /app/dist/urban-soccer/browser /usr/share/nginx/html

# Copia o arquivo de configuração customizado do Nginx (ver passo 3)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 para permitir o acesso ao servidor Nginx
EXPOSE 80
