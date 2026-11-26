# Pense Mais Uma

Portal em português com cursos interativos para celular. O site público fica em `docs/`. A importação original do ZIP e as mudanças de apresentação estão registradas no histórico do Git.

## Publicação

O GitHub Pages publica a pasta `/docs` da branch `main`. Alterações enviadas a essa branch disparam uma nova publicação. O resultado aparece em **Actions → pages build and deployment**. Na configuração inicial, a prévia pública fica em <https://renatoangelobonfim-spec.github.io/pense-mais-uma/>.

## Edição local

Execute `python -m http.server 8000 --directory docs` na raiz do projeto. Cada curso tem uma apresentação em `docs/cursos/<tema>/index.html` e uma experiência em `jogar.html`. Ao cadastrar um novo curso, inclua a entrada no catálogo e no sitemap.

Antes de enviar, execute `python scripts/verificar.py` com Python 3.9 ou superior e abra o curso no navegador. O verificador confere páginas do catálogo, arquivos locais e entradas do sitemap. As pautas editoriais estão em [Revisão dos cursos](REVISAO-DOS-CURSOS.md).

## Dados de leitores

Nesta versão, a votação e a avaliação da página de apresentação ficam no navegador usado pelo leitor. Não há apuração central configurada. Os arquivos publicados pelo Pages são públicos.
