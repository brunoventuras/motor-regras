import { Plus, Power, PowerOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { BarraFiltros } from '../../componentes/ui/BarraFiltros.tsx';
import { Botao } from '../../componentes/ui/Botao.tsx';
import { CabecalhoPagina } from '../../componentes/ui/CabecalhoPagina.tsx';
import { Carregando } from '../../componentes/ui/Carregando.tsx';
import { Cartao } from '../../componentes/ui/Cartao.tsx';
import { DialogoConfirmacao } from '../../componentes/ui/DialogoConfirmacao.tsx';
import { Etiqueta } from '../../componentes/ui/Etiqueta.tsx';
import { Tabela, type ColunaTabela } from '../../componentes/ui/Tabela.tsx';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.tsx';
import { useConsulta } from '../../hooks/useConsulta.ts';
import { alterarAtivoRegra, listarRegras } from '../../servicos/regras.ts';
import type { Regra } from '../../tipos/api.ts';
import { descreverAcao, formatarData } from '../../utilitarios/formatacao.ts';

/** Situação efetiva da regra, considerando o status e a vigência. */
function situacao(regra: Regra) {
  const agora = new Date();
  if (!regra.ativo) return <Etiqueta tom="neutro">Desativada</Etiqueta>;
  if (new Date(regra.vigenciaInicio) > agora)
    return <Etiqueta tom="informativo">Agendada</Etiqueta>;
  if (regra.vigenciaFim && new Date(regra.vigenciaFim) <= agora) {
    return <Etiqueta tom="alerta">Vigência encerrada</Etiqueta>;
  }
  return <Etiqueta tom="sucesso">Ativa</Etiqueta>;
}

function descreverVigencia(regra: Regra) {
  const inicio = formatarData(regra.vigenciaInicio);
  return regra.vigenciaFim ? `${inicio} até ${formatarData(regra.vigenciaFim)}` : `desde ${inicio}`;
}

export function ListaRegras() {
  const navegar = useNavigate();
  const { usuario } = useAutenticacao();
  const { dados: regras, carregando, recarregar } = useConsulta(listarRegras, []);
  const [busca, setBusca] = useState('');
  const [mostrarInativas, setMostrarInativas] = useState(false);
  const [regraAlterando, setRegraAlterando] = useState<Regra | null>(null);
  const [processando, setProcessando] = useState(false);

  const regrasVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return regras.filter(
      (regra) =>
        (mostrarInativas || regra.ativo) &&
        `${regra.codigo} ${regra.nome}`.toLowerCase().includes(termo),
    );
  }, [regras, busca, mostrarInativas]);

  const confirmarAlteracao = async () => {
    if (!regraAlterando) return;
    setProcessando(true);
    try {
      await alterarAtivoRegra(regraAlterando.id, !regraAlterando.ativo);
      toast.success(
        `Regra ${regraAlterando.codigo} ${regraAlterando.ativo ? 'desativada' : 'ativada'}.`,
      );
      setRegraAlterando(null);
      await recarregar();
    } catch (erro) {
      toast.error((erro as Error).message);
    } finally {
      setProcessando(false);
    }
  };

  const colunas: ColunaTabela<Regra>[] = [
    { titulo: 'Código', conteudo: (regra) => <strong>{regra.codigo}</strong>, largura: '90px' },
    { titulo: 'Nome', conteudo: (regra) => regra.nome },
    {
      titulo: 'Prioridade',
      conteudo: (regra) => regra.prioridade,
      alinhamento: 'centro',
      largura: '100px',
    },
    { titulo: 'Grupo', conteudo: (regra) => regra.grupo?.nome ?? '·' },
    { titulo: 'Ação', conteudo: (regra) => descreverAcao(regra.tipoAcao, regra.valorAcao) },
    {
      titulo: 'Condições',
      conteudo: (regra) =>
        regra.condicoes.length === 0
          ? 'Todos os cálculos'
          : `${regra.condicoes.length} ${regra.condicoes.length === 1 ? 'condição' : 'condições'}`,
    },
    { titulo: 'Vigência', conteudo: descreverVigencia },
    { titulo: 'Situação', conteudo: situacao },
  ];

  if (usuario?.autorizado) {
    colunas.push({
      titulo: '',
      largura: '60px',
      alinhamento: 'centro',
      conteudo: (regra) => (
        <Botao
          variante="fantasma"
          compacto
          icone={regra.ativo ? <PowerOff size={15} /> : <Power size={15} />}
          aria-label={regra.ativo ? 'Desativar' : 'Ativar'}
          title={regra.ativo ? 'Desativar' : 'Ativar'}
          onClick={(evento) => {
            evento.stopPropagation();
            setRegraAlterando(regra);
          }}
        />
      ),
    });
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Regras de cálculo"
        descricao="Avaliadas em ordem de prioridade, cada uma sobre o subtotal da anterior. Alterações valem imediatamente para os próximos cálculos."
        acoes={
          usuario?.autorizado && (
            <Botao icone={<Plus size={16} />} onClick={() => navegar('/regras/nova')}>
              Nova regra
            </Botao>
          )
        }
      />
      <Cartao semEspaco>
        <BarraFiltros
          busca={busca}
          aoBuscar={setBusca}
          mostrarInativos={mostrarInativas}
          aoAlternarInativos={setMostrarInativas}
          placeholder="Buscar por código ou nome"
          rotuloInativos="Mostrar desativadas"
        />
        {carregando ? (
          <Carregando />
        ) : (
          <Tabela
            colunas={colunas}
            itens={regrasVisiveis}
            chave={(regra) => regra.id}
            aoClicarLinha={(regra) => navegar(`/regras/${regra.id}`)}
            realcarInativo={(regra) => !regra.ativo}
          />
        )}
      </Cartao>
      <DialogoConfirmacao
        aberto={regraAlterando !== null}
        titulo={regraAlterando?.ativo ? 'Desativar regra' : 'Ativar regra'}
        mensagem={
          regraAlterando?.ativo
            ? `A regra ${regraAlterando.codigo} deixará de ser aplicada nos próximos cálculos. Os cálculos já feitos não mudam.`
            : `A regra ${regraAlterando?.codigo} voltará a ser aplicada nos próximos cálculos.`
        }
        textoConfirmar={regraAlterando?.ativo ? 'Desativar' : 'Ativar'}
        perigoso={regraAlterando?.ativo}
        processando={processando}
        aoConfirmar={confirmarAlteracao}
        aoCancelar={() => setRegraAlterando(null)}
      />
    </>
  );
}
