// Syllab Installation Guide - Typst Template
// Compile: typst compile installation-guide.typ

#set document(
  title: "Syllab - Installationsanleitung",
  author: "Syllab",
)

#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
)

#set text(
  font: "Liberation Sans",
  size: 11pt,
  lang: "de",
)

#set heading(numbering: "1.")

#set par(justify: true)

// Colors
#let primary = rgb("#4A90D9")
#let accent = rgb("#E74C3C")

// Placeholders - replace before PDF generation
#let license-key = "{{LICENSE_KEY}}"
#let version = "{{VERSION}}"

// Title Page
#align(center)[
  #v(3cm)

  // Logo placeholder
  #rect(
    width: 6cm,
    height: 3cm,
    stroke: 1pt + primary,
    radius: 8pt,
  )[
    #align(center + horizon)[
      #text(size: 28pt, weight: "bold", fill: primary)[Syllab]
    ]
  ]

  #v(1cm)

  #text(size: 24pt, weight: "bold")[
    Installationsanleitung
  ]

  #v(0.5cm)

  #text(size: 12pt, fill: gray)[
    PowerPoint Add-in für Silbentrennung mit farbiger Formatierung
  ]

  #v(2cm)

  #rect(
    width: 100%,
    fill: primary.lighten(90%),
    stroke: 1pt + primary,
    radius: 8pt,
    inset: 1.5em,
  )[
    #align(center)[
      #text(size: 11pt)[Ihr persönlicher Lizenzschlüssel:]
      #v(0.3cm)
      #text(size: 18pt, weight: "bold", font: "Liberation Mono")[#license-key]
    ]
  ]

  #v(1fr)

  #text(size: 10pt, fill: gray)[
    Version #version • © 2026
  ]
]

#pagebreak()

// Table of Contents
#outline(
  title: [Inhaltsverzeichnis],
  indent: 1.5em,
)

#pagebreak()

= Systemvoraussetzungen

Bevor Sie Syllab installieren, stellen Sie sicher, dass Ihr System die folgenden Anforderungen erfüllt:

#table(
  columns: (auto, 1fr),
  stroke: none,
  row-gutter: 0.3em,
  [*Betriebssystem*], [Windows 10 oder Windows 11],
  [*Office-Version*], [Microsoft PowerPoint (Desktop-Version) \ Microsoft 365, Office 2019 oder neuer],
  [*Internetverbindung*], [Erforderlich für den ersten Start und die Lizenzaktivierung],
  [*Festplattenspeicher*], [Ca. 10 MB freier Speicherplatz],
)

#v(0.5em)

#rect(
  width: 100%,
  fill: rgb("#FFF3CD"),
  stroke: 1pt + rgb("#FFC107"),
  radius: 4pt,
  inset: 1em,
)[
  *Hinweis:* Diese Anleitung beschreibt die Installation für die Desktop-Version von PowerPoint. Für PowerPoint Online siehe @web-app.
]

= Installation

== Windows (Desktop-Version)

=== Schritt 1: Installer herunterladen

Laden Sie den aktuellen Installer von der offiziellen Download-Seite herunter:

#align(center)[
  #rect(
    fill: primary.lighten(90%),
    stroke: 1pt + primary,
    radius: 4pt,
    inset: 1em,
  )[
    #link("https://github.com/choffmann/syllable-pp/releases/latest")[
      #text(fill: primary)[https://github.com/choffmann/syllable-pp/releases/latest]
    ]
  ]
]

Wählen Sie die Datei #raw("Syllab-Setup-" + version + ".exe") aus den verfügbaren Downloads.

=== Schritt 2: Installer ausführen

+ Doppelklicken Sie auf die heruntergeladene Datei #raw("Syllab-Setup-" + version + ".exe")
+ Falls Windows eine Sicherheitswarnung anzeigt, klicken Sie auf *"Weitere Informationen"* und dann auf *"Trotzdem ausführen"*
+ Folgen Sie den Anweisungen des Installationsassistenten
+ Wählen Sie den Installationsort (Standard empfohlen)
+ Klicken Sie auf *"Installieren"*

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 4cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: Installationsassistent ]]
    ]
  ]
]

=== Schritt 3: PowerPoint neu starten

Nach Abschluss der Installation:

+ Schließen Sie PowerPoint vollständig (falls geöffnet)
+ Starten Sie PowerPoint neu
+ Das Syllab Add-in ist nun verfügbar

#pagebreak()

