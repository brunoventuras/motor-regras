import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Power, PowerOff, Save } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { BarraFiltros } from '../../componentes/ui/BarraFiltros.tsx';
import { Botao } from '../../componentes/ui/Botao.tsx';
import { CabecalhoPagina } from '../../componentes/ui/CabecalhoPagina.tsx';
import { AreaTexto, Campo, Entrada } from '../../componentes/ui/Campo.tsx';
import { Carregando } from '../../componentes/ui/Carregando.tsx';
import { Cartao } from '../../componentes/ui/Cartao.tsx';
import { DialogoConfirmacao } from '../../componentes/ui/DialogoConfirmacao.tsx';
import { Modal } from '../../componentes/ui/Modal.tsx';
import { Tabela, type ColunaTabela } from '../../componentes/ui/Tabela.tsx';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.tsx';
import { useConsulta } from '../../hooks/useConsulta.ts';
import {
  alterarAtivoCatalogo,
  atualizarItemCatalogo,
  criarItemCatalogo,
  listarCatalogo,
} from '../../servicos/catalogos.ts';
import type {
  ConfiguracaoCatalogo,
  ItemCatalogo,
  ValoresFormulario,
} from './configuracoes/tipos.ts';
import estilos from './PaginaCatalogo.module.css';

type Edicao<T> = { item: T | null } | null;

/**
 * Tela única para todos os catálogos: listar, buscar, criar, editar, ativar e desativar.
 * O que muda entre os catálogos vem da ficha de configuração recebida.
 */
