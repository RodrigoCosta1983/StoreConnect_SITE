Markdown

# 🛒 Store & Connect - Site Oficial

![Status do Projeto](https://img.shields.io/badge/Status-Em_Produção-brightgreen?style=for-the-badge)
![Licença](https://img.shields.io/badge/Licença-Proprietária-red?style=for-the-badge)
![Versão](https://img.shields.io/badge/Versão-2.0-blue?style=for-the-badge)

> **A clareza que seu negócio precisa para crescer.**
>
> Site institucional e portal de autenticação para o ecossistema Store & Connect.

---

## 🌐 Sobre o Projeto

Este repositório hospeda a **Landing Page** e o **Portal de Acesso** do SaaS **Store & Connect**. O objetivo do site é apresentar a solução de gestão para lojistas, capturar leads e servir como porta de entrada (AuthGate) para o sistema Web.

A arquitetura foi desenhada para ser **Serverless** (sem servidor dedicado), garantindo alta disponibilidade e custo zero de infraestrutura fixa.

### 🔗 Links Oficiais
- **Site Oficial:** [www.storeconnect.com.br](https://www.storeconnect.com.br)
- **Web App (Sistema):** [app.storeconnect.com.br](https://app.storeconnect.com.br)
- **Google Play:** [Baixar App](https://play.google.com/store/apps/details?id=com.storeeconnect.app)

---

## 🛠️ Tecnologias & Arquitetura

O projeto utiliza uma abordagem moderna de **JAMstack** (Javascript, APIs e Markup):

| Categoria | Tecnologias |
| :--- | :--- |
| **Frontend** | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) |
| **Framework** | ![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?style=flat-square&logo=bootstrap&logoColor=white) |
| **Backend / Auth** | ![Firebase](https://img.shields.io/badge/Firebase_Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black) ![Firestore](https://img.shields.io/badge/Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black) |
| **Hospedagem** | ![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=flat-square&logo=github&logoColor=white) |
| **Serviços** | ![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=flat-square&logo=stripe&logoColor=white) (Pagamentos) • **FormSubmit** (E-mail) • **ImprovMX** (DNS Email) |

---

## ✨ Funcionalidades Principais

* **Design Responsivo:** Layout adaptável para Mobile, Tablet e Desktop (Bootstrap 5).
* **Autenticação Integrada:** Login e Cadastro de usuários conectados diretamente ao Firebase Authentication.
* **Gestão de Sessão:** Redirecionamento inteligente.
    * *Usuário Novo* -> Cria conta no Firestore.
    * *Usuário Logado* -> Redireciona para o Painel Web (Flutter Web).
* **Formulário de Contato Serverless:** Envio de mensagens direto para o e-mail corporativo sem necessidade de backend PHP (via FormSubmit).
* **Infraestrutura Otimizada:**
    * Domínio personalizado (`.com.br`).
    * Certificado SSL (HTTPS) automático.
    * E-mail profissional via encaminhamento DNS.

---

## 📂 Estrutura de Pastas

```bash
StoreConnect_SITE/
├── assets/              # Imagens, CSS customizado, JS e Vendors
│   ├── css/
│   ├── img/
│   ├── js/
│   └── vendor/          # Bibliotecas (Bootstrap, Swiper, AOS)
├── forms/               # Scripts auxiliares de formulário
├── index.html           # Página Principal (Landing Page + Modais de Auth)
├── manutencao.html      # Página de fallback
├── README.md            # Documentação
└── CNAME                # Configuração do Domínio Customizado

🚀 Como Rodar Localmente

Clone o repositório:

Bash

git clone [https://github.com/RodrigoCosta1983/StoreConnect_SITE.git](https://github.com/RodrigoCosta1983/StoreConnect_SITE.git)
Abra a pasta no VS Code.

Use o Live Server:

Instale a extensão "Live Server" no VS Code.

Clique com o botão direito em index.html > "Open with Live Server".

👨‍💻 Autor
Rodrigo Costa

Desenvolvedor Fullstack & Fundador do Store & Connect

<p align="center"> Feito com ❤️ e muito café ☕ no Rio de Janeiro. </p>