== Alternative: PowerPoint Online <web-app>

Sie können Syllab auch in PowerPoint Online (im Browser) verwenden. Dazu muss das Add-in manuell geladen werden (Sideloading).

=== Schritt 1: PowerPoint Online öffnen

+ Öffnen Sie #link("https://www.office.com")[office.com] und melden Sie sich an
+ Öffnen Sie eine Präsentation in PowerPoint Online

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 4cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: PowerPoint Online Startseite ]]
    ]
  ]
]

=== Schritt 2: Add-in Sideloading

+ Klicken Sie auf *"Einfügen"* in der Menüleiste
+ Klicken Sie auf *"Add-ins"* → *"Add-ins abrufen"*

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 3cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: PowerPoint Online → Einfügen → Add-ins ]]
    ]
  ]
]

+ Wählen Sie *"Meine Add-ins"* → *"Meine Add-ins verwalten"*
+ Klicken Sie auf *"Mein Add-in hochladen"*

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 4cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: Add-in hochladen Dialog ]]
    ]
  ]
]

+ Laden Sie die Manifest-Datei hoch. Diese finden Sie unter:

#align(center)[
  #rect(
    fill: primary.lighten(90%),
    stroke: 1pt + primary,
    radius: 4pt,
    inset: 1em,
  )[
    #link("https://choffmann.github.io/syllable-pp/manifest.xml")[
      #text(fill: primary)[https://choffmann.github.io/syllable-pp/manifest.xml]
    ]
  ]
]

+ Das Syllab Add-in erscheint nun in Ihrer Add-in Liste

=== Einschränkungen von PowerPoint Online

#table(
  columns: (auto, 1fr),
  stroke: none,
  row-gutter: 0.2em,
  [#text(fill: accent)[✗]], [Sideloading muss bei jedem Browser/Gerät wiederholt werden],
  [#text(fill: accent)[✗]], [Internetverbindung dauerhaft erforderlich],
  [#text(fill: rgb("#27AE60"))[✓]], [Keine lokale Installation notwendig],
  [#text(fill: rgb("#27AE60"))[✓]], [Funktioniert auf allen Betriebssystemen],
)

= Erste Schritte

== Add-in in PowerPoint aktivieren

Nach der Installation muss das Add-in einmalig in PowerPoint aktiviert werden:

+ Öffnen Sie PowerPoint
+ Klicken Sie auf *"Datei"* → *"Optionen"*

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 4cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: PowerPoint Datei-Menü → Optionen ]]
    ]
  ]
]

+ Wählen Sie im linken Menü *"Trust Center"* (Vertrauensstellungscenter)
+ Klicken Sie auf *"Einstellungen für das Trust Center..."*

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 4cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: PowerPoint Optionen → Trust Center ]]
    ]
  ]
]

+ Wählen Sie *"Vertrauenswürdige Add-In-Kataloge"*
+ Stellen Sie sicher, dass der Syllab-Katalog in der Liste erscheint und aktiviert ist

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 4cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: Trust Center → Vertrauenswürdige Add-In-Kataloge ]]
    ]
  ]
]

+ Klicken Sie auf *"OK"* um die Einstellungen zu speichern
+ Starten Sie PowerPoint neu

== Add-in öffnen

+ Öffnen Sie PowerPoint und eine beliebige Präsentation
+ Klicken Sie auf den Reiter *"Start"* (Home)
+ Klicken Sie auf *"Add-ins"* in der Menüleiste

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 3cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: PowerPoint Ribbon → Add-ins Button ]]
    ]
  ]
]

+ Wählen Sie *"Syllab"* aus der Liste der verfügbaren Add-ins

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 4cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: Add-in Auswahl → Syllab ]]
    ]
  ]
]

+ Das Syllab-Panel öffnet sich auf der rechten Seite

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 5cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: Syllab Panel geöffnet in PowerPoint ]]
    ]
  ]
]

== Text mit Silbentrennung formatieren

+ *Text markieren:* Wählen Sie den Text in Ihrer Folie aus, den Sie mit Silbentrennung formatieren möchten

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 4cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: Text in PowerPoint markiert ]]
    ]
  ]
]

+ *Vorschau anzeigen:* Klicken Sie auf *"Vorschau"* um die Silbentrennung zu sehen

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 5cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: Syllab Vorschau mit farbigen Silben ]]
    ]
  ]
]

