import { Botao } from './Botao.tsx';
import { Modal } from './Modal.tsx';

interface PropriedadesDialogo {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  perigoso?: boolean;
  processando?: boolean;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

/** Pede confirmação antes de ações que mudam o comportamento do sistema. */
export function DialogoConfirmacao({
  aberto,
  titulo,
  mensagem,
  textoConfirmar,
  perigoso,
  processando,
  aoConfirmar,
  aoCancelar,
}: PropriedadesDialogo) {
  return (
    <Modal
      titulo={titulo}
      aberto={aberto}
      aoFechar={aoCancelar}
      rodape={
        <>
          <Botao variante="secundario" onClick={aoCancelar}>
            Cancelar
          </Botao>
          <Botao
            variante={perigoso ? 'perigo' : 'primario'}
            carregando={processando}
            onClick={aoConfirmar}
          >
            {textoConfirmar}
          </Botao>
        </>
      }
    >
      <p>{mensagem}</p>
    </Modal>
  );
}
