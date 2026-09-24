import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { Aviso } from '../../componentes/ui/Aviso.tsx';
import { Botao } from '../../componentes/ui/Botao.tsx';
import { CabecalhoPagina } from '../../componentes/ui/CabecalhoPagina.tsx';
import { Campo, Entrada, Selecao } from '../../componentes/ui/Campo.tsx';
import { Carregando } from '../../componentes/ui/Carregando.tsx';
import { Cartao } from '../../componentes/ui/Cartao.tsx';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.tsx';
import {
  listarCategorias,
  listarFaixas,
  listarGrupos,
  listarRegioes,
  listarServicos,
} from '../../servicos/catalogos.ts';
import { atualizarRegra, criarRegra, obterRegra, obterVocabulario } from '../../servicos/regras.ts';
import type { GrupoRegra, Regra, Vocabulario } from '../../tipos/api.ts';
import { descreverFaixa, formatarDataHora } from '../../utilitarios/formatacao.ts';
import {
  condicaoVazia,
  esquemaRegraFormulario,
  formularioParaApi,
  regraParaFormulario,
  regraVazia,
  type RegraFormulario,
} from './formularioRegra.ts';
import { LinhaCondicao, type OpcoesCatalogo } from './LinhaCondicao.tsx';
import estilos from './FormularioRegra.module.css';

interface DadosApoio {
  vocabulario: Vocabulario;
  opcoes: OpcoesCatalogo;
  grupos: GrupoRegra[];
}

const rotuloItem = (nome: string, ativo: boolean) => (ativo ? nome : `${nome} (desativado)`);

/** Carrega vocabulário e cadastros usados para montar as opções do formulário. */
async function carregarApoio(): Promise<DadosApoio> {
  const [vocabulario, servicos, categorias, regioes, faixas, grupos] = await Promise.all([
    obterVocabulario(),
    listarServicos(),
    listarCategorias(),
    listarRegioes(),
    listarFaixas(),
    listarGrupos(),
  ]);
  const paraOpcoes = (itens: { id: number; nome: string; ativo: boolean }[]) =>
    itens.map((item) => ({ id: item.id, rotulo: rotuloItem(item.nome, item.ativo) }));

  return {
    vocabulario,
    grupos,
    opcoes: {
      servico: paraOpcoes(servicos),
      categoria_cliente: paraOpcoes(categorias),
      regiao: paraOpcoes(regioes),
      faixa_utilizacao: faixas.map((faixa) => ({
        id: faixa.id,
        rotulo: rotuloItem(
          descreverFaixa(faixa.quantidadeInicial, faixa.quantidadeFinal),
          faixa.ativo,
        ),
      })),
    },
  };
}

