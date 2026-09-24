import type { Config } from "tailwindcss";
const config:Config={
  content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}","./lib/**/*.{ts,tsx}"],
  theme:{extend:{fontFamily:{display:["Georgia","serif"],sans:["Inter","ui-sans-serif","system-ui"]},boxShadow:{glow:"0 0 40px rgba(255,255,255,.08)",crimson:"0 0 40px rgba(183,28,28,.18)"}}},
  plugins:[]
};
export default config;