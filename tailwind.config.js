/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A237E",
          light: "#283593",
          dark: "#121858",
        },
        accent: {
          DEFAULT: "#FDD835",
          light: "#FDF08B",
        },
        background: {
          DEFAULT: "#F5F5F5",
          paper: "#FFFFFF",
        },
        status: {
          success: "#4CAF50", // Verde para Concluído/Aprovado
          danger: "#EF4444", // Vermelho para Cancelado/Erro
          warning: "#F59E0B", // Laranja/Amarelo para Pendente
          info: "#3B82F6", // Azul para Informações
        },
        surface: {
          muted: "#9CA3AF", // Cinza padrão para ícones e textos secundários
          border: "#E5E7EB", // Cor global de bordas
        },
      },
      borderRadius: {
        "4xl": "40px", // Substitui o rounded-[40px]
      },
    },
  },
  plugins: [],
};
