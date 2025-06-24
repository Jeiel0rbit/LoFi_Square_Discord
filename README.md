# 🎶 LoFi Square - Bot de Música para Discord

![Imagem de um bot de música tocando no Discord](logo-lofi_square.png)

Bem-vindo ao **LoFi Square**! Um bot simples e aconchegante para Discord, criado para você e seus amigos relaxarem ao som de rádios Lo-Fi 24/7.

> **Disclaimer:** Este projeto não possui nenhuma afiliação com a empresa Square Cloud. O nome é apenas uma coincidência.

---

## ✨ Recursos Principais

-   **Rádios 24/7:** Mantenha a música tocando sem parar no seu canal de voz.
-   **Fácil de Usar:** Comandos simples e intuitivos para controlar o bot.
-   **Controle Interativo:** Um botão para trocar de estação de rádio facilmente.
-   **Totalmente Customizável:** Adicione ou altere a lista de rádios para que o bot toque apenas as suas favoritas!

---

## 🚀 Começando

Siga os passos abaixo para hospedar sua própria instância do LoFi Square.

### 📋 Pré-requisitos

Antes de começar, certifique-se de que você tem o seguinte instalado em sua máquina ou ambiente:
-   [Node.js](https://nodejs.org/) (versão 16.9.0 ou superior)
-   [Git](https://git-scm.com/)

### 🔧 Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/Jeiel0rbit/LoFi_Square_Discord.git](https://github.com/Jeiel0rbit/LoFi_Square_Discord.git)
    ```

2.  **Acesse o diretório do projeto:**
    ```bash
    cd LoFi_Square_Discord
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configure o Token do Bot:**
    -   Abra o arquivo `index.js`.
    -   Encontre a linha `const TOKEN = 'SEU_TOKEN_AQUI';` e substitua `'SEU_TOKEN_AQUI'` pelo token do seu bot.
    -   Você pode obter seu token no [Portal de Desenvolvedores do Discord](https://discord.com/developers/applications).

5.  **Inicie o bot:**
    ```bash
    node index.js
    ```

> [!WARNING]
> Para que o bot leia os comandos (`!join`, `!leave`, etc.), você **precisa** ativar a permissão **MESSAGE CONTENT INTENT** no portal de desenvolvedores do Discord, na seção "Bot" da sua aplicação.

---

## 🤖 Comandos do Bot

| Comando  | Descrição                                                    |
| :------- | :----------------------------------------------------------- |
| `!join`  | Chama o bot para o canal de voz em que você está e inicia a rádio. |
| `!leave` | Desconecta o bot do canal de voz.                            |
| `!Shelp` | Exibe uma mensagem de ajuda com a lista de todos os comandos.  |

---

## 🎨 Customização

Você pode facilmente alterar a lista de estações de rádio que o bot toca.

1.  Abra o arquivo `index.js`.
2.  Encontre o array `stations`:

    ```javascript
    const stations = [
        { name: 'LoFi Girl', url: '[https://radio.stereoscenic.com/ama-h](https://radio.stereoscenic.com/ama-h)'},
        { name: 'Chillhop', url: '[https://radio.stereoscenic.com/asp-h3](https://radio.stereoscenic.com/asp-h3)'},
        // Adicione suas rádios aqui!
        // { name: 'Nome da Rádio', url: 'URL_DA_STREAM' },
    ];
    ```
3.  Adicione, remova ou edite as estações de rádio conforme seu gosto.

---

## 🙏 Agradecimentos

As estações de rádio padrão foram encontradas no excelente repositório [internet-radio-streams](https://github.com/mikepierce/internet-radio-streams) de Mike Pierce.
