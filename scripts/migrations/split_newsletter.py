#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ropa30 — Split del template newsletter/marketing in tre template A/B/C
+ aggiornamento dei rinvii incrociati in tpl-it-004 e tpl-it-010.

Operazioni:
  1. tpl-it-005-newsletter-marketing  →  riscritto come Template A
     (templateId rinominato in tpl-it-005-newsletter-email)
  2. inserimento Template B  tpl-it-034-email-marketing-soft-optin
  3. inserimento Template C  tpl-it-035-marketing-profiling-email-tracking
  4. cross-ref tpl-it-004: 004-1, 004-2, 004-3, 004-4
  5. cross-ref tpl-it-010: 010-1

Uso:
  python3 split_newsletter.py            # DRY-RUN (non scrive nulla)
  python3 split_newsletter.py --write    # scrive il file
  python3 split_newsletter.py [path]     # path opzionale (default: public/data/templates.json)

Sicurezza:
  - ogni sostituzione di stringa richiede count==1 nel campo bersaglio (altrimenti aborto);
  - i set di chiavi di A/B/C sono confrontati con quelli dell'attuale 005;
  - 034/035 non devono già esistere; il conteggio deve passare 33 -> 35;
  - validazione json.loads sull'output serializzato prima della scrittura.
"""

import sys
import json
import copy

DEFAULT_PATH = "public/data/templates.json"

OLD_A_ID = "tpl-it-005-newsletter-marketing"
NEW_A_ID = "tpl-it-005-newsletter-email"
B_ID = "tpl-it-034-email-marketing-soft-optin"
C_ID = "tpl-it-035-marketing-profiling-email-tracking"


# ---------------------------------------------------------------------------
# TEMPLATE A — Newsletter / comunicazioni email
# ---------------------------------------------------------------------------
TEMPLATE_A = {
    "templateId": NEW_A_ID,
    "official": True,
    "categoria": "marketing",
    "settore": "comune",
    "icon": "📨",
    "nome": {
        "it": "Newsletter / comunicazioni email",
        "en": "Newsletter / email communications",
    },
    "descrizioneTemplate": {
        "it": "Invio di newsletter e comunicazioni informative via email a soggetti che ne hanno fatto richiesta (iscrizione). Il template copre esclusivamente la comunicazione informativa richiesta dall'utente, senza marketing promozionale autonomo e senza profilazione o tracciamento. Per il marketing promozionale e il soft opt-in si rinvia al template dedicato (Marketing via email e soft opt-in); per la profilazione e il tracciamento delle interazioni email si rinvia al template dedicato (Profilazione marketing e tracciamento email).",
        "en": "Sending of newsletters and informational communications via email to individuals who have requested them (subscription). The template covers only the informational communication requested by the user, without autonomous promotional marketing and without profiling or tracking. For promotional marketing and soft opt-in, see the dedicated template (Email marketing and soft opt-in); for profiling and tracking of email interactions, see the dedicated template (Marketing profiling and email tracking).",
    },
    "noteTemplate": {
        "it": "Questo template riguarda la sola newsletter informativa, ossia comunicazioni che l'interessato ha espressamente richiesto di ricevere (es. aggiornamenti, contenuti editoriali, comunicazioni di servizio sull'iscrizione). Base giuridica: consenso ex art. 6(1)(a) GDPR per il trattamento dei dati; all'invio di comunicazioni elettroniche si applica anche la disciplina ePrivacy (art. 130 Codice privacy). NON utilizzare questo template per: (a) comunicazioni promozionali/pubblicitarie autonome o soft opt-in verso clienti → template Marketing via email e soft opt-in; (b) profilazione, segmentazione comportamentale, pixel di apertura, click tracking → template Profilazione marketing e tracciamento email. È ammessa esclusivamente la gestione tecnica minima dell'invio: indirizzo email, gestione dei recapiti non recapitabili (bounce), gestione delle disiscrizioni. Se la newsletter veicola anche contenuti promozionali, il trattamento ricade (anche) nel template marketing.",
        "en": "This template concerns the informational newsletter only, i.e. communications that the data subject has expressly requested to receive (e.g. updates, editorial content, service communications about the subscription). Legal basis: consent under GDPR Art. 6(1)(a) for the processing of data; the ePrivacy regime also applies to the sending of electronic communications (Art. 13 of Directive 2002/58/EC). Do NOT use this template for: (a) autonomous promotional/advertising communications or soft opt-in to customers → Email marketing and soft opt-in template; (b) profiling, behavioural segmentation, open pixels, click tracking → Marketing profiling and email tracking template. Only minimal technical management of sending is allowed: email address, handling of undeliverable addresses (bounce), unsubscribe handling. If the newsletter also carries promotional content, the processing falls (also) under the marketing template.",
    },
    "scenari": {
        "it": [
            {"id": "newsletter_informativa", "label": "Newsletter informativa richiesta dall'utente", "art6": "consenso"}
        ],
        "en": [
            {"id": "newsletter_informativa", "label": "Informational newsletter requested by the user", "art6": "consenso"}
        ],
    },
    "preset": {
        "tipoRegistro": "titolare",
        "nome": {
            "it": "Newsletter / comunicazioni email",
            "en": "Newsletter / email communications",
        },
        "descrizione": {
            "it": "Trattamento dei dati di contatto (in particolare l'indirizzo email) per l'invio di newsletter e comunicazioni informative richieste dall'interessato tramite iscrizione, con esclusione di marketing promozionale autonomo, profilazione e tracciamento.",
            "en": "Processing of contact data (in particular the email address) for sending newsletters and informational communications requested by the data subject through subscription, excluding autonomous promotional marketing, profiling and tracking.",
        },
        "finalita": [
            {"it": "Invio di newsletter e comunicazioni informative agli iscritti",
             "en": "Sending of newsletters and informational communications to subscribers"},
            {"it": "Gestione tecnica dell'iscrizione, della disiscrizione e dei recapiti non più validi (bounce)",
             "en": "Technical management of subscription, unsubscription and invalid addresses (bounce)"},
        ],
        "baseGiuridica": {
            "art6": ["consenso"],
            "dettagliArt6": {
                "it": "Consenso libero, specifico, informato e inequivocabile dell'interessato all'iscrizione alla newsletter, revocabile in qualsiasi momento con la stessa facilità con cui è stato prestato, ex art. 6(1)(a) GDPR. All'invio di comunicazioni informative tramite posta elettronica si applica inoltre la disciplina ePrivacy in materia di comunicazioni elettroniche (art. 130 Codice privacy). Il livello ePrivacy va valutato in base al tipo di comunicazione elettronica e agli strumenti utilizzati; marketing e soft opt-in rinviano al template dedicato, tracciamento/profilazione al template dedicato. Il presente template non comprende marketing promozionale autonomo né strumenti di tracciamento/archiviazione nel terminale.",
                "en": "Freely given, specific, informed and unambiguous consent of the data subject to subscribe to the newsletter, withdrawable at any time with the same ease as it was given, under GDPR Art. 6(1)(a). The ePrivacy regime on electronic communications also applies to sending informational communications by email (Art. 13 of Directive 2002/58/EC). The ePrivacy layer must be assessed based on the type of electronic communication and the tools used; marketing and soft opt-in refer to the dedicated template, tracking/profiling to the dedicated template. This template does not include autonomous promotional marketing nor terminal storage/tracking tools.",
            },
            "legittimoInteresseDettagli": {
                "descrizione": {"it": "", "en": ""},
                "garanzieAdottate": {"it": "", "en": ""},
                "bilanciamentoRichiesto": False,
                "bilanciamentoEffettuato": False,
                "riferimentoBilanciamento": {"it": "", "en": ""},
            },
            "art9": [],
            "dettagliArt9": {"it": "", "en": ""},
        },
        "datiCondannePenaliReati": {
            "presenti": False,
            "normativaAutorizzativa": {"it": "", "en": ""},
        },
        "categorieInteressati": [
            {"it": "Iscritti alla newsletter", "en": "Newsletter subscribers"},
        ],
        "categorieDati": [
            {"it": "Indirizzo email", "en": "Email address"},
            {"it": "Nome e cognome (se forniti)", "en": "First and last name (if provided)"},
            {"it": "Preferenze tematiche di base per la selezione dei contenuti (se raccolte, senza profilazione comportamentale)",
             "en": "Basic topic preferences for content selection (if collected, without behavioural profiling)"},
            {"it": "Dati tecnici minimi di gestione dell'invio: stato dell'iscrizione, disiscrizioni, recapiti non recapitabili (bounce)",
             "en": "Minimal technical sending-management data: subscription status, unsubscriptions, undeliverable addresses (bounce)"},
        ],
        "fonteDeiDati": "interessato",
        "categorieDestinatari": [
            {"it": "Personale interno autorizzato (ufficio comunicazione)",
             "en": "Authorized internal personnel (communications department)"},
            {"it": "Fornitore della piattaforma di invio email (responsabile del trattamento ex art. 28 GDPR)",
             "en": "Email sending platform provider (data processor under GDPR Art. 28)"},
        ],
        "responsabiliEsterni": [
            {
                "denominazione": {
                    "it": "[Inserire il nome del fornitore della piattaforma di invio email, es. Mailchimp, Brevo, MailerLite, ecc.]",
                    "en": "[Enter the name of the email sending platform provider, e.g. Mailchimp, Brevo, MailerLite, etc.]",
                },
                "sede": {
                    "it": "[Verificare la sede legale e i Paesi di processing del fornitore]",
                    "en": "[Verify the registered office and processing countries of the provider]",
                },
                "finalita": {
                    "it": "Erogazione del servizio di invio email e gestione delle liste di iscritti",
                    "en": "Provision of the email sending service and management of subscriber lists",
                },
                "accordoArt28Presente": False,
                "riferimentoContratto": {
                    "it": "[Riferimento al DPA sottoscritto o accettato con il fornitore]",
                    "en": "[Reference to the DPA signed or accepted with the provider]",
                },
            }
        ],
        "trasferimentiExtraUE": [
            {
                "paese": "[Verificare in base al fornitore scelto]",
                "garanziaApplicata": "scc",
                "riferimentoDocumentazione": {
                    "it": "Se il fornitore ha sede o sub-responsabili extra-UE (frequentemente USA): Clausole Contrattuali Tipo della Commissione Europea (decisione 2021/914) integrate con eventuale Transfer Impact Assessment (TIA). Verificare anche eventuale certificazione EU-US Data Privacy Framework, ove applicabile.",
                    "en": "If the provider is based or has sub-processors outside the EU (frequently in the USA): EU Standard Contractual Clauses (Commission Decision 2021/914) supplemented by Transfer Impact Assessment (TIA). Also verify any EU-US Data Privacy Framework certification, where applicable.",
                },
            }
        ],
        "tempiConservazione": {
            "periodo": {
                "it": "Fino alla revoca del consenso o alla disiscrizione; verifica periodica almeno annuale.",
                "en": "Until consent is withdrawn or unsubscription; periodic review at least yearly.",
            },
            "criteri": {
                "it": "I dati sono conservati per la durata dell'iscrizione alla newsletter e sono soggetti a verifica periodica, almeno annuale, della validità del consenso e dell'attualità della lista. La verifica può comportare, ove opportuno, cancellazione, sospensione dell'invio, richiesta di riconferma o aggiornamento delle preferenze. La revoca del consenso o la disiscrizione comporta la cessazione immediata dell'invio e la cancellazione dei dati entro un termine definito nella procedura interna, di regola non superiore a 30 giorni, salvo la conservazione di una traccia minima della disiscrizione ai fini probatori per il periodo di prescrizione applicabile.",
                "en": "Data are kept for the duration of the newsletter subscription and are subject to periodic review, at least annually, of the validity of consent and list freshness. The review may lead, where appropriate, to deletion, suspension of sending, re-confirmation or updating of preferences. Withdrawal of consent or unsubscription results in immediate cessation of sending and deletion of the data within a term defined in the internal procedure, ordinarily not exceeding 30 days, without prejudice to the retention of a minimal suppression record for evidentiary purposes for the applicable limitation period.",
            },
            "azioneFinale": "cancellazione",
        },
        "misureSicurezza": {
            "tecniche": [
                {"it": "Cifratura della connessione (HTTPS/TLS) verso la piattaforma di invio email",
                 "en": "Encryption of the connection (HTTPS/TLS) to the email sending platform"},
                {"it": "Autenticazione a due fattori (MFA) sull'account amministrativo della piattaforma",
                 "en": "Two-factor authentication (MFA) on the platform administrative account"},
                {"it": "Backup periodici, se necessari, con cifratura at-rest e controllo degli accessi",
                 "en": "Periodic backups, where necessary, with at-rest encryption and access control"},
                {"it": "Sistema automatico di gestione delle disiscrizioni",
                 "en": "Automatic unsubscribe management system"},
            ],
            "organizzative": [
                {"it": "Designazione degli operatori autorizzati al trattamento (ex art. 29 GDPR)",
                 "en": "Designation of authorized operators (under GDPR Art. 29)"},
                {"it": "Procedura interna per la gestione delle richieste di esercizio dei diritti degli interessati",
                 "en": "Internal procedure for handling data subject rights requests"},
                {"it": "Verifica periodica delle liste e rimozione dei contatti inattivi",
                 "en": "Periodic list review and removal of inactive contacts"},
                {"it": "Audit periodico del fornitore della piattaforma",
                 "en": "Periodic audit of the platform provider"},
            ],
            "rinvioDocumentale": {
                "it": "[Rinvio alla policy di sicurezza informatica del Titolare e al DPA con il fornitore]",
                "en": "[Refer to the Controller's IT security policy and to the DPA with the provider]",
            },
        },
        "processiDecisionaliAutomatizzati": {
            "presenti": False,
            "descrizione": {"it": "", "en": ""},
            "logica": {"it": "", "en": ""},
            "conseguenze": {"it": "", "en": ""},
            "dirittiInteressato": {"it": "", "en": ""},
        },
        "profilazioneMarketing": {
            "presente": False,
            "descrizione": {
                "it": "Non applicabile a questo template. La profilazione marketing, la segmentazione comportamentale e il tracciamento delle interazioni email (aperture, click, pixel) sono trattati nel template dedicato Profilazione marketing e tracciamento email, che attiva un autonomo livello ePrivacy ex art. 122 Codice privacy.",
                "en": "Not applicable to this template. Marketing profiling, behavioural segmentation and tracking of email interactions (opens, clicks, pixels) are covered in the dedicated Marketing profiling and email tracking template, which triggers a separate ePrivacy layer under Art. 5(3) of Directive 2002/58/EC.",
            },
            "logica": {"it": "", "en": ""},
            "baseGiuridicaSpecifica": {"it": "", "en": ""},
        },
        "valutazioneDiImpatto": {
            "effettuata": False,
            "riferimentoDocumento": {
                "it": "DPIA di regola non necessaria per la sola newsletter informativa senza profilazione né tracciamento.",
                "en": "DPIA generally not required for an informational newsletter only, without profiling or tracking.",
            },
        },
        "note": {
            "it": "Riferimenti normativi rilevanti: GDPR artt. 6, 7, 13, 21; Codice privacy (d.lgs. 196/2003) art. 130; Direttiva 2002/58/CE; Linee guida EDPB 05/2020 sul consenso. Per marketing/soft opt-in vedi template Marketing via email e soft opt-in; per profilazione/tracciamento vedi template Profilazione marketing e tracciamento email.",
            "en": "Relevant legal references: GDPR Arts. 6, 7, 13, 21; Directive 2002/58/EC Art. 13; EDPB Guidelines 05/2020 on consent. For marketing/soft opt-in see the Email marketing and soft opt-in template; for profiling/tracking see the Marketing profiling and email tracking template.",
        },
    },
}


# ---------------------------------------------------------------------------
# TEMPLATE B — Marketing via email e soft opt-in
# ---------------------------------------------------------------------------
TEMPLATE_B = {
    "templateId": B_ID,
    "official": True,
    "categoria": "marketing",
    "settore": "comune",
    "icon": "📣",
    "nome": {
        "it": "Marketing via email e soft opt-in",
        "en": "Email marketing and soft opt-in",
    },
    "descrizioneTemplate": {
        "it": "Invio di comunicazioni promozionali e pubblicitarie via email. Il template prevede due scenari giuridici alternativi e nettamente distinti, da scegliere in base ai destinatari: (A) consenso ex art. 6(1)(a) GDPR per prospect e non clienti; (B) soft opt-in ex art. 130 c.4 Codice privacy per clienti acquisiti, limitatamente a prodotti/servizi analoghi. Non comprende profilazione, segmentazione comportamentale o tracciamento delle interazioni, trattati nel template dedicato (Profilazione marketing e tracciamento email).",
        "en": "Sending of promotional and advertising communications via email. The template provides two alternative and clearly distinct legal scenarios, to be selected based on recipients: (A) consent under GDPR Art. 6(1)(a) for prospects and non-customers; (B) soft opt-in under Art. 13(2) of Directive 2002/58/EC for existing customers, limited to similar goods/services. It does not include profiling, behavioural segmentation or interaction tracking, which are covered in the dedicated template (Marketing profiling and email tracking).",
    },
    "noteTemplate": {
        "it": "DUE SCENARI ALTERNATIVI. (A) Marketing a prospect/non clienti → consenso libero, specifico, informato e inequivocabile ex art. 6(1)(a) GDPR + art. 130 c.1-2 Codice privacy. (B) Marketing a clienti acquisiti per prodotti/servizi analoghi → soft opt-in ex art. 130 c.4 Codice privacy. Il soft opt-in non è un legittimo interesse ordinario, ma una disciplina speciale fondata sulla normativa ePrivacy, applicabile solo al ricorrere di condizioni cumulative: dati raccolti nel contesto di una vendita; prodotti/servizi analoghi; marketing del Titolare (non di terzi); informativa al momento della raccolta; opposizione agevole fin dall'inizio e in ogni comunicazione. ATTENZIONE: il valore 'legittimo interesse' associato allo scenario soft opt-in è una mera convenzione tecnica del modello dati e NON va inteso come ricorso all'art. 6(1)(f) GDPR per finalità di marketing. Profilazione e tracciamento delle interazioni (aperture, click, pixel) NON rientrano in questo template: vedi template Profilazione marketing e tracciamento email.",
        "en": "TWO ALTERNATIVE SCENARIOS. (A) Marketing to prospects/non-customers → freely given, specific, informed and unambiguous consent under GDPR Art. 6(1)(a) + Art. 13(1) of Directive 2002/58/EC. (B) Marketing to existing customers for similar goods/services → soft opt-in under Art. 13(2) of Directive 2002/58/EC. Soft opt-in is not an ordinary legitimate interest, but a specific ePrivacy-based regime, applicable only where cumulative conditions are met: data collected in the context of a sale; similar goods/services; marketing by the Controller (not third parties); information notice at collection time; easy objection from the outset and in every communication. WARNING: the 'legitimate interest' value associated with the soft opt-in scenario is a mere technical convention of the data model and must NOT be understood as relying on GDPR Art. 6(1)(f) for marketing purposes. Profiling and tracking of interactions (opens, clicks, pixels) do NOT fall under this template: see the Marketing profiling and email tracking template.",
    },
    "scenari": {
        "it": [
            {"id": "prospect", "label": "Marketing a prospect e non clienti", "art6": "consenso"},
            {"id": "clienti_soft_optin", "label": "Marketing a clienti acquisiti (soft opt-in)", "art6": "legittimo_interesse"},
        ],
        "en": [
            {"id": "prospect", "label": "Marketing to prospects and non-customers", "art6": "consenso"},
            {"id": "clienti_soft_optin", "label": "Marketing to existing customers (soft opt-in)", "art6": "legittimo_interesse"},
        ],
    },
    "preset": {
        "tipoRegistro": "titolare",
        "nome": {
            "it": "Marketing via email e soft opt-in",
            "en": "Email marketing and soft opt-in",
        },
        "descrizione": {
            "it": "Trattamento dei dati di contatto per l'invio di comunicazioni promozionali e pubblicitarie sui prodotti/servizi del Titolare, secondo due scenari alternativi: consenso per prospect/non clienti; soft opt-in per clienti acquisiti limitatamente a prodotti/servizi analoghi.",
            "en": "Processing of contact data for sending promotional and advertising communications about the Controller's products/services, under two alternative scenarios: consent for prospects/non-customers; soft opt-in for existing customers limited to similar goods/services.",
        },
        "finalita": [
            {"it": "Invio di comunicazioni promozionali e pubblicitarie su prodotti e servizi del Titolare a prospect/non clienti, previo consenso",
             "en": "Sending of promotional and advertising communications about the Controller's products and services to prospects/non-customers, subject to consent"},
            {"it": "Invio di comunicazioni promozionali su prodotti/servizi analoghi a clienti acquisiti, in regime di soft opt-in",
             "en": "Sending of promotional communications about similar goods/services to existing customers, under the soft opt-in regime"},
        ],
        "baseGiuridica": {
            "art6": ["consenso", "legittimo_interesse"],
            "dettagliArt6": {
                "it": "Scenario A (prospect/non clienti): consenso libero, specifico, informato e inequivocabile, revocabile in qualsiasi momento ex art. 6(1)(a) GDPR e art. 130 c.1-2 Codice privacy. Scenario B (clienti acquisiti): soft opt-in ex art. 130 c.4 Codice privacy, applicabile esclusivamente quando: i dati siano stati raccolti dal Titolare nel contesto di una vendita; le comunicazioni riguardino prodotti/servizi analoghi; il marketing sia del Titolare e non di terzi; l'interessato sia stato informato al momento della raccolta e abbia avuto la possibilità di opporsi sin dall'inizio e in ogni successiva comunicazione, in modo agevole. Il soft opt-in non è un legittimo interesse ordinario, ma una disciplina speciale fondata sulla normativa ePrivacy: il valore 'legittimo_interesse' associato a tale scenario è una convenzione del modello dati e non comporta l'applicazione dell'art. 6(1)(f) GDPR per finalità di marketing.",
                "en": "Scenario A (prospects/non-customers): freely given, specific, informed and unambiguous consent, withdrawable at any time under GDPR Art. 6(1)(a) and Art. 13(1) of Directive 2002/58/EC. Scenario B (existing customers): soft opt-in under Art. 13(2) of Directive 2002/58/EC, applicable exclusively where: data were collected by the Controller in the context of a sale; communications concern similar goods/services; marketing is by the Controller and not third parties; the data subject was informed at collection time and could object from the outset and in every subsequent communication, easily. Soft opt-in is not an ordinary legitimate interest but a specific ePrivacy-based regime: the 'legitimate interest' value associated with this scenario is a data-model convention and does not entail applying GDPR Art. 6(1)(f) for marketing purposes.",
            },
            "legittimoInteresseDettagli": {
                "descrizione": {
                    "it": "Compilare solo nello Scenario B (soft opt-in ex art. 130 c.4 Codice privacy). Il soft opt-in non è un legittimo interesse ordinario, ma una disciplina speciale ePrivacy soggetta a condizioni cumulative: (1) dati raccolti nel contesto di una vendita; (2) prodotti/servizi analoghi a quelli oggetto della vendita; (3) marketing del Titolare e non di terzi; (4) informativa al momento della raccolta; (5) opposizione agevole fin dall'inizio e in ogni comunicazione (es. link di disiscrizione in ogni messaggio).",
                    "en": "Complete only in Scenario B (soft opt-in under Art. 13(2) of Directive 2002/58/EC). Soft opt-in is not an ordinary legitimate interest but a specific ePrivacy regime subject to cumulative conditions: (1) data collected in the context of a sale; (2) goods/services similar to those of the sale; (3) marketing by the Controller and not third parties; (4) information notice at collection time; (5) easy objection from the outset and in every communication (e.g. unsubscribe link in every message).",
                },
                "garanzieAdottate": {
                    "it": "Informativa preventiva chiara fornita al momento della raccolta; possibilità di opposizione gratuita e immediata in ogni comunicazione (link di disiscrizione); limitazione rigorosa a prodotti/servizi analoghi a quelli oggetto del contratto; documentazione delle condizioni di applicabilità del soft opt-in.",
                    "en": "Clear prior notice provided at the time of data collection; free and immediate objection in every communication (unsubscribe link); strict limitation to goods/services similar to those covered by the contract; documentation of soft opt-in applicability conditions.",
                },
                "bilanciamentoRichiesto": False,
                "bilanciamentoEffettuato": False,
                "riferimentoBilanciamento": {
                    "it": "Documentare la verifica delle condizioni cumulative di applicabilità del soft opt-in. Non si tratta di un bilanciamento (LIA) ex art. 6(1)(f) GDPR.",
                    "en": "Document the verification of the cumulative soft opt-in applicability conditions. This is not a balancing test (LIA) under GDPR Art. 6(1)(f).",
                },
            },
            "art9": [],
            "dettagliArt9": {"it": "", "en": ""},
        },
        "datiCondannePenaliReati": {
            "presenti": False,
            "normativaAutorizzativa": {"it": "", "en": ""},
        },
        "categorieInteressati": [
            {"it": "Prospect e non clienti (Scenario A: consenso)", "en": "Prospects and non-customers (Scenario A: consent)"},
            {"it": "Clienti del Titolare (Scenario B: soft opt-in)", "en": "Customers of the Controller (Scenario B: soft opt-in)"},
        ],
        "categorieDati": [
            {"it": "Indirizzo email", "en": "Email address"},
            {"it": "Nome e cognome (se forniti)", "en": "First and last name (if provided)"},
            {"it": "Dati relativi a prodotti/servizi di interesse o, nello Scenario B, ai prodotti/servizi acquistati (per la verifica dell'analogia)",
             "en": "Data on products/services of interest or, in Scenario B, on purchased products/services (to verify similarity)"},
            {"it": "Dati tecnici minimi di gestione dell'invio e delle disiscrizioni (opt-out)",
             "en": "Minimal technical data for managing sending and unsubscriptions (opt-out)"},
        ],
        "fonteDeiDati": "interessato",
        "categorieDestinatari": [
            {"it": "Personale interno autorizzato (ufficio marketing/comunicazione)",
             "en": "Authorized internal personnel (marketing/communications department)"},
            {"it": "Fornitore della piattaforma di email marketing (responsabile del trattamento ex art. 28 GDPR)",
             "en": "Email marketing platform provider (data processor under GDPR Art. 28)"},
        ],
        "responsabiliEsterni": [
            {
                "denominazione": {
                    "it": "[Inserire il nome del fornitore della piattaforma di email marketing, es. Mailchimp, Brevo, MailerLite, ecc.]",
                    "en": "[Enter the name of the email marketing platform provider, e.g. Mailchimp, Brevo, MailerLite, etc.]",
                },
                "sede": {
                    "it": "[Verificare la sede legale e i Paesi di processing del fornitore]",
                    "en": "[Verify the registered office and processing countries of the provider]",
                },
                "finalita": {
                    "it": "Erogazione del servizio di invio massivo di email marketing e gestione delle liste",
                    "en": "Provision of the bulk email marketing sending service and list management",
                },
                "accordoArt28Presente": False,
                "riferimentoContratto": {
                    "it": "[Riferimento al DPA sottoscritto o accettato con il fornitore]",
                    "en": "[Reference to the DPA signed or accepted with the provider]",
                },
            }
        ],
        "trasferimentiExtraUE": [
            {
                "paese": "[Verificare in base al fornitore scelto]",
                "garanziaApplicata": "scc",
                "riferimentoDocumentazione": {
                    "it": "Se il fornitore ha sede o sub-responsabili extra-UE (frequentemente USA): Clausole Contrattuali Tipo della Commissione Europea (decisione 2021/914) integrate con eventuale Transfer Impact Assessment (TIA). Verificare anche eventuale certificazione EU-US Data Privacy Framework, ove applicabile.",
                    "en": "If the provider is based or has sub-processors outside the EU (frequently in the USA): EU Standard Contractual Clauses (Commission Decision 2021/914) supplemented by Transfer Impact Assessment (TIA). Also verify any EU-US Data Privacy Framework certification, where applicable.",
                },
            }
        ],
        "tempiConservazione": {
            "periodo": {
                "it": "Fino alla revoca del consenso (Scenario A) o all'esercizio dell'opposizione (Scenario B); verifica periodica almeno annuale.",
                "en": "Until consent is withdrawn (Scenario A) or objection is exercised (Scenario B); periodic review at least yearly.",
            },
            "criteri": {
                "it": "I dati sono conservati per la durata della finalità di marketing e sono soggetti a verifica periodica, almeno annuale, della validità della base giuridica (consenso o sussistenza delle condizioni del soft opt-in), dell'attualità della lista e dell'interazione dei destinatari. La revoca del consenso o l'esercizio dell'opposizione comporta la cessazione immediata dell'invio e la cancellazione dei dati entro un termine definito nella procedura interna, di regola non superiore a 30 giorni, salvo la conservazione di una traccia minima dell'opposizione ai fini probatori per il periodo di prescrizione applicabile.",
                "en": "Data are kept for the duration of the marketing purpose and are subject to periodic review, at least annually, of the validity of the legal basis (consent or the existence of the soft opt-in conditions), list freshness and recipient engagement. Withdrawal of consent or objection results in immediate cessation of sending and deletion of the data within a term defined in the internal procedure, ordinarily not exceeding 30 days, without prejudice to the retention of a minimal suppression record for evidentiary purposes for the applicable limitation period.",
            },
            "azioneFinale": "cancellazione",
        },
        "misureSicurezza": {
            "tecniche": [
                {"it": "Cifratura della connessione (HTTPS/TLS) verso la piattaforma di email marketing",
                 "en": "Encryption of the connection (HTTPS/TLS) to the email marketing platform"},
                {"it": "Autenticazione a due fattori (MFA) sull'account amministrativo della piattaforma",
                 "en": "Two-factor authentication (MFA) on the platform administrative account"},
                {"it": "Backup periodici, se necessari, con cifratura at-rest e controllo degli accessi",
                 "en": "Periodic backups, where necessary, with at-rest encryption and access control"},
                {"it": "Sistema automatico di gestione delle disiscrizioni/opt-out in ogni comunicazione",
                 "en": "Automatic unsubscribe/opt-out management system in every communication"},
            ],
            "organizzative": [
                {"it": "Designazione degli operatori autorizzati al trattamento (ex art. 29 GDPR)",
                 "en": "Designation of authorized operators (under GDPR Art. 29)"},
                {"it": "Procedura interna per la gestione delle richieste di esercizio dei diritti e delle opposizioni",
                 "en": "Internal procedure for handling rights requests and objections"},
                {"it": "Documentazione delle condizioni di applicabilità del soft opt-in per i clienti (Scenario B)",
                 "en": "Documentation of soft opt-in applicability conditions for customers (Scenario B)"},
                {"it": "Verifica periodica delle liste e separazione dei flussi consenso/soft opt-in",
                 "en": "Periodic list review and separation of consent/soft opt-in flows"},
            ],
            "rinvioDocumentale": {
                "it": "[Rinvio alla policy di sicurezza informatica del Titolare e al DPA con il fornitore]",
                "en": "[Refer to the Controller's IT security policy and to the DPA with the provider]",
            },
        },
        "processiDecisionaliAutomatizzati": {
            "presenti": False,
            "descrizione": {"it": "", "en": ""},
            "logica": {"it": "", "en": ""},
            "conseguenze": {"it": "", "en": ""},
            "dirittiInteressato": {"it": "", "en": ""},
        },
        "profilazioneMarketing": {
            "presente": False,
            "descrizione": {
                "it": "Non applicabile a questo template. La profilazione marketing e il tracciamento delle interazioni email sono trattati nel template dedicato Profilazione marketing e tracciamento email.",
                "en": "Not applicable to this template. Marketing profiling and email interaction tracking are covered in the dedicated Marketing profiling and email tracking template.",
            },
            "logica": {"it": "", "en": ""},
            "baseGiuridicaSpecifica": {"it": "", "en": ""},
        },
        "valutazioneDiImpatto": {
            "effettuata": False,
            "riferimentoDocumento": {
                "it": "Valutare la necessità di una DPIA ex art. 35 GDPR in caso di invio massivo verso categorie vulnerabili (es. minori). Per la profilazione su larga scala vedi template Profilazione marketing e tracciamento email.",
                "en": "Assess the need for a DPIA under GDPR Art. 35 in case of massive sending toward vulnerable categories (e.g. minors). For large-scale profiling see the Marketing profiling and email tracking template.",
            },
        },
        "note": {
            "it": "Riferimenti normativi rilevanti: GDPR artt. 6, 7, 13, 21; Codice privacy (d.lgs. 196/2003) art. 130, commi 1-2 e 4; Direttiva 2002/58/CE art. 13; Linee guida EDPB 05/2020 sul consenso; provvedimenti del Garante in materia di marketing e soft opt-in. Per la profilazione e il tracciamento vedi template Profilazione marketing e tracciamento email.",
            "en": "Relevant legal references: GDPR Arts. 6, 7, 13, 21; Directive 2002/58/EC Art. 13; EDPB Guidelines 05/2020 on consent. For profiling and tracking see the Marketing profiling and email tracking template.",
        },
    },
}


# ---------------------------------------------------------------------------
# TEMPLATE C — Profilazione marketing e tracciamento email
# ---------------------------------------------------------------------------
TEMPLATE_C = {
    "templateId": C_ID,
    "official": True,
    "categoria": "marketing",
    "settore": "comune",
    "icon": "🎯",
    "nome": {
        "it": "Profilazione marketing e tracciamento email",
        "en": "Marketing profiling and email tracking",
    },
    "descrizioneTemplate": {
        "it": "Profilazione a fini di marketing e tracciamento delle interazioni con le comunicazioni email: aperture, click, pixel di tracciamento, segmentazione comportamentale e personalizzazione dei contenuti in base al comportamento dell'interessato. Il template gestisce il doppio binario GDPR/ePrivacy: base giuridica del trattamento (consenso ex art. 6(1)(a) GDPR) e autonoma condizione di liceità per l'archiviazione/accesso a informazioni nel terminale (art. 122 Codice privacy).",
        "en": "Profiling for marketing purposes and tracking of interactions with email communications: opens, clicks, tracking pixels, behavioural segmentation and content personalisation based on the data subject's behaviour. The template manages the GDPR/ePrivacy dual track: the legal basis for processing (consent under GDPR Art. 6(1)(a)) and the separate lawfulness condition for storing/accessing information on the terminal equipment (Art. 5(3) of Directive 2002/58/EC).",
    },
    "noteTemplate": {
        "it": "DOPPIO BINARIO GDPR/ePRIVACY. La profilazione marketing richiede di regola un consenso specifico e granulare, ulteriore e distinto rispetto al consenso per la newsletter o per il marketing ordinario. Inoltre, il tracciamento delle interazioni via email (pixel di apertura, click tracking, web beacon o strumenti analoghi), ove comporti l'archiviazione di informazioni nel terminale dell'utente o l'accesso a informazioni già archiviate, richiede un'autonoma verifica ai sensi dell'art. 122 Codice privacy (che recepisce l'art. 5(3) della Direttiva 2002/58/CE): salvo eccezioni tecniche applicabili, è richiesto un ulteriore consenso, distinto dalla base giuridica GDPR del trattamento. La profilazione marketing è cosa distinta dall'art. 22 GDPR: di regola non si producono decisioni con effetti giuridici o significativi, ma comunicazioni personalizzate; l'art. 22 va valutato solo se la profilazione alimenta decisioni automatizzate con tali effetti. Valutare la necessità di una DPIA ex art. 35 GDPR in caso di profilazione su larga scala.",
        "en": "GDPR/ePRIVACY DUAL TRACK. Marketing profiling generally requires specific and granular consent, additional to and distinct from the consent for the newsletter or for ordinary marketing. In addition, tracking interactions via email (open pixels, click tracking, web beacons or similar tools), where such tracking involves storing information on the user's terminal equipment or accessing information already stored, requires a separate assessment under Art. 5(3) of Directive 2002/58/EC: unless a technical exemption applies, an additional consent is required, distinct from the GDPR legal basis for the processing. Marketing profiling is distinct from GDPR Art. 22: it generally produces no decisions with legal or significant effects, only personalised communications; Art. 22 must be assessed only where profiling feeds automated decisions with such effects. Assess the need for a DPIA under GDPR Art. 35 in case of large-scale profiling.",
    },
    "scenari": {
        "it": [
            {"id": "tracciamento_email", "label": "Tracciamento delle interazioni email (aperture, click, pixel)", "art6": "consenso"},
            {"id": "profilazione_segmentazione", "label": "Profilazione e segmentazione comportamentale", "art6": "consenso"},
        ],
        "en": [
            {"id": "tracciamento_email", "label": "Email interaction tracking (opens, clicks, pixels)", "art6": "consenso"},
            {"id": "profilazione_segmentazione", "label": "Profiling and behavioural segmentation", "art6": "consenso"},
        ],
    },
    "preset": {
        "tipoRegistro": "titolare",
        "nome": {
            "it": "Profilazione marketing e tracciamento email",
            "en": "Marketing profiling and email tracking",
        },
        "descrizione": {
            "it": "Trattamento dei dati di interazione con le comunicazioni email e dei dati comportamentali per la profilazione a fini di marketing, la segmentazione e la personalizzazione dei contenuti, con tracciamento tramite pixel, click tracking e strumenti analoghi.",
            "en": "Processing of email interaction data and behavioural data for marketing profiling, segmentation and content personalisation, with tracking via pixels, click tracking and similar tools.",
        },
        "finalita": [
            {"it": "Tracciamento delle aperture, dei click e delle interazioni con le comunicazioni email",
             "en": "Tracking of opens, clicks and interactions with email communications"},
            {"it": "Profilazione e segmentazione comportamentale dei destinatari a fini di marketing",
             "en": "Behavioural profiling and segmentation of recipients for marketing purposes"},
            {"it": "Personalizzazione dei contenuti e delle offerte in base al comportamento",
             "en": "Personalisation of content and offers based on behaviour"},
        ],
        "baseGiuridica": {
            "art6": ["consenso"],
            "dettagliArt6": {
                "it": "Consenso specifico e granulare ex art. 6(1)(a) GDPR per la profilazione a fini di marketing, distinto e ulteriore rispetto al consenso per la newsletter o per il marketing ordinario. Il tracciamento delle interazioni via email che comporti l'archiviazione di informazioni nel terminale dell'utente o l'accesso a informazioni già archiviate (pixel, web beacon, identificatori) richiede inoltre un'autonoma condizione di liceità ex art. 122 Codice privacy (recepimento dell'art. 5(3) Direttiva 2002/58/CE): salvo eccezioni tecniche applicabili, è necessario il consenso dell'utente, distinto dalla base giuridica GDPR. Ove la profilazione alimenti decisioni automatizzate con effetti giuridici o analogamente significativi, si applica altresì l'art. 22 GDPR (vedi sezione dedicata).",
                "en": "Specific and granular consent under GDPR Art. 6(1)(a) for profiling for marketing purposes, distinct from and additional to the consent for the newsletter or for ordinary marketing. Tracking of email interactions that involves storing information on the user's terminal equipment or accessing information already stored (pixels, web beacons, identifiers) also requires a separate lawfulness condition under Art. 5(3) of Directive 2002/58/EC: unless a technical exemption applies, the user's consent is required, distinct from the GDPR legal basis. Where profiling feeds automated decisions with legal or similarly significant effects, GDPR Art. 22 also applies (see dedicated section).",
            },
            "legittimoInteresseDettagli": {
                "descrizione": {"it": "", "en": ""},
                "garanzieAdottate": {"it": "", "en": ""},
                "bilanciamentoRichiesto": False,
                "bilanciamentoEffettuato": False,
                "riferimentoBilanciamento": {"it": "", "en": ""},
            },
            "art9": [],
            "dettagliArt9": {"it": "", "en": ""},
        },
        "datiCondannePenaliReati": {
            "presenti": False,
            "normativaAutorizzativa": {"it": "", "en": ""},
        },
        "categorieInteressati": [
            {"it": "Destinatari delle comunicazioni email soggetti a tracciamento/profilazione (previo consenso)",
             "en": "Recipients of email communications subject to tracking/profiling (subject to consent)"},
        ],
        "categorieDati": [
            {"it": "Indirizzo email e identificativo del destinatario", "en": "Email address and recipient identifier"},
            {"it": "Dati di interazione con le comunicazioni: aperture, click, orari, dispositivo/client di posta, link selezionati",
             "en": "Communication interaction data: opens, clicks, timestamps, device/mail client, links selected"},
            {"it": "Identificatori associati a pixel di tracciamento, web beacon o strumenti analoghi",
             "en": "Identifiers associated with tracking pixels, web beacons or similar tools"},
            {"it": "Profili, segmenti e preferenze comportamentali derivati",
             "en": "Derived profiles, segments and behavioural preferences"},
        ],
        "fonteDeiDati": "interessato",
        "categorieDestinatari": [
            {"it": "Personale interno autorizzato (ufficio marketing)",
             "en": "Authorized internal personnel (marketing department)"},
            {"it": "Fornitore della piattaforma di email marketing con funzionalità di tracciamento/profilazione (responsabile ex art. 28 GDPR)",
             "en": "Email marketing platform provider with tracking/profiling features (processor under GDPR Art. 28)"},
            {"it": "Eventuali fornitori di strumenti di tracciamento/analytics di terze parti (ruolo privacy da verificare: responsabile, titolare autonomo o contitolare)",
             "en": "Any third-party tracking/analytics tool providers (privacy role to be verified: processor, independent controller or joint controller)"},
        ],
        "responsabiliEsterni": [
            {
                "denominazione": {
                    "it": "[Inserire il nome del fornitore della piattaforma di email marketing con funzionalità di tracciamento/profilazione]",
                    "en": "[Enter the name of the email marketing platform provider with tracking/profiling features]",
                },
                "sede": {
                    "it": "[Verificare la sede legale e i Paesi di processing del fornitore]",
                    "en": "[Verify the registered office and processing countries of the provider]",
                },
                "finalita": {
                    "it": "Erogazione del servizio di invio email con tracciamento delle interazioni e funzionalità di profilazione/segmentazione",
                    "en": "Provision of the email sending service with interaction tracking and profiling/segmentation features",
                },
                "accordoArt28Presente": False,
                "riferimentoContratto": {
                    "it": "[Riferimento al DPA sottoscritto o accettato con il fornitore]",
                    "en": "[Reference to the DPA signed or accepted with the provider]",
                },
            },
            {
                "denominazione": {
                    "it": "[Inserire eventuali strumenti di tracciamento/analytics di terze parti — verificare il ruolo privacy per ciascuno]",
                    "en": "[Enter any third-party tracking/analytics tools — verify the privacy role for each]",
                },
                "sede": {
                    "it": "[Sede legale e Paesi di processing — spesso extra-UE]",
                    "en": "[Registered office and processing countries — often non-EU]",
                },
                "finalita": {
                    "it": "Tracciamento delle interazioni, misurazione e profilazione a fini di marketing",
                    "en": "Interaction tracking, measurement and profiling for marketing purposes",
                },
                "accordoArt28Presente": False,
                "riferimentoContratto": {
                    "it": "[Riferimento alla documentazione contrattuale / condizioni del provider]",
                    "en": "[Reference to the contractual documentation / provider terms]",
                },
            },
        ],
        "trasferimentiExtraUE": [
            {
                "paese": "[Verificare per ciascuno strumento — frequentemente USA per tracking/analytics di terze parti]",
                "garanziaApplicata": "da_verificare",
                "riferimentoDocumentazione": {
                    "it": "Gli strumenti di tracciamento/profilazione, in particolare di terze parti, comportano frequentemente trasferimenti extra-UE. Verificare per ciascuno: ruolo privacy, finalità, durata, garanzie (adeguatezza, SCC + TIA, certificazione DPF ove pertinente).",
                    "en": "Tracking/profiling tools, particularly third-party ones, frequently involve non-EU transfers. Verify for each: privacy role, purpose, duration, safeguards (adequacy, SCC + TIA, DPF certification where relevant).",
                },
            }
        ],
        "tempiConservazione": {
            "periodo": {
                "it": "Fino alla revoca del consenso; verifica periodica almeno annuale del consenso e dell'attualità dei profili.",
                "en": "Until consent is withdrawn; periodic review at least yearly of consent and profile relevance.",
            },
            "criteri": {
                "it": "I dati di interazione e i profili derivati sono conservati per la durata della finalità di profilazione/tracciamento e sono soggetti a verifica periodica, almeno annuale, della validità del consenso e dell'attualità dei profili. La verifica può comportare cancellazione o anonimizzazione dei profili, richiesta di riconferma del consenso o aggiornamento delle preferenze. La revoca del consenso comporta la cessazione immediata del tracciamento e della profilazione e la cancellazione o anonimizzazione dei dati entro un termine definito nella procedura interna, di regola non superiore a 30 giorni.",
                "en": "Interaction data and derived profiles are kept for the duration of the profiling/tracking purpose and are subject to periodic review, at least annually, of the validity of consent and profile relevance. The review may lead to deletion or anonymisation of profiles, a request to re-confirm consent or updating of preferences. Withdrawal of consent results in immediate cessation of tracking and profiling and deletion or anonymisation of the data within a term defined in the internal procedure, ordinarily not exceeding 30 days.",
            },
            "azioneFinale": "cancellazione_o_anonimizzazione",
        },
        "misureSicurezza": {
            "tecniche": [
                {"it": "Cifratura della connessione (HTTPS/TLS) verso la piattaforma e gli strumenti di tracciamento",
                 "en": "Encryption of the connection (HTTPS/TLS) to the platform and tracking tools"},
                {"it": "Attivazione di pixel, click tracking e strumenti analoghi solo previo consenso valido; blocco preventivo in assenza di consenso",
                 "en": "Activation of pixels, click tracking and similar tools only upon valid consent; preventive blocking in the absence of consent"},
                {"it": "Gestione granulare e revocabile del consenso, con possibilità di revoca con la stessa facilità con cui è stato prestato",
                 "en": "Granular and revocable consent management, with the possibility of withdrawal with the same ease as it was given"},
                {"it": "Autenticazione a due fattori (MFA) sull'account amministrativo; backup cifrati ove necessari",
                 "en": "Two-factor authentication (MFA) on the administrative account; encrypted backups where necessary"},
            ],
            "organizzative": [
                {"it": "Designazione degli operatori autorizzati al trattamento (ex art. 29 GDPR)",
                 "en": "Designation of authorized operators (under GDPR Art. 29)"},
                {"it": "Informativa specifica e granulare sulla profilazione e sul tracciamento al momento della raccolta del consenso",
                 "en": "Specific and granular notice on profiling and tracking at the time of consent collection"},
                {"it": "Registrazione e conservazione della prova del consenso alla profilazione/tracciamento",
                 "en": "Recording and retention of proof of consent to profiling/tracking"},
                {"it": "Verifica del ruolo privacy di ciascuno strumento di terze parti e della relativa documentazione",
                 "en": "Verification of the privacy role of each third-party tool and the related documentation"},
            ],
            "rinvioDocumentale": {
                "it": "[Rinvio alla policy di sicurezza informatica del Titolare, alla configurazione degli strumenti di tracciamento e ai DPA con i fornitori]",
                "en": "[Refer to the Controller's IT security policy, the configuration of tracking tools and the DPAs with providers]",
            },
        },
        "processiDecisionaliAutomatizzati": {
            "presenti": False,
            "descrizione": {
                "it": "Compilare solo se la profilazione alimenta decisioni automatizzate con effetti giuridici o analogamente significativi sulla persona ex art. 22 GDPR. Per la sola personalizzazione/segmentazione delle comunicazioni la base resta il consenso ex art. 6(1)(a) GDPR e il livello ePrivacy ex art. 122 Codice privacy.",
                "en": "Complete only if profiling feeds automated decisions with legal or similarly significant effects on the person under GDPR Art. 22. For mere personalisation/segmentation of communications, the basis remains consent under GDPR Art. 6(1)(a) and the ePrivacy layer under Art. 5(3) of Directive 2002/58/EC.",
            },
            "logica": {"it": "", "en": ""},
            "conseguenze": {"it": "", "en": ""},
            "dirittiInteressato": {"it": "", "en": ""},
        },
        "profilazioneMarketing": {
            "presente": True,
            "descrizione": {
                "it": "Trattamento di profilazione a fini di marketing: utilizzo dei dati di apertura, click, preferenze e comportamento per segmentare i destinatari e personalizzare le comunicazioni. La profilazione marketing è distinta dall'art. 22 GDPR: qui non si producono decisioni con effetti giuridici, ma comunicazioni personalizzate.",
                "en": "Profiling for marketing purposes: use of open, click, preference and behavioural data to segment recipients and personalise communications. Marketing profiling is distinct from GDPR Art. 22: here no decisions with legal effects are produced, only personalised communications.",
            },
            "logica": {
                "it": "[Descrivere la logica di segmentazione/profilazione adottata, es. categorie di interesse, scoring di engagement]",
                "en": "[Describe the segmentation/profiling logic adopted, e.g. interest categories, engagement scoring]",
            },
            "baseGiuridicaSpecifica": {
                "it": "Per la profilazione marketing è di regola necessario un consenso specifico e granulare, ulteriore rispetto a quello per la newsletter o per il marketing ordinario. Inoltre, il tracciamento delle interazioni via email (pixel di apertura, click tracking o strumenti analoghi), ove comporti l'archiviazione di informazioni nel terminale dell'utente o l'accesso a informazioni già archiviate, richiede una distinta verifica ai sensi dell'art. 122 Codice privacy, che recepisce l'art. 5(3) della Direttiva 2002/58/CE. In tali casi, salvo eventuali eccezioni tecniche applicabili, è richiesto il consenso dell'utente, autonomo rispetto alla base giuridica del trattamento di marketing ai sensi del GDPR.",
                "en": "Marketing profiling generally requires a specific and granular consent additional to the one for the newsletter or for ordinary marketing. In addition, tracking interactions via email (open pixels, click tracking or similar tools), where such tracking involves storing information on the user's terminal equipment or accessing information already stored, requires a separate assessment under Art. 5(3) of Directive 2002/58/EC (the ePrivacy Directive). In such cases, unless a technical exemption applies, the user's consent is required, independently from the GDPR legal basis for the marketing processing.",
            },
        },
        "valutazioneDiImpatto": {
            "effettuata": False,
            "riferimentoDocumento": {
                "it": "Valutare la necessità di una DPIA ex art. 35 GDPR in caso di profilazione su larga scala, monitoraggio sistematico del comportamento o trattamento di dati di categorie vulnerabili (es. minori).",
                "en": "Assess the need for a DPIA under GDPR Art. 35 in case of large-scale profiling, systematic monitoring of behaviour or processing of vulnerable categories' data (e.g. minors).",
            },
        },
        "note": {
            "it": "Riferimenti normativi rilevanti: GDPR artt. 6, 7, 13, 21, 22; Codice privacy (d.lgs. 196/2003) artt. 122, 130; Direttiva 2002/58/CE art. 5(3); Linee guida EDPB 05/2020 sul consenso; Linee guida EDPB 2/2023 sull'ambito tecnico dell'art. 5(3) ePrivacy; provvedimenti del Garante in materia di profilazione e strumenti di tracciamento.",
            "en": "Relevant legal references: GDPR Arts. 6, 7, 13, 21, 22; Directive 2002/58/EC Arts. 5(3), 13; EDPB Guidelines 05/2020 on consent; EDPB Guidelines 2/2023 on the technical scope of Art. 5(3) ePrivacy.",
        },
    },
}


# ---------------------------------------------------------------------------
# CROSS-REFERENCES  (templateId, path nel campo, lang, OLD, NEW)
# path = lista di chiavi per navigare dal livello template fino al dict {it,en}
# ---------------------------------------------------------------------------
CROSSREFS = [
    # ---- tpl-it-004-clientela-b2c ----
    {
        "label": "004-1 descrizioneTemplate IT",
        "templateId": "tpl-it-004-clientela-b2c",
        "path": ["descrizioneTemplate"],
        "lang": "it",
        "old": "Distinto dal marketing, che richiede base giuridica autonoma (vedi template Newsletter).",
        "new": "Distinto dal marketing, che richiede base giuridica autonoma (vedi template Marketing via email e soft opt-in).",
    },
    {
        "label": "004-1 descrizioneTemplate EN",
        "templateId": "tpl-it-004-clientela-b2c",
        "path": ["descrizioneTemplate"],
        "lang": "en",
        "old": "Distinct from marketing, which requires an autonomous legal basis (see Newsletter template).",
        "new": "Distinct from marketing, which requires an autonomous legal basis (see Email marketing and soft opt-in template).",
    },
    {
        "label": "004-2 noteTemplate IT",
        "templateId": "tpl-it-004-clientela-b2c",
        "path": ["noteTemplate"],
        "lang": "it",
        "old": "il marketing verso i clienti NON è coperto dalla base contrattuale e va gestito separatamente (consenso o soft opt-in ex art. 130 Codice privacy — vedi template Newsletter).",
        "new": "il marketing verso i clienti NON è coperto dalla base contrattuale e va gestito separatamente (consenso o soft opt-in ex art. 130 Codice privacy — vedi template Marketing via email e soft opt-in). Per la profilazione dei clienti vedi template Profilazione marketing e tracciamento email.",
    },
    {
        "label": "004-2 noteTemplate EN",
        "templateId": "tpl-it-004-clientela-b2c",
        "path": ["noteTemplate"],
        "lang": "en",
        "old": "marketing toward customers is NOT covered by the contractual basis and must be managed separately (consent or soft opt-in under Art. 13 of Directive 2002/58/EC — see Newsletter template).",
        "new": "marketing toward customers is NOT covered by the contractual basis and must be managed separately (consent or soft opt-in under Art. 13(2) of Directive 2002/58/EC — see Email marketing and soft opt-in template). For customer profiling, see the Marketing profiling and email tracking template.",
    },
    {
        "label": "004-3 dettagliArt6 IT",
        "templateId": "tpl-it-004-clientela-b2c",
        "path": ["preset", "baseGiuridica", "dettagliArt6"],
        "lang": "it",
        "old": "Il marketing NON è coperto da queste basi e richiede consenso o soft opt-in (art. 130 Codice privacy).",
        "new": "Il marketing NON è coperto da queste basi e richiede consenso o soft opt-in (art. 130 Codice privacy — vedi template Marketing via email e soft opt-in).",
    },
    {
        "label": "004-3 dettagliArt6 EN",
        "templateId": "tpl-it-004-clientela-b2c",
        "path": ["preset", "baseGiuridica", "dettagliArt6"],
        "lang": "en",
        "old": "Marketing is NOT covered by these bases and requires consent or soft opt-in (Art. 13 of Directive 2002/58/EC).",
        "new": "Marketing is NOT covered by these bases and requires consent or soft opt-in (Art. 13 of Directive 2002/58/EC — see Email marketing and soft opt-in template).",
    },
    {
        "label": "004-4 profilazioneMarketing.descrizione IT",
        "templateId": "tpl-it-004-clientela-b2c",
        "path": ["preset", "profilazioneMarketing", "descrizione"],
        "lang": "it",
        "old": "Compilare se si effettua profilazione dei clienti (es. raccomandazioni personalizzate, segmentazione comportamentale). Richiede di regola consenso specifico e informativa adeguata.",
        "new": "Compilare se si effettua profilazione dei clienti (es. raccomandazioni personalizzate, segmentazione comportamentale). Richiede di regola consenso specifico e informativa adeguata. Per la profilazione marketing e il tracciamento delle comunicazioni email vedi il template dedicato Profilazione marketing e tracciamento email.",
    },
    {
        "label": "004-4 profilazioneMarketing.descrizione EN",
        "templateId": "tpl-it-004-clientela-b2c",
        "path": ["preset", "profilazioneMarketing", "descrizione"],
        "lang": "en",
        "old": "Complete if profiling customers (e.g. personalized recommendations, behavioral segmentation). Generally requires specific consent and adequate information.",
        "new": "Complete if profiling customers (e.g. personalized recommendations, behavioral segmentation). Generally requires specific consent and adequate information. For marketing profiling and email communication tracking, see the dedicated Marketing profiling and email tracking template.",
    },
    # ---- tpl-it-010-sito-web-cookie ----
    {
        "label": "010-1 fonteDeiDatiDettagli IT",
        "templateId": "tpl-it-010-sito-web-cookie",
        "path": ["preset", "fonteDeiDatiDettagli"],
        "lang": "it",
        "old": "I dati inseriti volontariamente dall'utente nei form (contatto, newsletter, acquisto, area riservata) sono censiti nei rispettivi trattamenti specifici.",
        "new": "I dati inseriti volontariamente dall'utente nei form (contatto, iscrizione newsletter, acquisto, area riservata) sono censiti nei rispettivi trattamenti specifici: la newsletter informativa nel template Newsletter / comunicazioni email; l'eventuale consenso al marketing nel template Marketing via email e soft opt-in; l'eventuale consenso a profilazione/tracciamento nel template Profilazione marketing e tracciamento email.",
    },
    {
        "label": "010-1 fonteDeiDatiDettagli EN",
        "templateId": "tpl-it-010-sito-web-cookie",
        "path": ["preset", "fonteDeiDatiDettagli"],
        "lang": "en",
        "old": "Data voluntarily entered by the user in forms (contact, newsletter, purchase, reserved area) are recorded in their respective specific activities.",
        "new": "Data voluntarily entered by the user in forms (contact, newsletter subscription, purchase, reserved area) are recorded in their respective specific activities: the informational newsletter in the Newsletter / email communications template; any marketing consent in the Email marketing and soft opt-in template; any consent to profiling/tracking in the Marketing profiling and email tracking template.",
    },
]


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def find_index(templates, template_id):
    idx = [i for i, t in enumerate(templates) if t.get("templateId") == template_id]
    return idx


def get_field_dict(template, path):
    node = template
    for key in path:
        node = node[key]
    return node


def detect_format(raw, data):
    """Trova la combinazione di serializzazione che riproduce esattamente il file
    originale, così la scrittura cambierà solo le righe effettivamente modificate."""
    variants = [
        ("indent=2, ensure_ascii=False", dict(indent=2, ensure_ascii=False)),
        ("indent=2, ensure_ascii=True", dict(indent=2, ensure_ascii=True)),
        ("indent=4, ensure_ascii=False", dict(indent=4, ensure_ascii=False)),
        ("indent=4, ensure_ascii=True", dict(indent=4, ensure_ascii=True)),
        ("indent=3, ensure_ascii=False", dict(indent=3, ensure_ascii=False)),
        ("indent='\\t', ensure_ascii=False", dict(indent="\t", ensure_ascii=False)),
    ]
    for name, opts in variants:
        s = json.dumps(data, **opts)
        if s == raw:
            return name, opts, False  # nessun newline finale
        if s + "\n" == raw:
            return name, opts, True   # newline finale presente
    return None, dict(indent=2, ensure_ascii=False), raw.endswith("\n")


def main():
    args = [a for a in sys.argv[1:]]
    write = "--write" in args
    args = [a for a in args if a != "--write"]
    path = args[0] if args else DEFAULT_PATH

    print("=" * 78)
    print("ropa30 — split newsletter A/B/C  |  modalità:",
          "WRITE" if write else "DRY-RUN")
    print("file:", path)
    print("=" * 78)

    with open(path, encoding="utf-8") as f:
        raw = f.read()
    data = json.loads(raw)
    templates = data["templates"]
    n_before = len(templates)
    print(f"\nTemplate presenti: {n_before}")

    # --- formato di serializzazione (per diff minimale) ---
    fmt_name, fmt_opts, trailing_nl = detect_format(raw, data)
    if fmt_name:
        print(f"Formato file rilevato: {fmt_name}"
              + (" + newline finale" if trailing_nl else ""))
        print("  → round-trip OK: il diff finale mostrerà SOLO le righe modificate.")
    else:
        print("ATTENZIONE: formato non riconosciuto con round-trip esatto.")
        print("  → userò indent=2, ensure_ascii=False; il diff potrebbe essere ampio.")

    ok = True

    # --- controlli di pre-condizione sugli ID ---
    print("\n--- Pre-condizioni ID ---")
    idx_a = find_index(templates, OLD_A_ID)
    print(f"{OLD_A_ID}: trovato {len(idx_a)} volta/e", "[OK]" if len(idx_a) == 1 else "[FAIL]")
    ok &= (len(idx_a) == 1)
    for nid in (NEW_A_ID, B_ID, C_ID):
        cnt = len(find_index(templates, nid))
        # NEW_A_ID non deve esistere ancora (è la rinomina); B/C nemmeno
        print(f"{nid}: già presente {cnt} volta/e", "[OK]" if cnt == 0 else "[FAIL]")
        ok &= (cnt == 0)

    # --- controllo set di chiavi A/B/C vs 005 attuale ---
    print("\n--- Coerenza schema (chiavi A/B/C vs tpl-005 attuale) ---")
    if idx_a:
        orig = templates[idx_a[0]]
        for name, tpl in (("A", TEMPLATE_A), ("B", TEMPLATE_B), ("C", TEMPLATE_C)):
            checks = [
                ("top-level", set(orig.keys()), set(tpl.keys())),
                ("preset", set(orig["preset"].keys()), set(tpl["preset"].keys())),
                ("baseGiuridica",
                 set(orig["preset"]["baseGiuridica"].keys()),
                 set(tpl["preset"]["baseGiuridica"].keys())),
                ("legittimoInteresseDettagli",
                 set(orig["preset"]["baseGiuridica"]["legittimoInteresseDettagli"].keys()),
                 set(tpl["preset"]["baseGiuridica"]["legittimoInteresseDettagli"].keys())),
            ]
            for level, exp, got in checks:
                same = (exp == got)
                flag = "[OK]" if same else "[FAIL]"
                print(f"  {name} {level}: {flag}")
                if not same:
                    print("     mancano:", exp - got, "| in più:", got - exp)
                ok &= same

    # --- cross-ref: verifica count==1 e prepara before/after ---
    print("\n--- Cross-ref: verifica count==1 sui campi bersaglio ---")
    planned = []
    for cr in CROSSREFS:
        idx = find_index(templates, cr["templateId"])
        if len(idx) != 1:
            print(f"  {cr['label']}: template {cr['templateId']} trovato {len(idx)} volte [FAIL]")
            ok = False
            continue
        tpl = templates[idx[0]]
        try:
            field = get_field_dict(tpl, cr["path"])
            current = field[cr["lang"]]
        except (KeyError, TypeError):
            print(f"  {cr['label']}: percorso {cr['path']}[{cr['lang']}] inesistente [FAIL]")
            ok = False
            continue
        count = current.count(cr["old"])
        flag = "[OK]" if count == 1 else "[FAIL]"
        print(f"  {cr['label']}: count={count} {flag}")
        if count != 1:
            ok = False
            continue
        planned.append((idx[0], cr))

    if not ok:
        print("\n*** PRE-CHECK FALLITO: nessuna modifica applicata. Correggere e rilanciare. ***")
        sys.exit(1)

    # === COSTRUZIONE NUOVA STRUTTURA (su copia) ===
    new_data = copy.deepcopy(data)
    new_templates = new_data["templates"]

    # 1) Rinomina/riscrittura A in place
    new_templates[idx_a[0]] = copy.deepcopy(TEMPLATE_A)

    # 2) Inserimento B e C in coda
    new_templates.append(copy.deepcopy(TEMPLATE_B))
    new_templates.append(copy.deepcopy(TEMPLATE_C))

    # 3) Cross-ref
    print("\n--- Cross-ref: before/after ---")
    for tpl_idx, cr in planned:
        tpl = new_templates[tpl_idx]
        field = get_field_dict(tpl, cr["path"])
        before = field[cr["lang"]]
        after = before.replace(cr["old"], cr["new"], 1)
        field[cr["lang"]] = after
        print(f"\n[{cr['label']}]")
        print("  OLD:", cr["old"])
        print("  NEW:", cr["new"])

    n_after = len(new_templates)
    print("\n--- Conteggio ---")
    print(f"  prima: {n_before}  →  dopo: {n_after}",
          "[OK]" if n_after == n_before + 2 else "[FAIL]")
    ok &= (n_after == n_before + 2)

    # --- validazione JSON sull'output serializzato ---
    serialized = json.dumps(new_data, **fmt_opts)
    if trailing_nl:
        serialized += "\n"
    try:
        json.loads(serialized)
        print("  json.loads sull'output: [OK]")
    except Exception as e:
        print("  json.loads sull'output: [FAIL]", e)
        ok = False

    if not ok:
        print("\n*** VALIDAZIONE FALLITA: nessuna scrittura. ***")
        sys.exit(1)

    print("\n--- Riepilogo operazioni ---")
    print(f"  • {OLD_A_ID}  →  {NEW_A_ID}  (Template A riscritto)")
    print(f"  • inserito  {B_ID}  (Template B)")
    print(f"  • inserito  {C_ID}  (Template C)")
    print(f"  • applicati {len(planned)} cross-ref (tpl-004: 8, tpl-010: 2)")

    if not write:
        print("\nDRY-RUN completato. Nessun file modificato.")
        print("Per scrivere:  python3 split_newsletter.py --write")
        sys.exit(0)

    with open(path, "w", encoding="utf-8") as f:
        f.write(serialized)
    print(f"\nFILE SCRITTO: {path}")
    print("Esegui ora il diff e validalo prima del commit.")


if __name__ == "__main__":
    main()
