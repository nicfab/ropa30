#!/usr/bin/env python3
# ropa30 — scripts/archived.py
# SPDX-License-Identifier: AGPL-3.0-or-later
#
# Riga Archived (CHANGELOG) e tabella delle versioni (wiki IT/EN) per una release:
# DOI di versione da Zenodo, SWHID da Software Heritage, verificati sul tag locale.
# Uso: python3 scripts/archived.py X.Y.Z [--write]   (dalla radice del repository)
import json, re, subprocess, sys, urllib.request
args = [a for a in sys.argv[1:] if not a.startswith('--')]
WRITE = '--write' in sys.argv
if len(args) != 1 or not re.fullmatch(r'\d+\.\d+\.\d+', args[0]):
    sys.exit('Uso: python3 scripts/archived.py X.Y.Z [--write]')
V = args[0]
ORIGIN = 'https://codeberg.org/nicfab/ropa30.git'
SWH = 'https://archive.softwareheritage.org'
def get(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)
def git(*a):
    return subprocess.check_output(['git', *a], text=True).strip()

# Zenodo: DOI della versione
z = get('https://zenodo.org/api/records/21720639/versions/latest')
if z['metadata'].get('version') != 'v' + V:
    sys.exit(f"ERRORE: su Zenodo l'ultima versione e' {z['metadata'].get('version')}, non v{V}. Riprova tra qualche minuto.")
DOI = z['doi']
print(f'OK  Zenodo: v{V} -> {DOI}')

# git: directory, release (tag annotato), commit
DIR = git('rev-parse', f'v{V}^{{tree}}')
REL = git('rev-parse', f'v{V}')
COMMIT = git('rev-parse', '--short=7', f'v{V}^{{commit}}')
if git('cat-file', '-t', f'v{V}') != 'tag':
    sys.exit(f'ERRORE: v{V} non e\' un tag annotato.')
print(f'OK  git: dir {DIR[:12]}…, rel {REL[:12]}…, commit {COMMIT}')

# Software Heritage: oggetti archiviati e snapshot che contiene il tag
for kind, h in (('directory', DIR), ('release', REL)):
    get(f'{SWH}/api/1/{kind}/{h}/')
SNP = get(f'{SWH}/api/1/origin/{ORIGIN}/visit/latest/?require_snapshot=true')['snapshot']
br = get(f'{SWH}/api/1/snapshot/{SNP}/?branches_from=refs/tags/v{V}&branches_count=1')['branches']
if br.get(f'refs/tags/v{V}', {}).get('target') != REL:
    sys.exit(f'ERRORE: lo snapshot {SNP} non contiene refs/tags/v{V} -> {REL}. Salvataggio non ancora completato?')
print(f'OK  Software Heritage: directory e release archiviate; snapshot {SNP[:12]}… contiene v{V}')

# Data della release dal CHANGELOG
cl = open('CHANGELOG.md', encoding='utf-8').read()
m = re.search(rf'^## \[{re.escape(V)}\] - (\d{{4}}-\d{{2}}-\d{{2}})\n\n', cl, re.M)
if not m:
    sys.exit(f'ERRORE: intestazione ## [{V}] non trovata nel CHANGELOG.')
DATA = m.group(1)
if f'## [{V}] - {DATA}\n\nArchived:' in cl:
    sys.exit(f'ERRORE: la riga Archived per {V} e\' gia\' presente.')

URL = f'{SWH}/swh:1:dir:{DIR};origin={ORIGIN};visit=swh:1:snp:{SNP};anchor=swh:1:rel:{REL}'
ARCHIVED = (f'Archived: DOI [{DOI}](https://doi.org/{DOI}) ·\n'
            f'SWHID [`swh:1:dir:{DIR}`]({URL})\n\n')
RIGA = f'| v{V} | {DATA} | [{DOI}](https://doi.org/{DOI}) | [`swh:1:dir:{DIR}`]({URL}) | `{COMMIT}` |\n'

out = {'CHANGELOG.md': cl.replace(m.group(0), m.group(0) + ARCHIVED, 1)}
print('OK  CHANGELOG.md: riga Archived')
for p in ('../ropa30-wiki/Citare-ROPA30.md', '../ropa30-wiki/Citing-ROPA30.md'):
    t = open(p, encoding='utf-8').read()
    if f'| v{V} |' in t:
        sys.exit(f'ERRORE: {p}: riga v{V} gia\' presente.')
    prima = re.search(r'^\| v\d+\.\d+\.\d+ \|.*\n', t, re.M)
    if not prima:
        sys.exit(f'ERRORE: {p}: tabella delle versioni non trovata.')
    out[p] = t[:prima.start()] + RIGA + t[prima.start():]
    print(f'OK  {p}: riga v{V} in cima alla tabella')

if WRITE:
    for p, t in out.items():
        open(p, 'w', encoding='utf-8').write(t)
        print('SCRITTO', p)
else:
    print('DRY-RUN: nessuna modifica. Rilanciare con --write per applicare.')
