import { z } from 'zod';

export const esquemaLogin = z.object({
  login: z.string().trim().min(1, 'Informe o login.'),
  senha: z.string().min(1, 'Informe a senha.'),
});

export type DadosLogin = z.infer<typeof esquemaLogin>;
