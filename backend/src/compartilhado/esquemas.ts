import { z } from 'zod';

export const esquemaAtivo = z.object({
  ativo: z.boolean({ error: 'Informe se o registro fica ativo.' }),
});