export function PaginaCatalogo<T extends ItemCatalogo>({
  configuracao,
}: {
  configuracao: ConfiguracaoCatalogo<T>;
}) {
  const { usuario } = useAutenticacao();
  const podeAlterar = usuario?.autorizado ?? false;
  const buscarItens = useCallback(
    () => listarCatalogo<T>(configuracao.endereco),
    [configuracao.endereco],
  );
  const { dados: itens, carregando, recarregar } = useConsulta(buscarItens, []);

  const [busca, setBusca] = useState('');
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [edicao, setEdicao] = useState<Edicao<T>>(null);
  const [itemAlterando, setItemAlterando] = useState<T | null>(null);
  const [processando, setProcessando] = useState(false);

  const formulario = useForm<ValoresFormulario, unknown, unknown>({
    resolver: zodResolver(configuracao.esquema),
  });
  const { errors, isSubmitting } = formulario.formState;

  const itensVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return itens.filter(
      (item) =>
        (mostrarInativos || item.ativo) &&
        configuracao.textoBusca(item).toLowerCase().includes(termo),
    );
  }, [itens, busca, mostrarInativos, configuracao]);

  const abrirFormulario = (item: T | null) => {
    formulario.reset(item ? configuracao.paraFormulario(item) : configuracao.valoresIniciais);
    setEdicao({ item });
  };

  const salvar = async (dados: unknown) => {
    try {
      if (edicao?.item) await atualizarItemCatalogo(configuracao.endereco, edicao.item.id, dados);
      else await criarItemCatalogo(configuracao.endereco, dados);
      toast.success(`Cadastro de ${configuracao.nomeItem} salvo.`);
      setEdicao(null);
      await recarregar();
    } catch (erro) {
      toast.error((erro as Error).message);
    }
  };

  const confirmarAlteracao = async () => {
    if (!itemAlterando) return;
    setProcessando(true);
    try {
      await alterarAtivoCatalogo(configuracao.endereco, itemAlterando.id, !itemAlterando.ativo);
      toast.success(
        `${configuracao.identificar(itemAlterando)} ${itemAlterando.ativo ? 'desativado(a)' : 'ativado(a)'}.`,
      );
      setItemAlterando(null);
      await recarregar();
    } catch (erro) {
      toast.error((erro as Error).message);
    } finally {
      setProcessando(false);
    }
  };

  const colunas: ColunaTabela<T>[] = podeAlterar
    ? [
        ...configuracao.colunas,
        {
          titulo: '',
          largura: '100px',
          alinhamento: 'direita',
          conteudo: (item) => (
            <div className={estilos.acoes}>
              <Botao
                variante="fantasma"
                compacto
                icone={<Pencil size={15} />}
                title="Editar"
                aria-label="Editar"
                onClick={() => abrirFormulario(item)}
              />
              <Botao
                variante="fantasma"
                compacto
                icone={item.ativo ? <PowerOff size={15} /> : <Power size={15} />}
                title={item.ativo ? 'Desativar' : 'Ativar'}
                aria-label={item.ativo ? 'Desativar' : 'Ativar'}
                onClick={() => setItemAlterando(item)}
              />
            </div>
          ),
        },
      ]
    : configuracao.colunas;

  return (
    <>
      <CabecalhoPagina
        titulo={configuracao.titulo}
        descricao={configuracao.descricao}
        acoes={
          podeAlterar && (
            <Botao icone={<Plus size={16} />} onClick={() => abrirFormulario(null)}>
              Novo cadastro
            </Botao>
          )
        }
      />

      <Cartao semEspaco>
        <BarraFiltros
          busca={busca}
          aoBuscar={setBusca}
          mostrarInativos={mostrarInativos}
          aoAlternarInativos={setMostrarInativos}
        />
        {carregando ? (
          <Carregando />
        ) : (
          <Tabela
            colunas={colunas}
            itens={itensVisiveis}
            chave={(item) => item.id}
            realcarInativo={(item) => !item.ativo}
          />
        )}
      </Cartao>

      <Modal
        titulo={
          edicao?.item
            ? `Editar ${configuracao.nomeItem}`
            : `Novo cadastro de ${configuracao.nomeItem}`
        }
        aberto={edicao !== null}
        aoFechar={() => setEdicao(null)}
        rodape={
          <>
            <Botao variante="secundario" onClick={() => setEdicao(null)}>
              Cancelar
            </Botao>
            <Botao
              carregando={isSubmitting}
              icone={<Save size={16} />}
              onClick={formulario.handleSubmit(salvar)}
            >
              Salvar
            </Botao>
          </>
        }
      >
        <form className={estilos.formulario} onSubmit={formulario.handleSubmit(salvar)} noValidate>
          {configuracao.campos.map((campo) => (
            <Campo
              key={campo.nome}
              rotulo={campo.rotulo}
              obrigatorio={campo.obrigatorio}
              dica={campo.dica}
              erro={errors[campo.nome]?.message}
            >
              {campo.tipo === 'textoLongo' ? (
                <AreaTexto
                  maxLength={campo.maximoCaracteres}
                  {...formulario.register(campo.nome)}
                />
              ) : (
                <Entrada
                  type={campo.tipo === 'numero' ? 'number' : 'text'}
                  step={campo.passo}
                  min={campo.minimo}
                  maxLength={campo.maximoCaracteres}
                  {...formulario.register(campo.nome)}
                />
              )}
            </Campo>
          ))}
          <button type="submit" hidden />
        </form>
      </Modal>

      <DialogoConfirmacao
        aberto={itemAlterando !== null}
        titulo={itemAlterando?.ativo ? 'Desativar cadastro' : 'Ativar cadastro'}
        mensagem={
          itemAlterando?.ativo
            ? `Ao desativar ${itemAlterando && configuracao.identificar(itemAlterando)}, ele deixa de ser oferecido em novos cálculos e regras. Regras e cálculos existentes continuam válidos.`
            : `${itemAlterando ? configuracao.identificar(itemAlterando) : ''} voltará a ficar disponível.`
        }
        textoConfirmar={itemAlterando?.ativo ? 'Desativar' : 'Ativar'}
        perigoso={itemAlterando?.ativo}
        processando={processando}
        aoConfirmar={confirmarAlteracao}
        aoCancelar={() => setItemAlterando(null)}
      />
    </>
  );
}
