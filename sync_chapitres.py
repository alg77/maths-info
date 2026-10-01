"""Synchronise les intitulés publics depuis les exports récents de Progressions/.
Sources explicites ci-dessous ; actualiser SOURCES lors du prochain export.
La 6e reste inchangée tant qu’aucun export de 6e n’est disponible.
Usage, depuis le dépôt : python sync_chapitres.py
Ne publie ni documents, ni calendrier, ni notes de progression.
"""
from pathlib import Path
import argparse
import html
import json
import re

THEMES = {'N':'Nombres et calculs','C':'Calcul mental','G':'Géométrie et espace','M':'Grandeurs et mesures','D':'Organisation et gestion de données','A':'Algorithmique et programmation'}
SOURCES = {5: 'Progressions/progression-5e-v21 (3).json', 4: 'Progressions/progression-4e (1).json'}

START = '<!-- CHAPITRES:START -->'
END = '<!-- CHAPITRES:END -->'

def render(data):
    seq = data.get('seq')
    if not isinstance(seq, list) or not seq:
        raise ValueError('La progression doit contenir une liste seq non vide.')
    groups = {}
    for item in seq:
        if not isinstance(item,dict) or any(not isinstance(item.get(k),str) or not item[k].strip() for k in ('code','title','theme')):
            raise ValueError('Chaque séquence doit avoir un code, un titre et un thème.')
        if item['title'].casefold().startswith('marge de période'):
            continue
        groups.setdefault(item['theme'], []).append(item)
    parts = [START, '<p class="chapters-note">Les thèmes abordés au fil de l’année, regroupés par domaine.</p>']
    for theme,items in groups.items():
        parts.append('<article class="course-card"><h3>'+html.escape(THEMES.get(theme,theme))+'</h3><ul>')
        for item in items:
            parts.append('<li><span class="chapter-title"><span class="chapter-code">'+html.escape(item['code'])+'</span> '+html.escape(item['title'])+'</span></li>')
        parts.append('</ul></article>')
    return '\n'.join(parts+[END])

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parent)
    parser.add_argument('--output',type=Path,help='Dossier des pages ; par défaut le dépôt.')
    args=parser.parse_args(); output=args.output or args.root
    pending=[]
    for level, source in SOURCES.items():
        data=json.loads((args.root/source).read_text(encoding='utf-8-sig'))
        target=output/f'cours_{level}e.html'; page=target.read_text(encoding='utf-8-sig')
        if page.count(START)!=1 or page.count(END)!=1:
            raise ValueError(f'{target}: balises de synchronisation absentes ou dupliquées.')
        page=re.sub(re.escape(START)+r'.*?'+re.escape(END),lambda _:render(data),page,flags=re.S)
        pending.append((target,page,sum(not item['title'].casefold().startswith('marge de période') for item in data['seq'])))
    for target,page,count in pending:
        target.write_text(page,encoding='utf-8')
        print(f'{target.name} : {count} séquences synchronisées')

if __name__=='__main__':
    main()
