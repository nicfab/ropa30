#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ropa30 — Rifinitura mirata: tpl-it-034 (Marketing via email e soft opt-in)
campo preset.tempiConservazione.criteri (IT + EN)

Rimuove il riferimento a "interazione dei destinatari" / "recipient engagement",
coerentemente con il confinamento del tracciamento nel template C (tpl-it-035).

Uso:
  python3 refine_b_retention.py            # DRY-RUN (non scrive nulla)
  python3 refine_b_retention.py --write     # scrive il file
  python3 refine_b_retention.py [path]      # path opzionale (default: public/data/templates.json)

Sicurezza:
  - per ogni stringa OLD: count==1 nel campo bersaglio, altrimenti aborto;
  - validazione json.loads sull'output serializzato prima della scrittura;
  - round-trip di formato per garantire diff minimale.
"""

import sys
import json
import copy

DEFAULT_PATH = "public/data/templates.json"
TARGET_ID = "tpl-it-034-email-marketing-soft-optin"
FIELD_PATH = ["preset", "tempiConservazione", "criteri"]

REPLACEMENTS = [
    {
        "lang": "it",
        "old": "I dati sono conservati per la durata della finalità di marketing e sono soggetti a verifica periodica, almeno annuale, della validità della base giuridica (consenso o sussistenza delle condizioni del soft opt-in), dell'attualità della lista e dell'interazione dei destinatari. La revoca del consenso o l'esercizio dell'opposizione comporta la cessazione immediata dell'invio e la cancellazione dei dati entro un termine definito nella procedura interna, di regola non superiore a 30 giorni, salvo la conservazione di una traccia minima dell'opposizione ai fini probatori per il periodo di prescrizione applicabile.",
        "new": "I dati sono conservati per la durata della finalità di marketing e sono soggetti a verifica periodica, almeno annuale, della validità della base giuridica (consenso o sussistenza delle condizioni del soft opt-in) e dell'attualità della lista. La revoca del consenso o l'esercizio dell'opposizione comporta la cessazione immediata dell'invio e la cancellazione dei dati entro un termine definito nella procedura interna, di regola non superiore a 30 giorni, salvo la conservazione di una traccia minima dell'opposizione ai fini probatori per il periodo di prescrizione applicabile.",
    },
    {
        "lang": "en",
        "old": "Data are kept for the duration of the marketing purpose and are subject to periodic review, at least annually, of the validity of the legal basis (consent or the existence of the soft opt-in conditions), list freshness and recipient engagement. Withdrawal of consent or objection results in immediate cessation of sending and deletion of the data within a term defined in the internal procedure, ordinarily not exceeding 30 days, without prejudice to the retention of a minimal suppression record for evidentiary purposes for the applicable limitation period.",
        "new": "Data are kept for the duration of the marketing purpose and are subject to periodic review, at least annually, of the validity of the legal basis (consent or the existence of the soft opt-in conditions) and list freshness. Withdrawal of consent or objection results in immediate cessation of sending and deletion of the data within a term defined in the internal procedure, ordinarily not exceeding 30 days, without prejudice to the retention of a minimal suppression record for evidentiary purposes for the applicable limitation period.",
    },
]


def detect_format(raw, data):
    variants = [
        ("indent=2, ensure_ascii=False", dict(indent=2, ensure_ascii=False)),
        ("indent=2, ensure_ascii=True", dict(indent=2, ensure_ascii=True)),
        ("indent=4, ensure_ascii=False", dict(indent=4, ensure_ascii=False)),
        ("indent=4, ensure_ascii=True", dict(indent=4, ensure_ascii=True)),
        ("indent='\\t', ensure_ascii=False", dict(indent="\t", ensure_ascii=False)),
    ]
    for name, opts in variants:
        s = json.dumps(data, **opts)
        if s == raw:
            return name, opts, False
        if s + "\n" == raw:
            return name, opts, True
    return None, dict(indent=2, ensure_ascii=False), raw.endswith("\n")


def main():
    args = [a for a in sys.argv[1:]]
    write = "--write" in args
    args = [a for a in args if a != "--write"]
    path = args[0] if args else DEFAULT_PATH

    print("=" * 78)
    print("ropa30 — rifinitura B retention  |  modalità:", "WRITE" if write else "DRY-RUN")
    print("file:", path)
    print("=" * 78)

    with open(path, encoding="utf-8") as f:
        raw = f.read()
    data = json.loads(raw)
    templates = data["templates"]

    fmt_name, fmt_opts, trailing_nl = detect_format(raw, data)
    if fmt_name:
        print(f"Formato file rilevato: {fmt_name}" + (" + newline finale" if trailing_nl else ""))
        print("  → round-trip OK: il diff finale mostrerà SOLO le righe modificate.")
    else:
        print("ATTENZIONE: formato non riconosciuto con round-trip esatto.")

    idx = [i for i, t in enumerate(templates) if t.get("templateId") == TARGET_ID]
    print(f"\n{TARGET_ID}: trovato {len(idx)} volta/e", "[OK]" if len(idx) == 1 else "[FAIL]")
    if len(idx) != 1:
        print("\n*** Target non univoco: nessuna modifica. ***")
        sys.exit(1)

    tpl = templates[idx[0]]
    node = tpl
    for k in FIELD_PATH:
        node = node[k]

    ok = True
    print("\n--- Verifica count==1 ---")
    for r in REPLACEMENTS:
        c = node[r["lang"]].count(r["old"])
        print(f"  criteri {r['lang'].upper()}: count={c}", "[OK]" if c == 1 else "[FAIL]")
        ok &= (c == 1)

    if not ok:
        print("\n*** PRE-CHECK FALLITO: nessuna modifica applicata. ***")
        sys.exit(1)

    new_data = copy.deepcopy(data)
    new_node = new_data["templates"][idx[0]]
    for k in FIELD_PATH:
        new_node = new_node[k]

    print("\n--- before/after ---")
    for r in REPLACEMENTS:
        before = new_node[r["lang"]]
        after = before.replace(r["old"], r["new"], 1)
        new_node[r["lang"]] = after
        print(f"\n[criteri {r['lang'].upper()}]")
        print("  OLD:", r["old"])
        print("  NEW:", r["new"])

    serialized = json.dumps(new_data, **fmt_opts)
    if trailing_nl:
        serialized += "\n"
    try:
        json.loads(serialized)
        print("\njson.loads sull'output: [OK]")
    except Exception as e:
        print("\njson.loads sull'output: [FAIL]", e)
        sys.exit(1)

    if not write:
        print("\nDRY-RUN completato. Nessun file modificato.")
        print("Per scrivere:  python3 refine_b_retention.py --write")
        sys.exit(0)

    with open(path, "w", encoding="utf-8") as f:
        f.write(serialized)
    print(f"\nFILE SCRITTO: {path}")
    print("Esegui ora il diff e validalo prima del commit.")


if __name__ == "__main__":
    main()
