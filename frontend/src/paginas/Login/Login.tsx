import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { Botao } from '../../componentes/ui/Botao.tsx';
import { Campo, Entrada } from '../../componentes/ui/Campo.tsx';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.tsx';
import estilos from './Login.module.css';

const esquemaLogin = z.object({
  login: z.string().trim().min(1, 'Informe o login.'),
  senha: z.string().min(1, 'Informe a senha.'),
});

type DadosLogin = z.infer<typeof esquemaLogin>;

const MOSTRAR_ADMIN = import.meta.env.VITE_OCULTAR_ADMIN !== 'true';

export function Login() {
  const { usuario, entrar } = useAutenticacao();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DadosLogin>({ resolver: zodResolver(esquemaLogin) });

  if (usuario) return <Navigate to="/simulador" replace />;

  const enviar = async ({ login, senha }: DadosLogin) => {
    try {
      await entrar(login, senha);
      toast.success('Bem-vindo!');
    } catch (erro) {
      toast.error((erro as Error).message);
    }
  };

  return (
    <div className={estilos.pagina}>
      <div className={estilos.painel}>
        <div className={estilos.marca}>
          <img src="/icone.svg" alt="" width={44} height={44} />
          <div>
            <h1>Motor de Regras</h1>
            <p>Cálculo de valores de serviços · EMTEC</p>
          </div>
        </div>

        <form className={estilos.formulario} onSubmit={handleSubmit(enviar)} noValidate>
          <Campo rotulo="Login" erro={errors.login?.message}>
            <Entrada autoFocus autoComplete="username" {...register('login')} />
          </Campo>
          <Campo rotulo="Senha" erro={errors.senha?.message}>
            <Entrada type="password" autoComplete="current-password" {...register('senha')} />
          </Campo>
          <Botao type="submit" carregando={isSubmitting} icone={<LogIn size={16} />}>
            Entrar
          </Botao>
        </form>

        <div className={estilos.demonstracao}>
          <strong>Usuários de demonstração</strong>
          {MOSTRAR_ADMIN && (
            <span>
              <code>admin</code> / <code>admin123</code> (acesso total)
            </span>
          )}
          <span>
            <code>consulta</code> / <code>consulta123</code> (somente consulta)
          </span>
        </div>
      </div>
    </div>
  );
}
