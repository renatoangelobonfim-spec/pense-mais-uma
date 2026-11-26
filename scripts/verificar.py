"""Verifica caminhos de páginas e recursos locais do portal antes de publicar."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1] / 'docs'

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('href', 'src', 'poster') and value:
                self.urls.append(value)

def local_files(page):
    parser = Links()
    parser.feed(page.read_text(encoding='utf-8'))
    for value in parser.urls:
        url = urlsplit(value)
        if url.scheme or url.netloc or not url.path:
            continue
        target = (page.parent / unquote(url.path)).resolve()
        if target.is_dir():
            target = target / 'index.html'
        yield target

def main():
    pages = sorted(ROOT.rglob('*.html'))
    courses = sorted((ROOT / 'cursos').glob('*/index.html'))
    catalog = set(local_files(ROOT / 'index.html'))
    defects = []
    for page in pages:
        for target in local_files(page):
            if not target.is_file() or not target.is_relative_to(ROOT):
                defects.append(f'{page.relative_to(ROOT)} → {target}')
    sitemap = {e.text for e in ElementTree.parse(ROOT / 'sitemap.xml').findall('.//{*}loc')}
    for page in courses:
        route = str(page.parent.relative_to(ROOT)) + '/'
        if page not in catalog or page.with_name('jogar.html') not in set(local_files(page)):
            defects.append(f'Acesso ao curso: {route}')
        if f'https://pensemaisuma.com.br/{route}' not in sitemap:
            defects.append(f'Sitemap: {route}')
    if defects:
        raise SystemExit('\n'.join(sorted(set(defects))))
    print(f'{len(pages)} páginas, {len(courses)} cursos e caminhos locais verificados.')

if __name__ == '__main__':
    main()
