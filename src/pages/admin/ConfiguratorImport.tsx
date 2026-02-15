import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Database } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ImportResult {
  success: boolean;
  totalParsed: number;
  uniqueItems: number;
  inserted: number;
  stats: {
    lichtkuppel: number;
    aufsatzkranz: number;
    luefterrahmen: number;
    durchsturzsicherung: number;
    zubehoer: number;
  };
  errors?: string[];
}

interface FileData {
  name: string;
  content: string;
  type: 'lichtkuppel' | 'kraenze' | 'luefterrahmen' | 'durchsturzsicherung';
}

const ConfiguratorImport = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [clearExisting, setClearExisting] = useState(true);

  const detectFileType = (filename: string): FileData['type'] | null => {
    const lower = filename.toLowerCase();
    if (lower.includes('lichtkuppel')) return 'lichtkuppel';
    if (lower.includes('kranz') || lower.includes('kränze')) return 'kraenze';
    if (lower.includes('lüfter') || lower.includes('luefter')) return 'luefterrahmen';
    if (lower.includes('durchsturz')) return 'durchsturzsicherung';
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: FileData[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const type = detectFileType(file.name);
      if (type) {
        const content = await file.text();
        newFiles.push({ name: file.name, content, type });
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    setImportResult(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (files.length === 0) return;

    setIsImporting(true);
    setImportProgress(10);
    setImportResult(null);

    try {
      const body: Record<string, string | boolean> = { clearExisting };
      
      for (const file of files) {
        switch (file.type) {
          case 'lichtkuppel':
            body.lichtkuppelData = file.content;
            break;
          case 'kraenze':
            body.kraenzeData = file.content;
            break;
          case 'luefterrahmen':
            body.luefterrahmenData = file.content;
            break;
          case 'durchsturzsicherung':
            body.durchsturzsicherungData = file.content;
            break;
        }
      }

      setImportProgress(30);

      // Direct Firestore import is not yet implemented for configurator items.
      // The old Supabase edge function has been removed.
      // TODO: Implement client-side parsing + Firestore batch writes
      const data: ImportResult = {
        success: false,
        totalParsed: 0,
        uniqueItems: 0,
        inserted: 0,
        stats: { lichtkuppel: 0, aufsatzkranz: 0, luefterrahmen: 0, durchsturzsicherung: 0, zubehoer: 0 },
        errors: ['Configurator import needs to be re-implemented for Firebase. Use the data seeding script instead.'],
      };

      setImportProgress(100);
      setImportResult(data);

      if (data.success) {
        toast({
          title: 'Import erfolgreich!',
          description: `${data.inserted} Konfigurator-Artikel importiert.`,
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const fileTypeLabels: Record<FileData['type'], string> = {
    lichtkuppel: 'Lichtkuppeln',
    kraenze: 'Aufsatzkränze',
    luefterrahmen: 'Lüfterrahmen',
    durchsturzsicherung: 'Durchsturzsicherung',
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Konfigurator-Daten Import
          </h1>
          <p className="text-muted-foreground mb-8">
            Importieren Sie Preisdaten aus Markdown-Dateien für den Lichtkuppel-Konfigurator.
          </p>

          {/* Upload Area */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                Dateien hochladen
              </CardTitle>
              <CardDescription>
                Laden Sie die Markdown-Exportdateien hoch (Lichtkuppeln, Kränze, Lüfterrahmen, Durchsturzsicherung)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-border rounded-lg p-10 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('md-input')?.click()}
              >
                <input
                  id="md-input"
                  type="file"
                  accept=".md,.txt"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Markdown-Dateien hierher ziehen oder klicken zum Auswählen
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Kategorie: {fileTypeLabels[file.type]}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Entfernen
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import Options */}
          {files.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Import-Optionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clear-existing"
                    checked={clearExisting}
                    onCheckedChange={(checked) => setClearExisting(checked as boolean)}
                  />
                  <Label htmlFor="clear-existing" className="text-sm">
                    Bestehende Konfigurator-Daten vor dem Import löschen
                  </Label>
                </div>

                <Button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="w-full"
                  size="lg"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importiere...
                    </>
                  ) : (
                    `${files.length} Datei(en) importieren`
                  )}
                </Button>

                {isImporting && (
                  <Progress value={importProgress} className="w-full" />
                )}
              </CardContent>
            </Card>
          )}

          {/* Import Result */}
          {importResult && (
            <Card className={importResult.success ? 'border-primary/50' : 'border-destructive/50'}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {importResult.success ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Import erfolgreich
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      Import mit Fehlern
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <dt className="text-muted-foreground">Gesamt geparst</dt>
                    <dd className="text-2xl font-bold text-foreground">{importResult.totalParsed}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Eindeutige Artikel</dt>
                    <dd className="text-2xl font-bold text-foreground">{importResult.uniqueItems}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Importiert</dt>
                    <dd className="text-2xl font-bold text-foreground">{importResult.inserted}</dd>
                  </div>
                </dl>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">Lichtkuppeln</p>
                    <p className="text-lg font-semibold">{importResult.stats.lichtkuppel}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">Aufsatzkränze</p>
                    <p className="text-lg font-semibold">{importResult.stats.aufsatzkranz}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">Lüfterrahmen</p>
                    <p className="text-lg font-semibold">{importResult.stats.luefterrahmen}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">Durchsturzsich.</p>
                    <p className="text-lg font-semibold">{importResult.stats.durchsturzsicherung}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">Zubehör</p>
                    <p className="text-lg font-semibold">{importResult.stats.zubehoer}</p>
                  </div>
                </div>

                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm font-medium text-destructive mb-2">Fehler:</p>
                    <ul className="text-sm text-destructive/80 list-disc list-inside">
                      {importResult.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {importResult.success && (
                  <div className="mt-4">
                    <Button variant="outline" asChild>
                      <a href="/configurator">Konfigurator öffnen →</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ConfiguratorImport;
