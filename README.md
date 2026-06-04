# 🚗 DriverPro

**DriverPro** é um aplicativo mobile desenvolvido como projeto de conclusão do 5º semestre do curso de Engenharia de Software. O sistema tem como objetivo principal modernizar e facilitar o agendamento de corridas para **motoristas particulares**, permitindo que eles tenham controle total sobre sua agenda e margem de lucro, enquanto oferece aos passageiros uma experiência de agendamento personalizada e segura.

## 🌟 Principais Funcionalidades

O aplicativo é dividido em duas jornadas distintas:

**Para o Motorista:**
*   **Dashboard Inteligente:** Resumo diário de ganhos e corridas, com botão de controle de disponibilidade.
*   **Calculadora de Custos:** Ferramenta exclusiva para calcular o gasto de combustível e definir o preço ideal com base no lucro líquido desejado.
*   **Gestão de Solicitações:** Aceite ou recusa de novos agendamentos em tempo real.
*   **Agenda e Histórico:** Visualização de corridas agendadas e histórico financeiro de viagens passadas.

**Para o Passageiro:**
*   **Agendamento Customizado:** Escolha de origem, destino, categoria (VIP/Padrão) e necessidades específicas (transporte de pets, cadeirinha infantil, volumes extras).
*   **Motorista de Preferência:** Possibilidade de buscar a disponibilidade de um motorista específico.
*   **Gestão de Viagens:** Visualização e status de corridas pendentes, confirmadas ou concluídas.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias do ecossistema mobile atual:

*   **[React Native](https://reactnative.dev/):** Framework para desenvolvimento mobile multiplataforma.
*   **[Expo](https://expo.dev/):** Plataforma e conjunto de ferramentas para acelerar o desenvolvimento React Native.
*   **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática para maior segurança e qualidade do código.
*   **[Tailwind CSS (NativeWind v2)](https://www.nativewind.dev/):** Estilização baseada em classes utilitárias adaptada para o React Native.
*   **[Expo Vector Icons](https://docs.expo.dev/guides/icons/):** Biblioteca de iconografia (Ionicons).

---

## 📂 Estrutura do Projeto

Abaixo está a organização de pastas e arquivos da nossa aplicação:

```text
driverpro/
│
├── assets/                 ← Imagens, ícones (splash screen, favicon) e fontes
├── components/             ← Componentes de UI reutilizáveis (Design System)
│   ├── CustomInput.tsx     ← Campo de texto customizado com suporte a ícones
│   ├── PrimaryButton.tsx   ← Botão de ação principal padrão
│   ├── DriverHeader.tsx    ← Cabeçalho padronizado para navegação
│   ├── DriverBottomNav.tsx ← Barra de navegação inferior (Motorista)
│   ├── PassengerBottomNav.tsx ← Barra de navegação inferior (Passageiro)
│   └── ...                 ← (Cards de agendamento, histórico, resumo)
│
├── pages/                  ← Telas completas do aplicativo
│   ├── LoginPage.tsx       ← Tela de autenticação
│   ├── RegisterPage.tsx    ← Cadastro com seleção de perfil (Motorista/Passageiro)
│   ├── DriverDashboardPage.tsx ← Dashboard principal do Motorista
│   ├── CalculatorPage.tsx  ← Calculadora de custos e precificação
│   ├── PassengerDashboardPage.tsx ← Dashboard principal do Passageiro
│   ├── NewBookingPage.tsx  ← Fluxo de novo agendamento
│   └── ...                 ← (Telas de agenda, perfil e histórico)
│
├── App.tsx                 ← Ponto de entrada do app e gerenciamento de rotas
├── tailwind.config.js      ← Configuração das cores e mapeamento do Tailwind
├── babel.config.js         ← Configuração do transpilador Babel para o NativeWind
├── package.json            ← Dependências e scripts npm
└── tsconfig.json           ← Configuração do TypeScript
```

## 🚀 Como executar o projeto localmente

Para rodar este projeto na sua máquina, você precisará ter o [Node.js](https://nodejs.org/) instalado. Siga o passo a passo abaixo:

**1. Clone o repositório:**
```bash
git clone https://github.com/caneschi-lais/driverpro-frontend.git
```

**2. Acesse a pasta do projeto:**
```bash
cd driverpro
```

**3. Instale as dependências:**
```bash
npm install
```

**4. Inicie o servidor de desenvolvimento do Expo:**
(Utilizamos a flag -c para limpar o cache e garantir que os estilos do Tailwind sejam compilados corretamente)
```bash
npx expo start -c
```

**5. Como visualizar o App:**
Após iniciar o servidor, um **QR Code** aparecerá no seu terminal.

*   **Para testar no celular:** Baixe o aplicativo **Expo Go** (disponível na App Store e Google Play) e escaneie o QR Code.
*   **Para testar no Navegador (Web):** Pressione a tecla `w` no terminal.
*   **Para testar no Emulador:** Pressione a tecla `a` (Android) ou `i` (iOS/Mac).

