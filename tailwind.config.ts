import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
  safelist: [
    'border-l-red-500',
    'border-r-red-500',
    'border-l-green-500',
    'border-r-green-500',
    'border-l-blue-500',
    'border-r-blue-500',
    'border-l-yellow-500',
    'border-r-yellow-500',
    'border-l-orange-500',
    'border-r-orange-500',
    'border-l-purple-500',
    'border-r-purple-500',
    'border-l-pink-500',
    'border-r-pink-500',
    'bg-red-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-slate-200',
    'bg-white',
    'bg-gray-200',
    'bg-gray-300',
    'bg-gray-400',
    'bg-gray-500',
    'bg-gray-600',
    'bg-gray-700',
    'bg-gray-800',
    'bg-gray-900',  
    'bg-black',
  ]
} satisfies Config;