+ *Farben anpassen:* Wählen Sie bei Bedarf andere Farben für die Silben über die Farbauswahl

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 3cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: Farbauswahl für Silben ]]
    ]
  ]
]

+ *Anwenden:* Klicken Sie auf *"Anwenden"* um die Formatierung auf den markierten Text anzuwenden

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 4cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: Formatierter Text in PowerPoint Folie ]]
    ]
  ]
]

#pagebreak()

= Lizenz aktivieren

Nach der Installation können Sie Syllab 10 Mal kostenlos testen. Um die volle Version freizuschalten, geben Sie Ihren Lizenzschlüssel ein.

== Lizenzschlüssel eingeben

+ Öffnen Sie das Syllab Add-in in PowerPoint
+ Wenn die Testversion abgelaufen ist, erscheint automatisch das Lizenz-Fenster
+ Geben Sie Ihren persönlichen Lizenzschlüssel ein:

#align(center)[
  #rect(
    fill: primary.lighten(90%),
    stroke: 2pt + primary,
    radius: 8pt,
    inset: 1.5em,
  )[
    #text(size: 16pt, weight: "bold", font: "Liberation Mono")[#license-key]
  ]
]

#v(0.5em)

+ Klicken Sie auf *"Aktivieren"*

// Screenshot placeholder
#align(center)[
  #rect(
    width: 80%,
    height: 5cm,
    stroke: 1pt + gray,
    radius: 4pt,
  )[
    #align(center + horizon)[
      #text(fill: gray)[[ Screenshot: Lizenz-Eingabe Dialog ]]
    ]
  ]
]

+ Bei erfolgreicher Aktivierung erscheint eine Bestätigung

#rect(
  width: 100%,
  fill: rgb("#D4EDDA"),
  stroke: 1pt + rgb("#28A745"),
  radius: 4pt,
  inset: 1em,
)[
  *Tipp:* Bewahren Sie diesen Lizenzschlüssel sicher auf. Sie benötigen ihn erneut, wenn Sie Syllab auf einem anderen Computer installieren oder PowerPoint neu installieren.
]

== Lizenzformat

Der Lizenzschlüssel hat folgendes Format:

#align(center)[
  #text(font: "Liberation Mono", size: 12pt)[XXXX-XXXX-XXXX-XXXX]
]

Bindestriche und Großbuchstaben werden automatisch eingefügt.

#pagebreak()

= Fehlerbehebung

== Add-in wird nicht angezeigt

*Problem:* Nach der Installation erscheint Syllab nicht in PowerPoint.

*Lösungen:*
+ PowerPoint vollständig schließen und neu starten
+ Windows neu starten
+ Überprüfen Sie, ob das Add-in aktiviert ist:
  - PowerPoint öffnen → *Datei* → *Optionen* → *Add-Ins*
  - Bei "COM-Add-Ins" nach "Syllab" suchen
  - Falls deaktiviert, aktivieren Sie es

== Lizenzschlüssel wird als ungültig erkannt

*Problem:* Der eingegebene Lizenzschlüssel wird nicht akzeptiert.

*Lösungen:*
+ Überprüfen Sie die korrekte Schreibweise (Groß-/Kleinschreibung)
+ Stellen Sie sicher, dass keine Leerzeichen vor oder nach dem Schlüssel sind
+ Kopieren Sie den Schlüssel direkt aus dieser Anleitung

== Silbentrennung funktioniert nicht korrekt

*Problem:* Wörter werden falsch getrennt.

*Lösung:*
+ Klicken Sie im Vorschau-Bereich auf das falsch getrennte Wort
+ Bearbeiten Sie die Silbentrennung manuell mit dem `|` Zeichen
+ Klicken Sie auf "Korrektur speichern"

Die Korrektur wird für zukünftige Verwendungen gespeichert.

= Support & Kontakt

Bei Fragen oder Problemen erreichen Sie uns unter:

#table(
  columns: (auto, 1fr),
  stroke: none,
  row-gutter: 0.8em,
  [*E-Mail:*], [support\@example.com],
  [*GitHub:*], [#link("https://github.com/choffmann/syllable-pp/issues")[github.com/choffmann/syllable-pp/issues]],
)

#v(1em)

#rect(
  width: 100%,
  fill: gray.lighten(90%),
  stroke: 1pt + gray,
  radius: 4pt,
  inset: 1em,
)[
  #align(center)[
    #text(size: 10pt, fill: gray)[
      Vielen Dank, dass Sie sich für Syllab entschieden haben!
    ]
  ]
]
