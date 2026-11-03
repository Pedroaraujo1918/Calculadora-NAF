const BASE = "http://localhost:3000";
const key = "naf-client-id";
export const clientId = () => { let id = localStorage.getItem(key); if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); } return id; };
const request = async (path, options = {}) => {
  const response = await fetch(`${BASE}${path}`, { ...options, headers: { "Content-Type": "application/json", "x-client-id": clientId(), ...(options.headers || {}) } });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || "Não foi possível concluir a operação.");
  return response.status === 204 ? null : response.json();
};
export const salvarSimulacao = (data) => request("/api/simulacoes", { method: "POST", body: JSON.stringify(data) });
export const listarSimulacoes = () => request("/api/simulacoes");
export const removerSimulacao = (id) => request(`/api/simulacoes/${id}`, { method: "DELETE" });
