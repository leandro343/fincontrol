import { useEffect } from "react";

function Notificacao({ tipo = "sucesso", mensagem, onFechar }) {
  useEffect(() => {
    if (!mensagem) return;

    const temporizador = setTimeout(() => {
      onFechar();
    }, 4500);

    return () => clearTimeout(temporizador);
  }, [mensagem, onFechar]);

  if (!mensagem) {
    return null;
  }

  const sucesso = tipo === "sucesso";

  return (
    <div
      className={`fc-notificacao fc-notificacao--${tipo}`}
      role={sucesso ? "status" : "alert"}
    >
      <span className="fc-notificacao-icone" aria-hidden="true">
        {sucesso ? "✓" : "!"}
      </span>

      <p className="fc-notificacao-mensagem">{mensagem}</p>

      <button
        type="button"
        className="fc-notificacao-fechar"
        onClick={onFechar}
        aria-label="Fechar notificação"
      >
        ×
      </button>
    </div>
  );
}

export default Notificacao;
