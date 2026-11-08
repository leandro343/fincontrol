
function ModalConfirmacao({
  aberto,
  titulo,
  mensagem,
  onCancelar,
  onConfirmar,
  confirmando = false,
}) {
  if (!aberto) {
    return null;
  }

  return (
    <div className="categories-modal-overlay">
      <section
        className="categories-modal modal-confirmacao"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-confirmacao-titulo"
        aria-describedby="modal-confirmacao-mensagem"
      >
        <div className="categories-modal-header">
          <div className="categories-modal-title">
            <div
              className="categories-modal-icon modal-confirmacao-icone"
              aria-hidden="true"
            >
              !
            </div>

            <div>
              <h2 id="modal-confirmacao-titulo">
                {titulo}
              </h2>
              <p>Confirme a operação selecionada.</p>
            </div>
          </div>

          <button
            type="button"
            className="categories-modal-close"
            onClick={onCancelar}
            disabled={confirmando}
            aria-label="Fechar confirmação"
          >
            ×
          </button>
        </div>

        <div className="modal-confirmacao-corpo">
          <p id="modal-confirmacao-mensagem">
            {mensagem}
          </p>

          <p className="modal-confirmacao-aviso">
            Esta ação não poderá ser desfeita.
          </p>
        </div>

        <div className="categories-modal-actions modal-confirmacao-acoes">
          <button
            type="button"
            className="categories-secondary-button"
            onClick={onCancelar}
            disabled={confirmando}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="categories-save-button modal-confirmacao-excluir"
            onClick={onConfirmar}
            disabled={confirmando}
          >
            {confirmando ? "Excluindo..." : "Confirmar exclusão"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ModalConfirmacao;