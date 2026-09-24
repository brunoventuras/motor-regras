import type {
  CondicaoMemoria,
  MemoriaCalculo as Memoria,
  OperadorCondicao,
  ResultadoAvaliacao,
} from '../../tipos/api.ts';
import { descreverAcao, formatarMoeda, formatarNumero } from '../../utilitarios/formatacao.ts';
import { Etiqueta, type TomEtiqueta } from '../ui/Etiqueta.tsx';
import estilos from './MemoriaCalculo.module.css';

const RESULTADOS: Record<ResultadoAvaliacao, { rotulo: string; tom: TomEtiqueta }> = {
  aplicada: { rotulo: 'Aplicada', tom: 'sucesso' },
  condicao_nao_atendida: { rotulo: 'Não aplicada', tom: 'neutro' },
  superada_no_grupo: { rotulo: 'Superada no grupo', tom: 'alerta' },
  sem_faixa: { rotulo: 'Sem faixa', tom: 'alerta' },
};

const SIMBOLOS: Record<OperadorCondicao, string> = {
  igual: '=',
  diferente: '≠',
  em: 'em',
  maior: '>',
  maior_igual: '≥',
  menor: '<',
  menor_igual: '≤',
  entre: 'entre',
};

const descreverCondicao = (condicao: CondicaoMemoria) =>
  `${condicao.campoRotulo} ${SIMBOLOS[condicao.operador]} ${condicao.valorRotulo}`;

/** Memória de cálculo no formato do enunciado: valor base, regras avaliadas, valor final e total. */
export function MemoriaCalculo({ memoria }: { memoria: Memoria }) {
  return (
    <table className={estilos.tabela}>
      <thead>
        <tr>
          <th>Regra</th>
          <th>Condições</th>
          <th>Ação</th>
          <th>Resultado</th>
          <th className={estilos.valor}>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Valor base</td>
          <td colSpan={3}>
            {formatarMoeda(memoria.valorBase)} × fator {formatarNumero(memoria.fatorPreco)} (
            {memoria.regiaoNome})
          </td>
          <td className={estilos.valor}>{formatarMoeda(memoria.valorUnitarioInicial)}</td>
        </tr>
        {memoria.regrasAvaliadas.map((regra) => {
          const resultado = RESULTADOS[regra.resultado];
          return (
            <tr
              key={regra.id}
              className={regra.resultado === 'aplicada' ? '' : estilos.naoAplicada}
            >
              <td>
                <strong>{regra.regraCodigo}</strong>
              </td>
              <td>
                {regra.condicoes.length === 0
                  ? 'Sempre'
                  : regra.condicoes.map(descreverCondicao).join(' e ')}
              </td>
              <td>{descreverAcao(regra.tipoAcao, regra.valorAcao)}</td>
              <td>
                <Etiqueta tom={resultado.tom}>{resultado.rotulo}</Etiqueta>
              </td>
              <td className={estilos.valor}>
                {regra.resultado === 'aplicada' ? formatarMoeda(regra.valorDepois) : ''}
              </td>
            </tr>
          );
        })}
        <tr className={estilos.final}>
          <td colSpan={4} className={estilos.valor}>
            Valor final (por unidade)
          </td>
          <td className={estilos.valor}>{formatarMoeda(memoria.valorUnitarioFinal)}</td>
        </tr>
        <tr>
          <td colSpan={4} className={estilos.valor}>
            Quantidade
          </td>
          <td className={estilos.valor}>× {formatarNumero(memoria.quantidade)}</td>
        </tr>
        <tr>
          <td colSpan={5} className={estilos.celulaTotal}>
            <div className={estilos.total}>
              <span>Valor total</span>
              <span>{formatarMoeda(memoria.valorTotal)}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
