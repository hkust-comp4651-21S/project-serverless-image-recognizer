import os
from urllib.parse import parse_qs
from bs4 import BeautifulSoup

def handle(req):

    dirname = os.path.dirname(__file__)
    path = os.path.join(dirname, 'index.html')
    with(open(path, 'r')) as file:
        html = file.read()
        soup = BeautifulSoup(html, "html.parser")

    path = os.path.join(dirname, 'index.css')
    with(open(path, 'r')) as file:
        css = file.read()
        style = soup.new_tag('style')
        style.append(BeautifulSoup(css, 'html.parser'))
        soup.head.append(style)

    path = os.path.join(dirname, 'index.js')
    with(open(path, 'r')) as file:
        js = file.read()
        script = soup.new_tag('script')
        script.append(BeautifulSoup(js, 'html.parser'))
        soup.head.append(script)   

    return str(soup)
