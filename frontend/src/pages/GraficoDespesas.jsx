const coresCategorias = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

function GraficoDespesas({ categorias = [] }) {
  const totalDespesas = categorias.reduce(
    (total, categoria) =>
      total + Number(categoria.total_despesas),
    0
  );

  let percentualAcumulado = 0;

  const fatias = totalDespesas > 0
    ? categorias.map((categoria, indice) => {
        const inicio = percentualAcumulado;

        const percentual =
          (Number(categoria.total_despesas) / totalDespesas) * 100;

        percentualAcumulado += percentual;

        return `${
          coresCategorias[indice % coresCategorias.length]
        } ${inicio}% ${percentualAcumulado}%`;
      })
    : [];

  const gradiente = `conic-gradient(${fatias.join(", ")})`;

  return (
    <section className="dashboard-grafico-categorias">
      <h2>Despesas por categoria</h2>

      {totalDespesas === 0 ? (
        <p>Nenhuma despesa encontrada no período.</p>
      ) : (
        <div className="dashboard-categorias-conteudo">
          <div
            className="dashboard-categorias-rosca"
            style={{ background: gradiente }}
          >
            <div className="dashboard-categorias-centro">
              <span>Total de despesas</span>

              <strong>
                {totalDespesas.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>
            </div>
          </div>

          <ul className="dashboard-categorias-legenda">
            {categorias.map((categoria, indice) => (
              <li key={categoria.categoria_id}>
                <span
                  className="dashboard-categorias-cor"
                  style={{
                    backgroundColor:
                      coresCategorias[indice % coresCategorias.length],
                  }}
                />

                <span>{categoria.categoria}</span>

                <strong>
                  {(
                    (Number(categoria.total_despesas) /
                      totalDespesas) *
                    100
                  ).toLocaleString("pt-BR", {
                    maximumFractionDigits: 1,
                  })}
                  %
                </strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default GraficoDespesas;