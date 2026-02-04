import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfiguratorItemInsert {
  article_number: string;
  category: "lichtkuppel" | "aufsatzkranz" | "luefterrahmen" | "durchsturzsicherung" | "zubehoer";
  name: string;
  description: string | null;
  width_cm: number | null;
  length_cm: number | null;
  diameter_cm: number | null;
  height_cm: number | null;
  material: string | null;
  shells: number | null;
  u_value: number | null;
  wall_thickness_mm: number | null;
  surface: string | null;
  form: string | null;
  purchase_price: number | null;
  sale_price: number;
}

// Parse German price format (e.g., "141,90 €" -> 141.90)
function parseGermanPrice(priceStr: string): number | null {
  if (!priceStr || priceStr.trim() === "" || priceStr === "0,00 €") return null;
  const cleaned = priceStr.replace(/[€\s]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Parse dimensions from description like "ULW: 100x100 cm" or "OLW: Ø 60 cm"
function parseDimensions(description: string): { width: number | null; length: number | null; diameter: number | null } {
  let width: number | null = null;
  let length: number | null = null;
  let diameter: number | null = null;

  // Check for round (diameter)
  const diameterMatch = description.match(/(?:Ø|Ø\s*|OLW:\s*Ø)\s*(\d+)\s*cm/);
  if (diameterMatch) {
    diameter = parseInt(diameterMatch[1]);
  }

  // Check for rectangular dimensions like "100x100" or "ULW: 100x120 cm"
  const rectMatch = description.match(/(?:ULW:|OLW:)?\s*(\d+)x(\d+)\s*cm/);
  if (rectMatch) {
    width = parseInt(rectMatch[1]);
    length = parseInt(rectMatch[2]);
  }

  return { width, length, diameter };
}

// Parse height from description like "Höhe: 15 cm"
function parseHeight(description: string): number | null {
  const match = description.match(/Höhe:\s*(\d+)\s*cm/);
  return match ? parseInt(match[1]) : null;
}

// Parse wall thickness from description like "WD 20mm" or "WD 100mm"
function parseWallThickness(description: string): number | null {
  const match = description.match(/WD\s*(\d+)\s*mm/);
  return match ? parseInt(match[1]) : null;
}

// Parse U-value from description like "U=5,0 W/m²K" or "U=2,7 W/m¦K"
function parseUValue(description: string): number | null {
  const match = description.match(/U[=:]?\s*([\d,]+)\s*W/);
  if (match) {
    return parseFloat(match[1].replace(",", "."));
  }
  return null;
}

// Parse shell count from article number like "LK-100100-AC-1S" or description
function parseShells(articleNumber: string, description: string): number | null {
  // Try article number first
  const articleMatch = articleNumber.match(/(\d)S$/);
  if (articleMatch) {
    return parseInt(articleMatch[1]);
  }
  // Try description
  const descMatch = description.match(/(\d)-schalig/);
  return descMatch ? parseInt(descMatch[1]) : null;
}

// Parse material from article number or description
function parseMaterial(articleNumber: string, description: string): string | null {
  if (articleNumber.includes("-AC-") || description.includes("(AC)")) return "AC";
  if (articleNumber.includes("-HS-") || description.includes("HEATSTOP")) return "HS";
  if (articleNumber.includes("-PC-") || description.includes("(PC)")) return "PC";
  if (description.includes("GFK") || articleNumber.includes("GFK")) return "GFK";
  if (description.includes("ALU") || articleNumber.includes("ALU")) return "ALU";
  if (description.includes("Polyester")) return "GFK";
  return null;
}

// Parse surface type from description (for Durchsturzsicherung)
function parseSurface(articleNumber: string, description: string): string | null {
  if (articleNumber.endsWith("RV") || description.includes("RAL9010 + verzinkt")) return "RAL9010+verzinkt";
  if (articleNumber.endsWith("R") || description.includes("RAL9010")) return "RAL9010";
  if (articleNumber.endsWith("V") || description.includes("verzinkt")) return "verzinkt";
  return null;
}

// Determine form (rectangular or round)
function parseForm(articleNumber: string, description: string): string | null {
  if (description.includes("Ø") || description.includes("rund")) return "rund";
  if (description.includes("rechteckig") || description.match(/\d+x\d+/)) return "rechteckig";
  return null;
}

// Parse Lichtkuppel items
function parseLichtkuppel(rows: string[][]): ConfiguratorItemInsert[] {
  const items: ConfiguratorItemInsert[] = [];
  
  for (const row of rows) {
    if (row.length < 2) continue;
    const articleNumber = row[0]?.trim();
    if (!articleNumber?.startsWith("LK-")) continue;
    
    const description = row[1]?.trim() || "";
    const priceStr = row.find(cell => cell.includes("€") && !cell.includes("0,00 €")) || row[row.length - 2];
    const price = parseGermanPrice(priceStr || "");
    
    if (!price) continue;
    
    const dims = parseDimensions(description);
    
    items.push({
      article_number: articleNumber,
      category: "lichtkuppel",
      name: `Lichtkuppel ${dims.width}x${dims.length || dims.width} cm`,
      description: description,
      width_cm: dims.width,
      length_cm: dims.length,
      diameter_cm: dims.diameter,
      height_cm: null,
      material: parseMaterial(articleNumber, description),
      shells: parseShells(articleNumber, description),
      u_value: parseUValue(description),
      wall_thickness_mm: null,
      surface: null,
      form: dims.diameter ? "rund" : "rechteckig",
      purchase_price: null,
      sale_price: price,
    });
  }
  
  return items;
}

// Parse Aufsatzkranz items
function parseAufsatzkranz(rows: string[][]): ConfiguratorItemInsert[] {
  const items: ConfiguratorItemInsert[] = [];
  
  for (const row of rows) {
    if (row.length < 2) continue;
    const articleNumber = row[0]?.trim();
    if (!articleNumber?.startsWith("AKGFK") && !articleNumber?.startsWith("AKPVC")) continue;
    
    const description = row[1]?.trim() || "";
    const priceStr = row.find(cell => cell.includes("€") && !cell.includes("0,00 €"));
    const price = parseGermanPrice(priceStr || "");
    
    if (!price) continue;
    
    const dims = parseDimensions(description);
    const height = parseHeight(description);
    const wallThickness = parseWallThickness(description);
    
    items.push({
      article_number: articleNumber,
      category: "aufsatzkranz",
      name: `Aufsatzkranz GFK ${dims.width}x${dims.length || dims.width} cm H${height}`,
      description: description,
      width_cm: dims.width,
      length_cm: dims.length,
      diameter_cm: dims.diameter,
      height_cm: height,
      material: "GFK",
      shells: null,
      u_value: null,
      wall_thickness_mm: wallThickness,
      surface: null,
      form: dims.diameter ? "rund" : "rechteckig",
      purchase_price: null,
      sale_price: price,
    });
  }
  
  return items;
}

// Parse Lüfterrahmen items
function parseLuefterrahmen(rows: string[][]): ConfiguratorItemInsert[] {
  const items: ConfiguratorItemInsert[] = [];
  
  for (const row of rows) {
    if (row.length < 2) continue;
    const articleNumber = row[0]?.trim();
    if (!articleNumber?.startsWith("LR-")) continue;
    
    const description = row[1]?.trim() || "";
    const priceStr = row.find(cell => cell.includes("€") && !cell.includes("0,00 €"));
    const price = parseGermanPrice(priceStr || "");
    
    if (!price) continue;
    
    const dims = parseDimensions(description);
    const material = parseMaterial(articleNumber, description);
    
    items.push({
      article_number: articleNumber,
      category: "luefterrahmen",
      name: `Lüfterrahmen ${material} ${dims.diameter ? `Ø${dims.diameter}` : `${dims.width}x${dims.length}`} cm`,
      description: description,
      width_cm: dims.width,
      length_cm: dims.length,
      diameter_cm: dims.diameter,
      height_cm: null,
      material: material,
      shells: null,
      u_value: null,
      wall_thickness_mm: null,
      surface: null,
      form: dims.diameter ? "rund" : "rechteckig",
      purchase_price: null,
      sale_price: price,
    });
  }
  
  return items;
}

// Parse Durchsturzsicherung items
function parseDurchsturzsicherung(rows: string[][]): ConfiguratorItemInsert[] {
  const items: ConfiguratorItemInsert[] = [];
  
  for (const row of rows) {
    if (row.length < 2) continue;
    const articleNumber = row[0]?.trim();
    if (!articleNumber?.startsWith("DT")) continue;
    
    const description = row[1]?.trim() || "";
    const priceStr = row.find(cell => cell.includes("€") && !cell.includes("0,00 €"));
    const price = parseGermanPrice(priceStr || "");
    
    if (!price) continue;
    
    // Parse opening size from article number or description
    let width: number | null = null;
    let length: number | null = null;
    let diameter: number | null = null;
    
    // Check for round (e.g., DT100R means Ø100)
    const roundMatch = articleNumber.match(/^DT(\d+)(R|RV|V)$/);
    if (roundMatch) {
      diameter = parseInt(roundMatch[1]);
    } else {
      // Check for rectangular (e.g., DT100120R)
      const rectMatch = articleNumber.match(/^DT(\d+)(\d{3})(R|RV|V)?$/);
      if (rectMatch) {
        width = parseInt(rectMatch[1]);
        length = parseInt(rectMatch[2]);
      } else {
        // Try simpler pattern
        const simpleMatch = articleNumber.match(/^DT(\d{3})(\d{3})/);
        if (simpleMatch) {
          width = parseInt(simpleMatch[1]);
          length = parseInt(simpleMatch[2]);
        }
      }
    }
    
    // Fallback to description parsing
    if (!width && !diameter) {
      const dims = parseDimensions(description);
      width = dims.width;
      length = dims.length;
      diameter = dims.diameter;
    }
    
    const surface = parseSurface(articleNumber, description);
    
    items.push({
      article_number: articleNumber,
      category: "durchsturzsicherung",
      name: `Durchsturzsicherung ${diameter ? `Ø${diameter}` : `${width}x${length}`} cm ${surface || ""}`.trim(),
      description: description,
      width_cm: width,
      length_cm: length,
      diameter_cm: diameter,
      height_cm: null,
      material: "Stahl",
      shells: null,
      u_value: null,
      wall_thickness_mm: null,
      surface: surface,
      form: diameter ? "rund" : "rechteckig",
      purchase_price: null,
      sale_price: price,
    });
  }
  
  return items;
}

// Parse accessories (Zubehör)
function parseZubehoer(rows: string[][]): ConfiguratorItemInsert[] {
  const items: ConfiguratorItemInsert[] = [];
  
  const accessoryPrefixes = ["65487612", "DST", "ODT", "WLB"];
  
  for (const row of rows) {
    if (row.length < 2) continue;
    const articleNumber = row[0]?.trim();
    if (!articleNumber) continue;
    
    const isAccessory = accessoryPrefixes.some(prefix => articleNumber.startsWith(prefix));
    if (!isAccessory) continue;
    
    const description = row[1]?.trim() || "";
    const priceStr = row.find(cell => cell.includes("€") && !cell.includes("0,00 €"));
    const price = parseGermanPrice(priceStr || "");
    
    if (!price) continue;
    
    items.push({
      article_number: articleNumber,
      category: "zubehoer",
      name: description.substring(0, 100),
      description: description,
      width_cm: null,
      length_cm: null,
      diameter_cm: null,
      height_cm: null,
      material: null,
      shells: null,
      u_value: null,
      wall_thickness_mm: null,
      surface: null,
      form: null,
      purchase_price: null,
      sale_price: price,
    });
  }
  
  return items;
}

// Parse markdown table rows
function parseMarkdownTable(markdown: string): string[][] {
  const rows: string[][] = [];
  const lines = markdown.split("\n");
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || trimmed.includes("---")) continue;
    
    const cells = trimmed
      .split("|")
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);
    
    if (cells.length > 0) {
      rows.push(cells);
    }
  }
  
  return rows;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      lichtkuppelData, 
      kraenzeData, 
      luefterrahmenData, 
      durchsturzsicherungData,
      clearExisting 
    } = await req.json();

    const allItems: ConfiguratorItemInsert[] = [];
    const stats = {
      lichtkuppel: 0,
      aufsatzkranz: 0,
      luefterrahmen: 0,
      durchsturzsicherung: 0,
      zubehoer: 0,
    };

    // Parse Lichtkuppeln
    if (lichtkuppelData) {
      const rows = parseMarkdownTable(lichtkuppelData);
      const items = parseLichtkuppel(rows);
      const zubehoer = parseZubehoer(rows);
      allItems.push(...items, ...zubehoer);
      stats.lichtkuppel = items.length;
      stats.zubehoer += zubehoer.length;
    }

    // Parse Kränze
    if (kraenzeData) {
      const rows = parseMarkdownTable(kraenzeData);
      const items = parseAufsatzkranz(rows);
      const zubehoer = parseZubehoer(rows);
      allItems.push(...items, ...zubehoer);
      stats.aufsatzkranz = items.length;
      stats.zubehoer += zubehoer.length;
    }

    // Parse Lüfterrahmen
    if (luefterrahmenData) {
      const rows = parseMarkdownTable(luefterrahmenData);
      const items = parseLuefterrahmen(rows);
      const zubehoer = parseZubehoer(rows);
      allItems.push(...items, ...zubehoer);
      stats.luefterrahmen = items.length;
      stats.zubehoer += zubehoer.length;
    }

    // Parse Durchsturzsicherung
    if (durchsturzsicherungData) {
      const rows = parseMarkdownTable(durchsturzsicherungData);
      const items = parseDurchsturzsicherung(rows);
      allItems.push(...items);
      stats.durchsturzsicherung = items.length;
    }

    // Clear existing data if requested
    if (clearExisting) {
      await supabase.from("configurator_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    // Deduplicate by article number
    const uniqueItems = new Map<string, ConfiguratorItemInsert>();
    for (const item of allItems) {
      if (!uniqueItems.has(item.article_number)) {
        uniqueItems.set(item.article_number, item);
      }
    }

    // Insert in batches
    const itemsArray = Array.from(uniqueItems.values());
    const batchSize = 50;
    let inserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < itemsArray.length; i += batchSize) {
      const batch = itemsArray.slice(i, i + batchSize);
      const { error } = await supabase.from("configurator_items").insert(batch);
      
      if (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        inserted += batch.length;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalParsed: allItems.length,
        uniqueItems: itemsArray.length,
        inserted,
        stats,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Import failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
