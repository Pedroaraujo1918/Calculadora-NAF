import { brl, nomeProfissao } from "./calculos";
const esc = (value) => String(value).replace(/[\\()]/g, "\\$&").replace(/[^\x20-\x7E]/g, "?");
export function baixarPdf(r) {
  const now = new Date().toLocaleString("pt-BR");
  const max = Math.max(r.pf.total, r.pj.total, 1); const pf = Math.round((r.pf.total / max) * 180), pj = Math.round((r.pj.total / max) * 180);
  const lines = ["NAF - Universidade Christus", "Comparativo tributario PF x PJ", `Emitido em: ${now}`, "Valores estimados; nao substituem orientacao contábil.", "", `Profissao: ${nomeProfissao(r.inputs.profissao)}`, `Renda mensal: ${brl(r.inputs.renda)}   Custos: ${brl(r.inputs.custos)}`, "", "MEMORIA PF", `Base: ${brl(r.pf.base)} | Aliquota: ${(r.pf.aliquota * 100).toFixed(1)}% | Deducao: ${brl(r.pf.deducao)}`, `IRPF estimado: ${brl(r.pf.total)}`, "", "MEMORIA PJ", `Simples: base ${brl(r.inputs.renda)} x ${(r.pj.aliquotaSimples * 100).toFixed(1)}% = ${brl(r.pj.simples)}`, `INSS: base pro-labore ${brl(r.pj.proLabore)} x 11% = ${brl(r.pj.inss)}`, `Anexo aplicado: ${r.anexo}${r.fatorR !== null ? ` | Fator R: ${(r.fatorR * 100).toFixed(2)}%` : ""}`, `Total PJ: ${brl(r.pj.total)}`, "", `Opcao mais vantajosa: ${r.maisVantajoso} | Diferenca: ${brl(r.diferenca)}`, "", "GRAFICO COMPARATIVO", `PF ${brl(r.pf.total)}   PJ ${brl(r.pj.total)}`];
  const text = lines.map((line, i) => `BT /F1 ${i < 2 ? 16 : 10} Tf 50 ${780 - i * 20} Td (${esc(line)}) Tj ET`).join("\n");
  const stream = `${text}\n0.20 0.35 0.65 rg 50 365 ${pf} 16 re f\n0.10 0.55 0.35 rg 50 330 ${pj} 16 re f\nBT /F1 9 Tf 240 368 Td (PF) Tj ET\nBT /F1 9 Tf 240 333 Td (PJ) Tj ET`;
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>", `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
  let pdf = "%PDF-1.4\n", offsets = [0]; objects.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; }); const start = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((o) => `${String(o).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" })); a.download = "comparativo-naf.pdf"; a.click(); URL.revokeObjectURL(a.href);
}