/** Cadastro e edição de regra. Usuários sem autorização visualizam os dados sem poder alterar. */
export function FormularioRegra() {
  const { id } = useParams();
  const edicao = id !== undefined;
  const navegar = useNavigate();
  const { usuario } = useAutenticacao();
  const somenteLeitura = !usuario?.autorizado;

  const [apoio, setApoio] = useState<DadosApoio | null>(null);
  const [regra, setRegra] = useState<Regra | null>(null);
  const formulario = useForm<RegraFormulario>({
    resolver: zodResolver(esquemaRegraFormulario),
    defaultValues: regraVazia(),
  });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = formulario;
  const condicoes = useFieldArray({ control, name: 'condicoes' });
  const tipoAcao = useWatch({ control, name: 'tipoAcao' });

  const carregar = useCallback(async () => {
    try {
      const [dadosApoio, regraAtual] = await Promise.all([
        carregarApoio(),
        edicao ? obterRegra(Number(id)) : Promise.resolve(null),
      ]);
      setApoio(dadosApoio);
      if (regraAtual) {
        setRegra(regraAtual);
        reset(regraParaFormulario(regraAtual));
      }
    } catch (erro) {
      toast.error((erro as Error).message);
      navegar('/regras');
    }
  }, [edicao, id, navegar, reset]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const salvar = async (dados: RegraFormulario) => {
    try {
      const corpo = formularioParaApi(dados);
      const salva = edicao ? await atualizarRegra(Number(id), corpo) : await criarRegra(corpo);
      toast.success(`Regra ${salva.codigo} salva. Os próximos cálculos já usam esta versão.`);
      navegar('/regras');
    } catch (erro) {
      toast.error((erro as Error).message);
    }
  };

  const adicionarCondicao = () => {
    const primeiro = apoio?.vocabulario.campos[0];
    if (primeiro) condicoes.append(condicaoVazia(primeiro.chave, primeiro.operadores[0]));
  };

  if (!apoio || (edicao && !regra)) return <Carregando />;

  const gruposDisponiveis = apoio.grupos.filter(
    (grupo) => grupo.ativo || grupo.id === regra?.grupoId,
  );
  const acaoPercentual = tipoAcao === 'desconto_percentual' || tipoAcao === 'acrescimo_percentual';

  return (
    <FormProvider {...formulario}>
      <CabecalhoPagina
        titulo={edicao ? `Regra ${regra?.codigo}` : 'Nova regra'}
        descricao={
          regra
            ? `Criada por ${regra.criadoPor.nome} em ${formatarDataHora(regra.criadoEm)} · última alteração por ${regra.atualizadoPor.nome} em ${formatarDataHora(regra.atualizadoEm)}`
            : 'Defina quando a regra se aplica e qual efeito ela tem no valor.'
        }
        acoes={
          <Botao
            variante="secundario"
            icone={<ArrowLeft size={16} />}
            onClick={() => navegar('/regras')}
          >
            Voltar
          </Botao>
        }
      />

      {somenteLeitura && (
        <div className={estilos.avisoTopo}>
          <Aviso>
            Você está no modo consulta. Apenas usuários autorizados podem alterar regras.
          </Aviso>
        </div>
      )}

      <form onSubmit={handleSubmit(salvar)} noValidate>
        <fieldset disabled={somenteLeitura || isSubmitting} className={estilos.secoes}>
          <Cartao titulo="Identificação" compacto>
            <div className={estilos.gradeIdentificacao}>
              <Campo
                rotulo="Código"
                erro={errors.codigo?.message}
                dica="Identificador curto, ex.: R005."
              >
                <Entrada maxLength={20} placeholder="R005" {...register('codigo')} />
              </Campo>
              <Campo rotulo="Nome" erro={errors.nome?.message}>
                <Entrada maxLength={100} {...register('nome')} />
              </Campo>
              <Campo
                rotulo="Prioridade"
                erro={errors.prioridade?.message}
                dica="Menor número é avaliado primeiro."
              >
                <Entrada type="number" min={0} max={9999} step={1} {...register('prioridade')} />
              </Campo>
            </div>
          </Cartao>

          <Cartao
            titulo="Condições"
            ajuda="Todas as condições precisam ser atendidas. Para expressar OU, use o operador 'é um de' ou crie outra regra no mesmo grupo."
            compacto
            acoes={
              !somenteLeitura && (
                <Botao
                  variante="secundario"
                  compacto
                  icone={<Plus size={16} />}
                  onClick={adicionarCondicao}
                >
                  Adicionar condição
                </Botao>
              )
            }
          >
            {condicoes.fields.length === 0 ? (
              <Aviso tom="alerta">Sem condições, esta regra se aplica a todos os cálculos.</Aviso>
            ) : (
              <div className={estilos.listaCondicoes}>
                {condicoes.fields.map((condicao, indice) => (
                  <LinhaCondicao
                    key={condicao.id}
                    indice={indice}
                    vocabulario={apoio.vocabulario}
                    opcoes={apoio.opcoes}
                    aoRemover={() => condicoes.remove(indice)}
                  />
                ))}
              </div>
            )}
          </Cartao>

          <Cartao titulo="Ação e vigência" compacto>
            <div className={estilos.gradeAcao}>
              <Campo rotulo="Ação" erro={errors.tipoAcao?.message}>
                <Selecao {...register('tipoAcao')}>
                  {apoio.vocabulario.tiposAcao.map((tipo) => (
                    <option key={tipo.chave} value={tipo.chave}>
                      {tipo.rotulo}
                    </option>
                  ))}
                </Selecao>
              </Campo>
              {tipoAcao === 'acrescimo_faixa' ? (
                <Campo
                  rotulo="Percentual (%)"
                  dica="O percentual vem da faixa de utilização em que a quantidade se encaixa."
                >
                  <Entrada value="Da faixa da quantidade" disabled readOnly />
                </Campo>
              ) : (
                <Campo
                  rotulo={acaoPercentual ? 'Percentual (%)' : 'Valor por unidade (R$)'}
                  erro={errors.valorAcao?.message}
                >
                  <Entrada type="number" min={0.01} step={0.01} {...register('valorAcao')} />
                </Campo>
              )}
              <Campo
                rotulo="Grupo exclusivo"
                dica="No mesmo grupo, só a primeira regra atendida é aplicada. Sem grupo, a regra acumula com as demais."
              >
                <Selecao {...register('grupoId')}>
                  <option value="">Sem grupo</option>
                  {gruposDisponiveis.map((grupo) => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nome}
                    </option>
                  ))}
                </Selecao>
              </Campo>
              <Campo rotulo="Início da vigência" erro={errors.vigenciaInicio?.message}>
                <Entrada type="date" {...register('vigenciaInicio')} />
              </Campo>
              <Campo
                rotulo="Fim da vigência"
                erro={errors.vigenciaFim?.message}
                dica="Opcional. A regra deixa de valer a partir desta data."
              >
                <Entrada type="date" {...register('vigenciaFim')} />
              </Campo>
            </div>
          </Cartao>

          {!somenteLeitura && (
            <div className={estilos.rodape}>
              <Botao variante="secundario" onClick={() => navegar('/regras')}>
                Cancelar
              </Botao>
              <Botao type="submit" carregando={isSubmitting} icone={<Save size={16} />}>
                Salvar regra
              </Botao>
            </div>
          )}
        </fieldset>
      </form>
    </FormProvider>
  );
}
