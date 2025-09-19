import express from "express";
const app = express();
app.use(express.json({ limit: "2mb" }));

// health
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

/**
 * POST /scrape-esker
 * Body: { po: "...", doc: "..." }
 */
app.post("/scrape-esker", async (req, res) => {
  const poRaw = (req.body?.po || "").toString().trim();
  const docRaw = (req.body?.doc || "").toString().trim();

  // PO: 5081xxxxxx | 5081-xxxxxx | x-xxxxxx | 4500xxxxxx
  const poOk = /^(?:5081[-\s]?\d{6}|x-\d{6}|4500\d{6})$/i.test(poRaw);
  // DOC: aceita 3–20 chars [A-Za-z0-9-_/]; exemplos: 76555, 76553, ABC-123
  const docOk = /^[A-Za-z0-9_\-\/]{3,20}$/.test(docRaw);

  if (!poOk || !docOk) {
    return res.status(400).json({
      ok: false,
      error: "Invalid or missing fields",
      details: {
        po_format: "5081xxxxxx | 5081-xxxxxx | x-xxxxxx | 4500xxxxxx",
        doc_format: "[A-Za-z0-9-_/], 3-20 chars"
      },
      received: { po: poRaw || null, doc: docRaw || null }
    });
  }

  const po = poRaw.toUpperCase().replace(/\s+/g, "").replace("-", "");
  const doc = docRaw.toUpperCase();

  // MOCK: retorna 1 invoice se DOC terminar com '5'; senão, vazio
  const found = /5$/.test(doc);
  const payload = {
    ok: true,
    po,
    doc,
    found_count: found ? 1 : 0,
    invoices: found ? [{
      supplier: "Mock Supplier Ltd",
      po_number: po,
      document_number: doc,
      date: new Date().toISOString().slice(0,10),
      confidence: 0.9,
      // pdf_base64: null // quando ligar o scraper real, pode retornar
    }] : []
  };

  return res.status(200).json(payload);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("listening on :" + PORT));
