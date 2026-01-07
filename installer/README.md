# Syllab Installer

Windows-Installer für das Syllab PowerPoint Add-In.

## Voraussetzungen

1. **Inno Setup** installieren: https://jrsoftware.org/isdl.php
2. **Add-In bauen**: `pnpm run build` im Root-Verzeichnis

## Installer bauen

### Option 1: Inno Setup GUI

1. Inno Setup Compiler öffnen
2. `syllab.iss` laden
3. Build → Compile (oder F9)
4. Installer wird in `output/` erstellt

### Option 2: Kommandozeile

```cmd
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" syllab.iss
```

## Ausgabe

Nach dem Build findest du den Installer unter:
```
installer/output/Syllab-Setup-0.1.0.exe
```

## Was der Installer macht

1. Installiert `manifest.xml` nach `C:\Program Files\Syllab\`
2. Erstellt eine Windows-Netzwerkfreigabe `\\localhost\Syllab`
3. Fügt Registry-Einträge für das Office Trust Center hinzu
4. Speichert optional den Lizenzschlüssel

## Testen

1. Installer als Administrator ausführen
2. PowerPoint starten (oder neu starten)
3. Start → Add-Ins → Meine Add-Ins → Freigegebener Ordner
4. "Syllab" sollte erscheinen

## Code-Signing (Optional)

Um die "Unbekannter Herausgeber" Warnung zu vermeiden:

```cmd
signtool sign /f certificate.pfx /p PASSWORD /t http://timestamp.digicert.com Syllab-Setup-0.1.0.exe
```

## Version aktualisieren

In `syllab.iss` die Version ändern:
```iss
#define MyAppVersion "0.2.0"
```
