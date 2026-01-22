# Store & Connect - Sistema de Gestão para Lojas e Distribuidoras

![Status](https://img.shields.io/badge/Status-Em_Produção-2ea44f?style=for-the-badge)
![Flutter](https://img.shields.io/badge/Flutter-3.0-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Serverless-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Web](https://img.shields.io/badge/Web-GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white)

> **A clareza que seu negócio precisa para crescer.**
> 
> Sistema de gestão completo (PDV + Estoque + Financeiro) com arquitetura Serverless.

---

## 🔗 Links Oficiais

| 🌐 Site Institucional | 📱 Sistema Web (App) | 🤖 Google Play |
| :---: | :---: | :---: |
| [**www.storeconnect.com.br**](https://www.storeconnect.com.br) | [**app.storeconnect.com.br**](https://app.storeconnect.com.br) | [**Baixar App Android**](https://play.google.com/store/apps/details?id=com.storeeconnect.app) |

---

## 💻 Sobre o Projeto

**Store & Connect** é uma solução SaaS desenvolvida para modernizar o varejo. Diferente de sistemas legados complexos, entregamos o poder de um ERP na palma da mão ou no navegador.

O projeto utiliza uma arquitetura **100% Serverless**, garantindo alta escalabilidade e custo fixo otimizado.

### ✨ Funcionalidades Principais

#### 🛒 Gestão de Vendas (PDV)
* **Frente de Caixa Rápido:** Interface otimizada para vendas em segundos.
* **Controle de Estoque em Tempo Real:** Baixa automática e bloqueio de venda sem saldo.
* **Carrinho Flexível:** Venda para "Consumidor Final" ou clientes cadastrados.
* **Múltiplos Pagamentos:** Suporte nativo para Pix, Cartão, Dinheiro e **Venda a Crédito (Fiado)**.

#### 📈 Gestão Estratégica
* **Dashboard Financeiro:** Acompanhe ticket médio, total vendido e contas a receber.
* **Curva ABC:** Identifique automaticamente seus produtos mais lucrativos.
* **CRM de Clientes:** Histórico de compras e gestão de inadimplência.
* **Segurança:** Login biométrico e controle de acesso via Firebase Auth.

---

## 📸 Telas do Sistema

| Tela de Venda (PDV) | Dashboard Financeiro | Segurança & Perfil |
| :---: | :---: | :---: |
| <img src="assets/img/home2.png" width="250"> | <img src="assets/img/dashboard.png" width="250"> | <img src="assets/img/relatorios.png" width="250"> |

> *Imagens ilustrativas da versão Mobile e Web.*

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído seguindo os princípios do **Clean Architecture** e **JAMstack**.

* **Frontend:** [Flutter](https://flutter.dev) (Código único para Android, iOS e Web).
* **Backend:** [Firebase](https://firebase.google.com) (Firestore, Authentication, Storage).
* **Landing Page:** HTML5 + Bootstrap 5 (Hospedado no GitHub Pages).
* **Pagamentos:** [Stripe](https://stripe.com) (Gestão de Assinaturas Recorrentes).
* **Automação:** FormSubmit + ImprovMX (Infraestrutura de e-mail sem servidor).

---

## 🚀 Como Executar Localmente

```bash
# 1. Clone este repositório
git clone [https://github.com/RodrigoCosta1983/StoreConnect_SITE.git](https://github.com/RodrigoCosta1983/StoreConnect_SITE.git)

# 2. Acesse a pasta do projeto
cd StoreConnect_SITE

# 3. Para o SITE (Landing Page):
# Abra o arquivo index.html no seu navegador ou use o Live Server do VS Code.

# 4. Para o APP (Flutter):
# Certifique-se de ter o Flutter instalado e rode:
flutter run