import { z } from 'zod';

const idCadastro = (mensagem: string) => z.number({ error: mensagem }).int().positive(mensagem);

export const esquemaCalculo = z.object({
  servicoId: idCadastro('Selecione o serviço.'),
  categoriaClienteId: idCadastro('Selecione a categoria do cliente.'),
  regiaoId: idCadastro('Selecione a região.'),
  quantidade: z
    .number({ error: 'Informe a quantidade.' })
    .int('A quantidade deve ser inteira.')
    .min(1, 'A quantidade mínima é 1.')
    .max(1_000_000, 'A quantidade máxima é 1.000.000.'),
});

export type DadosCalculo = z.infer<typeof esquemaCalculo>;
