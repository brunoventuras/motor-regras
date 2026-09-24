import { Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { MemoriaCalculo } from '../../componentes/memoria/MemoriaCalculo.tsx';
import { Botao } from '../../componentes/ui/Botao.tsx';
import { CabecalhoPagina } from '../../componentes/ui/CabecalhoPagina.tsx';
import { Carregando } from '../../componentes/ui/Carregando.tsx';
import { Cartao } from '../../componentes/ui/Cartao.tsx';
import { Modal } from '../../componentes/ui/Modal.tsx';
import { Tabela, type ColunaTabela } from '../../componentes/ui/Tabela.tsx';
import { useConsulta } from '../../hooks/useConsulta.ts';
import { listarCalculos, obterCalculo } from '../../servicos/calculos.ts';
import type { CalculoResumo, MemoriaCalculo as Memoria } from '../../tipos/api.ts';
import { formatarDataHora, formatarMoeda, formatarNumero } from '../../utilitarios/formatacao.ts';

const COLUNAS: ColunaTabela<CalculoResumo>[] = [
  { titulo: 'Nº', conteudo: (calculo) => calculo.id, largura: '64px' },
  { titulo: 'Data', conteudo: (calculo) => formatarDataHora(calculo.executadoEm) },
  { titulo: 'Serviço', conteudo: (calculo) => calculo.servicoNome },
  { titulo: 'Categoria', conteudo: (calculo) => calculo.categoriaNome },
  { titulo: 'Região', conteudo: (calculo) => calculo.regiaoNome },
  {
    titulo: 'Qtd.',
    conteudo: (calculo) => formatarNumero(calculo.quantidade),
    alinhamento: 'direita',
  },
  {
    titulo: 'Unitário',
    conteudo: (calculo) => formatarMoeda(calculo.valorUnitarioFinal),
    alinhamento: 'direita',
  },
  {
    titulo: 'Total',
    conteudo: (calculo) => <strong>{formatarMoeda(calculo.valorTotal)}</strong>,
    alinhamento: 'direita',
  },
  { titulo: 'Usuário', conteudo: (calculo) => calculo.usuario.nome },
  {
    titulo: '',
    conteudo: () => (
      <Botao variante="fantasma" compacto icone={<Eye size={15} />} aria-label="Ver memória" />
    ),
    largura: '56px',
  },
];

export function Historico() {
  const { dados: calculos, carregando } = useConsulta(listarCalculos, []);
  const [memoria, setMemoria] = useState<Memoria | null>(null);

  const abrir = async (calculo: CalculoResumo) => {
    try {
      setMemoria(await obterCalculo(calculo.id));
    } catch (erro) {
      toast.error((erro as Error).message);
    }
  };

  return (
    <>
      <CabecalhoPagina
        titulo="Histórico de cálculos"
        descricao="Cada cálculo guarda uma cópia dos preços e das regras usados no momento. Alterar uma regra depois não muda o que está aqui."
      />
      <Cartao semEspaco>
        {carregando ? (
          <Carregando />
        ) : (
          <Tabela
            colunas={COLUNAS}
            itens={calculos}
            chave={(calculo) => calculo.id}
            aoClicarLinha={abrir}
            vazio="Nenhum cálculo realizado ainda. Use o Simulador."
          />
        )}
      </Cartao>
      <Modal
        titulo={memoria ? `Cálculo nº ${memoria.id}` : ''}
        aberto={memoria !== null}
        aoFechar={() => setMemoria(null)}
        largo
      >
        {memoria && <MemoriaCalculo memoria={memoria} />}
      </Modal>
    </>
  );
}
