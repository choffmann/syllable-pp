; Syllab Add-In Installer
; Inno Setup Script
; Build with: ISCC syllab.iss

#define MyAppName "Syllab"
#define MyAppVersion "0.1.0" ; x-release-please-version
#define MyAppPublisher "Cedrik Hoffmann"
#define MyAppURL "https://github.com/choffmann/syllable-pp"
#define MyAppGUID "{{01C71763-4C08-4195-9581-18C398267EF1}"

[Setup]
AppId={#MyAppGUID}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/issues
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
LicenseFile=LICENSE.txt
OutputDir=output
OutputBaseFilename=Syllab-Setup-{#MyAppVersion}
SetupIconFile=icon.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64compatible
; Suppress warning - HKCU is intentional for Office Trust Center (user must install for themselves)
UsedUserAreasWarning=no

[Languages]
Name: "german"; MessagesFile: "compiler:Languages\German.isl"

[Files]
; Manifest file from dist folder
Source: "..\dist\manifest.xml"; DestDir: "{app}"; Flags: ignoreversion

[Registry]
; Trust Center catalog entry for Office 2016/2019/365 (version 16.0)
Root: HKCU; Subkey: "Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{#MyAppGUID}"; ValueType: string; ValueName: "Id"; ValueData: "{#MyAppGUID}"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{#MyAppGUID}"; ValueType: string; ValueName: "Url"; ValueData: "\\localhost\Syllab"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{#MyAppGUID}"; ValueType: dword; ValueName: "Flags"; ValueData: "1"; Flags: uninsdeletekey

; Also add for Office 2013 (version 15.0) if present
Root: HKCU; Subkey: "Software\Microsoft\Office\15.0\WEF\TrustedCatalogs\{#MyAppGUID}"; ValueType: string; ValueName: "Id"; ValueData: "{#MyAppGUID}"; Flags: uninsdeletekey createvalueifdoesntexist
Root: HKCU; Subkey: "Software\Microsoft\Office\15.0\WEF\TrustedCatalogs\{#MyAppGUID}"; ValueType: string; ValueName: "Url"; ValueData: "\\localhost\Syllab"; Flags: uninsdeletekey createvalueifdoesntexist
Root: HKCU; Subkey: "Software\Microsoft\Office\15.0\WEF\TrustedCatalogs\{#MyAppGUID}"; ValueType: dword; ValueName: "Flags"; ValueData: "1"; Flags: uninsdeletekey createvalueifdoesntexist

; Store license key if provided
Root: HKCU; Subkey: "Software\{#MyAppName}"; ValueType: string; ValueName: "LicenseKey"; ValueData: "{code:GetLicenseKey}"; Flags: uninsdeletekey; Check: HasLicenseKey

[Run]
; Create network share for the installation folder
Filename: "net.exe"; Parameters: "share Syllab=""{app}"" /grant:everyone,READ"; Flags: runhidden waituntilterminated; StatusMsg: "Erstelle Netzwerkfreigabe..."

[UninstallRun]
; Remove network share on uninstall
Filename: "net.exe"; Parameters: "share Syllab /delete /yes"; Flags: runhidden waituntilterminated; RunOnceId: "RemoveShare"

[Code]
var
  LicensePage: TInputQueryWizardPage;
  LicenseKey: String;

procedure InitializeWizard;
begin
  // Create license key input page
  LicensePage := CreateInputQueryPage(wpLicense,
    'Lizenzschlüssel (Optional)',
    'Geben Sie Ihren Lizenzschlüssel ein oder lassen Sie das Feld leer für den Testmodus.',
    'Im Testmodus können Sie das Add-In 10 mal kostenlos verwenden.' + #13#10 + #13#10 +
    'Wenn Sie einen Lizenzschlüssel haben, geben Sie ihn hier ein:');
  LicensePage.Add('Lizenzschlüssel:', False);
  LicensePage.Values[0] := '';
end;

function GetLicenseKey(Param: String): String;
begin
  Result := LicensePage.Values[0];
end;

function HasLicenseKey: Boolean;
begin
  Result := Trim(LicensePage.Values[0]) <> '';
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    LicenseKey := Trim(LicensePage.Values[0]);

    if LicenseKey <> '' then
    begin
      // Save license key to a text file for easy copy
      SaveStringToFile(ExpandConstant('{app}\lizenzschluessel.txt'),
        'Ihr Lizenzschlüssel: ' + LicenseKey + #13#10 + #13#10 +
        'Kopieren Sie diesen Schlüssel und fügen Sie ihn im Add-In ein.' + #13#10,
        False);
    end;
  end;
end;

procedure CurPageChanged(CurPageID: Integer);
begin
  if CurPageID = wpFinished then
  begin
    WizardForm.FinishedLabel.Caption :=
      'Syllab wurde erfolgreich installiert!' + #13#10 + #13#10 +
      'Nächste Schritte:' + #13#10 +
      '1. Starten Sie PowerPoint (falls offen, bitte neu starten)' + #13#10 +
      '2. Gehen Sie zu: Start → Add-Ins' + #13#10 +
      '3. Klicken Sie auf "Meine Add-Ins" → "Freigegebener Ordner"' + #13#10 +
      '4. Wählen Sie "Syllab" aus';

    if HasLicenseKey then
    begin
      WizardForm.FinishedLabel.Caption := WizardForm.FinishedLabel.Caption + #13#10 + #13#10 +
        'Ihr Lizenzschlüssel wurde in einer Textdatei gespeichert:' + #13#10 +
        ExpandConstant('{app}\lizenzschluessel.txt');
    end;
  end;
end;

// Check if PowerPoint is running and warn user
function InitializeSetup: Boolean;
begin
  Result := True;
  if CheckForMutexes('PowerPoint') then
  begin
    if MsgBox('PowerPoint scheint zu laufen. Es wird empfohlen, PowerPoint vor der Installation zu schließen.' + #13#10 + #13#10 +
              'Möchten Sie trotzdem fortfahren?', mbConfirmation, MB_YESNO) = IDNO then
    begin
      Result := False;
    end;
  end;
end;
