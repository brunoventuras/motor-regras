import { Trash2 } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Botao } from '../../componentes/ui/Botao.tsx';
import { Campo, Entrada, Selecao } from '../../componentes/ui/Campo.tsx';
import type { CampoCondicao, Vocabulario } from '../../tipos/api.ts';
import { condicaoVazia, type RegraFormulario } from './formularioRegra.ts';
import estilos from './FormularioRegra.module.css';

export type OpcoesCatalogo = Record<
  Exclude<CampoCondicao, 'quantidade'>,
  { id: number; rotulo: string }[]
>;

interface PropriedadesLinha {
  indice: number;
  vocabulario: Vocabulario;
  opcoes: OpcoesCatalogo;
  aoRemover: () => void;
}

/**
 * Uma condição da regra: campo, operador e valor.
 * O controle de valor muda conforme o tipo do campo e o operador escolhidos.
 */
export function LinhaCondicao({ indice, vocabulario, opcoes, aoRemover }: PropriedadesLinha) {
  const { register, control, setValue, formState } = useFormContext<RegraFormulario>();
  const prefixo = `condicoes.${indice}` as const;
  const campo = useWatch({ control, name: `${prefixo}.campo` });
  const operador = useWatch({ control, name: `${prefixo}.operador` });
  const erros = formState.errors.condicoes?.[indice];

  const definicao = vocabulario.campos.find((item) => item.chave === campo);
  const operadoresPermitidos = vocabulario.operadores.filter((item) =>
    definicao?.operadores.includes(item.chave),
  );

  const trocarCampo = (chave: string) => {
    const novoCampo = vocabulario.campos.find((item) => item.chave === chave);
    if (novoCampo) setValue(prefixo, condicaoVazia(novoCampo.chave, novoCampo.operadores[0]));
  };

  const limparValores = () => {
    setValue(`${prefixo}.valorUnico`, '');
    setValue(`${prefixo}.valorLista`, []);
    setValue(`${prefixo}.valorMinimo`, '');
    setValue(`${prefixo}.valorMaximo`, '');
  };

  const renderizarValor = () => {
    if (operador === 'entre') {
      return (
        <div className={estilos.intervalo}>
          <Campo rotulo="Mínimo" erro={erros?.valorMinimo?.message}>
            <Entrada type="number" min={0} step={1} {...register(`${prefixo}.valorMinimo`)} />
          </Campo>
          <Campo rotulo="Máximo" erro={erros?.valorMaximo?.message}>
            <Entrada type="number" min={0} step={1} {...register(`${prefixo}.valorMaximo`)} />
          </Campo>
        </div>
      );
    }

    if (campo === 'quantidade') {
      return (
        <Campo rotulo="Valor" erro={erros?.valorUnico?.message}>
          <Entrada type="number" min={0} step={1} {...register(`${prefixo}.valorUnico`)} />
        </Campo>
      );
    }

    const itens = opcoes[campo];
    if (operador === 'em') {
      return (
        <Campo rotulo="Valores (qualquer um)" erro={erros?.valorLista?.message}>
          <Controller
            control={control}
            name={`${prefixo}.valorLista`}
            render={({ field }) => (
              <div className={estilos.opcoesMultiplas}>
                {itens.map((item) => {
                  const marcado = field.value.includes(item.id);
                  return (
                    <label key={item.id} className={marcado ? estilos.opcaoMarcada : estilos.opcao}>
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() =>
                          field.onChange(
                            marcado
                              ? field.value.filter((id) => id !== item.id)
                              : [...field.value, item.id],
                          )
                        }
                      />
                      {item.rotulo}
                    </label>
                  );
                })}
              </div>
            )}
          />
        </Campo>
      );
    }

    return (
      <Campo rotulo="Valor" erro={erros?.valorUnico?.message}>
        <Selecao {...register(`${prefixo}.valorUnico`)}>
          <option value="">Selecione</option>
          {itens.map((item) => (
            <option key={item.id} value={item.id}>
              {item.rotulo}
            </option>
          ))}
        </Selecao>
      </Campo>
    );
  };

  return (
    <div className={estilos.condicao}>
      <span className={estilos.conector}>{indice === 0 ? 'Quando' : 'E'}</span>
      <Campo rotulo="Campo">
        <Selecao
          {...register(`${prefixo}.campo`, {
            onChange: (evento) => trocarCampo(evento.target.value),
          })}
        >
          {vocabulario.campos.map((item) => (
            <option key={item.chave} value={item.chave}>
              {item.rotulo}
            </option>
          ))}
        </Selecao>
      </Campo>
      <Campo rotulo="Operador">
        <Selecao {...register(`${prefixo}.operador`, { onChange: limparValores })}>
          {operadoresPermitidos.map((item) => (
            <option key={item.chave} value={item.chave}>
              {item.rotulo}
            </option>
          ))}
        </Selecao>
      </Campo>
      <div className={estilos.valor}>{renderizarValor()}</div>
      <Botao
        variante="fantasma"
        compacto
        icone={<Trash2 size={16} />}
        onClick={aoRemover}
        aria-label="Remover condição"
        className={estilos.remover}
      />
    </div>
  );
}
