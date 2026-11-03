export const PROFISSOES = [
  ["psicologo", "Psicólogo(a)"], ["arquiteto", "Arquiteto(a)"], ["advogado", "Advogado(a)"],
  ["medico", "Médico(a)"], ["dentista", "Dentista"],
];
export const usaFatorR = (profissao) => ["medico", "dentista"].includes(profissao);
const money = (value) => Number(Math.max(0, value).toFixed(2));

export function calcular({ profissao, renda, custos, folha = 0 }) {
  const base = money(renda - custos);
  let aliquotaPF = 0, deducao = 0, faixa = "Isento";
  if (base > 4664.68) [aliquotaPF, deducao, faixa] = [0.275, 908.73, "27,5%"];
  else if (base > 3751.05) [aliquotaPF, deducao, faixa] = [0.225, 675.49, "22,5%"];
  else if (base > 2826.65) [aliquotaPF, deducao, faixa] = [0.15, 394.16, "15%"];
  else if (base > 2428.8) [aliquotaPF, deducao, faixa] = [0.075, 182.16, "7,5%"];
  const impostoPF = money(base * aliquotaPF - deducao);
  const fatorR = usaFatorR(profissao) ? (renda ? folha / renda : 0) : null;
  const anexo = usaFatorR(profissao) ? (fatorR >= 0.28 ? "Anexo III" : "Anexo V") : "Anexo III";
  const aliquotaSimples = anexo === "Anexo III" ? 0.06 : 0.155;
  const proLabore = money(Math.max(renda * 0.28, 1518));
  const simples = money(renda * aliquotaSimples);
  const inss = money(proLabore * 0.11);
  const totalPJ = money(simples + inss);
  const maisVantajoso = totalPJ < impostoPF ? "PJ" : totalPJ > impostoPF ? "PF" : "Empate";
  return {
    inputs: { profissao, renda: Number(renda), custos: Number(custos), folha: Number(folha) },
    fatorR, anexo, maisVantajoso, diferenca: money(Math.abs(totalPJ - impostoPF)),
    pf: { base, faixa, aliquota: aliquotaPF, deducao, imposto: impostoPF, total: impostoPF },
    pj: { simples, aliquotaSimples, proLabore, inss, total: totalPJ },
  };
}
export const brl = (n) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n || 0));
export const nomeProfissao = (id) => PROFISSOES.find(([key]) => key === id)?.[1] || id;
