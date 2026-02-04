import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImportResult {
  success: boolean;
  totalParsed: number;
  inserted: number;
  categoriesCreated: number;
  errors?: string[];
}

const AdminImport = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [clearExisting, setClearExisting] = useState(true);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setImportResult(null);

    // Read and preview first few lines
    const text = await selectedFile.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    const preview = lines.slice(0, 6).map(line => {
      // Simple CSV parse for preview
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.slice(0, 6); // Only show first 6 columns
    });

    setCsvPreview(preview);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setImportProgress(10);
    setImportResult(null);

    try {
      const csvData = await file.text();
      setImportProgress(30);

      const { data, error } = await supabase.functions.invoke('import-products', {
        body: { csvData, clearExisting },
      });

      setImportProgress(100);

      if (error) {
        throw error;
      }

      setImportResult(data as ImportResult);

      if (data.success) {
        toast({
          title: 'Import erfolgreich!',
          description: `${data.inserted} Produkte und ${data.categoriesCreated} Kategorien importiert.`,
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

  return (
    <Layout>
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Produkt-Import
          </h1>
          <p className="text-muted-foreground mb-8">
            Importieren Sie Produkte aus einer WooCommerce CSV-Exportdatei.
          </p>

          {/* Upload Area */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">CSV-Datei hochladen</CardTitle>
              <CardDescription>
                Laden Sie Ihre WooCommerce Produkt-Export CSV-Datei hoch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-border rounded-lg p-10 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('csv-input')?.click()}
              >
                <input
                  id="csv-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-primary" />
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      CSV-Datei hierher ziehen oder klicken zum Auswählen
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CSV Preview */}
          {csvPreview.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Vorschau</CardTitle>
                <CardDescription>
                  Erste Zeilen der CSV-Datei (max. 6 Spalten angezeigt)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {csvPreview[0]?.map((header, idx) => (
                          <th key={idx} className="text-left py-2 px-3 font-medium text-foreground">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(1).map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-border/50">
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="py-2 px-3 text-muted-foreground truncate max-w-[150px]">
                              {cell || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Options */}
          {file && (
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
                    Bestehende Produkte vor dem Import löschen
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
                    'Import starten'
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
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Produkte geparst</dt>
                    <dd className="text-2xl font-bold text-foreground">{importResult.totalParsed}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Produkte importiert</dt>
                    <dd className="text-2xl font-bold text-foreground">{importResult.inserted}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Kategorien erstellt</dt>
                    <dd className="text-2xl font-bold text-foreground">{importResult.categoriesCreated}</dd>
                  </div>
                </dl>

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
                      <a href="/products">Produkte ansehen →</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminImport;
