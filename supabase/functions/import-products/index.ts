import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ParsedProduct {
  woo_id: number | null;
  sku: string | null;
  name: string;
  short_description: string | null;
  description: string | null;
  price: number | null;
  category: string | null;
  category_path: string | null;
  images: string[];
  in_stock: boolean;
  product_type: string;
  weight_kg: number | null;
  gtin: string | null;
  is_featured: boolean;
}

// Parse German number format (comma as decimal separator)
function parseGermanNumber(value: string): number | null {
  if (!value || value.trim() === "") return null;
  // Remove thousand separators (dots) and replace comma with dot
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

// Parse boolean from German/WooCommerce format
function parseBoolean(value: string): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return lower === "1" || lower === "ja" || lower === "yes" || lower === "true";
}

// Extract primary category from path like "Zubehör > elektrisch > Steuerung"
function extractPrimaryCategory(categoryPath: string): string | null {
  if (!categoryPath || categoryPath.trim() === "") return null;
  const parts = categoryPath.split(">").map((p) => p.trim());
  return parts[parts.length - 1] || null;
}

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);

  return result.map((field) => field.trim().replace(/^"|"$/g, ""));
}

// Parse the full CSV
function parseCSV(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => parseCSVLine(line));

  return { headers, rows };
}

// Map CSV row to product object
function mapRowToProduct(
  row: string[],
  headerMap: Map<string, number>
): ParsedProduct | null {
  const get = (header: string): string => {
    const idx = headerMap.get(header);
    return idx !== undefined ? row[idx] || "" : "";
  };

  const name = get("Name");
  if (!name || name.trim() === "") {
    return null; // Skip products without names
  }

  // Parse images (comma-separated URLs)
  const imagesRaw = get("Bilder");
  const images = imagesRaw
    ? imagesRaw
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url.startsWith("http"))
    : [];

  return {
    woo_id: parseInt(get("ID")) || null,
    sku: get("Artikelnummer") || null,
    name: name.trim(),
    short_description: get("Kurzbeschreibung") || null,
    description: get("Beschreibung") || null,
    price: parseGermanNumber(get("Regulärer Preis")),
    category: extractPrimaryCategory(get("Kategorien")),
    category_path: get("Kategorien") || null,
    images,
    in_stock: parseBoolean(get("Vorrätig?")),
    product_type: get("Typ") || "simple",
    weight_kg: parseGermanNumber(get("Gewicht (kg)")),
    gtin: get("GTIN, UPC, EAN oder ISBN") || null,
    is_featured: parseBoolean(get("Ist hervorgehoben?")),
  };
}

// Extract unique categories from products
function extractCategories(
  products: ParsedProduct[]
): { slug: string; name: string; parent_slug: string | null }[] {
  const categoryMap = new Map<
    string,
    { name: string; parent_slug: string | null }
  >();

  for (const product of products) {
    if (!product.category_path) continue;

    const parts = product.category_path.split(">").map((p) => p.trim());
    let parentSlug: string | null = null;

    for (const part of parts) {
      const slug = part
        .toLowerCase()
        .replace(/[äÄ]/g, "ae")
        .replace(/[öÖ]/g, "oe")
        .replace(/[üÜ]/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      if (!categoryMap.has(slug)) {
        categoryMap.set(slug, { name: part, parent_slug: parentSlug });
      }
      parentSlug = slug;
    }
  }

  return Array.from(categoryMap.entries()).map(([slug, data]) => ({
    slug,
    name: data.name,
    parent_slug: data.parent_slug,
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { csvData, clearExisting } = await req.json();

    if (!csvData || typeof csvData !== "string") {
      return new Response(
        JSON.stringify({ error: "CSV data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse CSV
    const { headers, rows } = parseCSV(csvData);

    if (headers.length === 0) {
      return new Response(
        JSON.stringify({ error: "CSV appears to be empty or invalid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create header map for easy lookup
    const headerMap = new Map<string, number>();
    headers.forEach((header, index) => {
      headerMap.set(header, index);
    });

    // Parse all products
    const products: ParsedProduct[] = [];
    for (const row of rows) {
      const product = mapRowToProduct(row, headerMap);
      if (product) {
        products.push(product);
      }
    }

    // Extract and insert categories
    const categories = extractCategories(products);

    // Clear existing data if requested
    if (clearExisting) {
      await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    // Insert categories
    if (categories.length > 0) {
      const { error: catError } = await supabase
        .from("categories")
        .upsert(categories, { onConflict: "slug" });

      if (catError) {
        console.error("Category insert error:", catError);
      }
    }

    // Insert products in batches
    const batchSize = 50;
    let inserted = 0;
    let errors: string[] = [];

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      const { error } = await supabase.from("products").insert(batch);

      if (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        inserted += batch.length;
      }
    }

    // Update category product counts
    for (const category of categories) {
      const count = products.filter(
        (p) => p.category?.toLowerCase() === category.name.toLowerCase()
      ).length;

      await supabase
        .from("categories")
        .update({ product_count: count })
        .eq("slug", category.slug);
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalParsed: products.length,
        inserted,
        categoriesCreated: categories.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Import error:", error);
    const errorMessage = error instanceof Error ? error.message : "Import failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});