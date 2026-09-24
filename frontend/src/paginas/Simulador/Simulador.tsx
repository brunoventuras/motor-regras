import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { MemoriaCalculo } from '../../componentes/memoria/MemoriaCalculo.tsx';
import { Botao } from '../../componentes/ui/Botao.tsx';
import { CabecalhoPagina } from '../../componentes/ui/CabecalhoPagina.tsx';
import { Campo, Entrada, Selecao } from '../../componentes/ui/Campo.tsx';
import { Cartao } from '../../componentes/ui/Cartao.tsx';
import { useConsulta } from '../../hooks/useConsulta.ts';
import { executarCalculo } from '../../servicos/calculos.ts';
import { listarCategorias, listarRegioes, listarServicos } from '../../servicos/catalogos.ts';
import type { MemoriaCalculo as Memoria } from '../../tipos/api.ts';
import estilos from './Simulador.module.css';

const selecionado = (mensagem: string) => z.number({ error: mensagem }).int().positive(mensagem);

const esquemaSimulacao = z.object({
  servicoId: selecionado('Selecione o serviço.'),
  categoriaClienteId: selecionado('Selecione a categoria.'),
  regiaoId: selecionado('Selecione a região.'),
  quantidade: z
    .number({ error: 'Informe a quantidade.' })
    .int('Use um número inteiro.')
    .min(1, 'A quantidade mínima é 1.')
    .max(1_000_000, 'A quantidade máxima é 1.000.000.'),
});

type DadosSimulacao = z.infer<typeof esquemaSimulacao>;

/** Carrega somente os cadastros ativos, que são os aceitos em novos cálculos. */
async function carregarOpcoes() {
  const [servicos, categorias, regioes] = await Promise.all([
    listarServicos(),
    listarCategorias(),
    listarRegioes(),
  ]);
  return {
    servicos: servicos.filter((item) => item.ativo),
    categorias: categorias.filter((item) => item.ativo),
    regioes: regioes.filter((item) => item.ativo),
  };
}

export function Simulador() {
  const { dados: opcoes } = useConsulta(useCallback(carregarOpcoes, []), {
    servicos: [],
    categorias: [],
    regioes: [],
  });
  const [memoria, setMemoria] = useState<Memoria | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DadosSimulacao>({
    resolver: zodResolver(esquemaSimulacao),
    defaultValues: { quantidade: 1 },
  });

  const calcular = async (dados: DadosSimulacao) => {
    try {
      setMemoria(await executarCalculo(dados));
      toast.success('Cálculo realizado e registrado no histórico.');
    } catch (erro) {
      toast.error((erro as Error).message);
    }
  };

  const comoNumero = { setValueAs: (valor: string) => (valor === '' ? undefined : Number(valor)) };

  return (
    <>
      <CabecalhoPagina titulo="Simulador" />

      <div className={estilos.grade}>
        <Cartao titulo="Pedido">
          <form className={estilos.formulario} onSubmit={handleSubmit(calcular)} noValidate>
            <Campo rotulo="Serviço" erro={errors.servicoId?.message}>
              <Selecao defaultValue="" {...register('servicoId', comoNumero)}>
                <option value="" disabled>
                  Selecione
                </option>
                {opcoes.servicos.map((servico) => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome}
                  </option>
                ))}
              </Selecao>
            </Campo>
            <Campo rotulo="Categoria do cliente" erro={errors.categoriaClienteId?.message}>
              <Selecao defaultValue="" {...register('categoriaClienteId', comoNumero)}>
                <option value="" disabled>
                  Selecione
                </option>
                {opcoes.categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </Selecao>
            </Campo>
            <Campo rotulo="Região" erro={errors.regiaoId?.message}>
              <Selecao defaultValue="" {...register('regiaoId', comoNumero)}>
                <option value="" disabled>
                  Selecione
                </option>
                {opcoes.regioes.map((regiao) => (
                  <option key={regiao.id} value={regiao.id}>
                    {regiao.nome}
                  </option>
                ))}
              </Selecao>
            </Campo>
            <Campo rotulo="Quantidade" erro={errors.quantidade?.message}>
              <Entrada
                type="number"
                min={1}
                max={1_000_000}
                step={1}
                {...register('quantidade', comoNumero)}
              />
            </Campo>
            <Botao type="submit" carregando={isSubmitting} icone={<Calculator size={16} />}>
              Calcular
            </Botao>
          </form>
        </Cartao>

        <Cartao titulo="Memória de cálculo">
          {memoria ? (
            <MemoriaCalculo memoria={memoria} />
          ) : (
            <p className={estilos.vazio}>Preencha o pedido e clique em Calcular.</p>
          )}
        </Cartao>
      </div>
    </>
  );
}
