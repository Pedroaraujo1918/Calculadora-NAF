import { NavLink } from "react-router-dom";
export default function Navbar({ theme, toggleTheme }) {
  const label = theme === "dark" ? "☀ Claro" : "◐ Escuro";
  return <header className="topbar"><NavLink className="brand" to="/calculadora">NAF Calculadora</NavLink><nav aria-label="Navegação principal"><NavLink to="/calculadora">Calculadora</NavLink><NavLink to="/historico">Histórico</NavLink><NavLink to="/faq">FAQ</NavLink><NavLink to="/sobre">Sobre</NavLink></nav><button className="theme" onClick={toggleTheme} aria-label={label}>{label}</button></header>;
}
