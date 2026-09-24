# Motor de Regras de Cálculo

Teste técnico EMTEC: cálculo de valor de serviços com regras configuráveis pela própria aplicação.

## Como iniciar

Requisito: Docker instalado.

```bash
git clone https://github.com/brunoventuras/motor-regras.git
cd motor-regras
docker compose up -d --build
```

Aguarde alguns minutos e acesse **http://localhost:3000**

| Usuário    | Senha         | Permissão                   |
| ---------- | ------------- | --------------------------- |
| `admin`    | `admin123`    | Altera regras e cadastros   |
| `consulta` | `consulta123` | Consulta e executa cálculos |

## Sem internet

Com o arquivo `motor-regras-imagens.tar`, dentro da pasta do projeto:

```bash
docker load -i motor-regras-imagens.tar
docker compose up -d
```

## Parar e recomeçar

```bash
docker compose down      # para a aplicação
docker compose down -v   # para e apaga os dados; ao subir de novo, volta ao estado inicial
```
