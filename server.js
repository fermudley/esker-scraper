import express from "express";
const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/healthz", (_req, res) => res.status(200).send("ok"));

app.post("/scrape-esker", async (req, res) => {
  const poRaw = (req.body?.po || "").toString().trim();
  const regex = /^(?:5081[-\s]?\d{6}|x-\d{6}|4500\d{6})$/i;
  if (!poRaw || !regex.test(poRaw)) {
    return res.status(400).json({
      ok: false,
      error: "Invalid or missing PO. Use 5081xxxxxx, x-xxxxxx, or 4500xxxxxx",
      received: poRaw || null
    });
  }
  const po = poRaw.toUpperCase().replace(/\s+/g, "").replace("-", "");
  // MOCK: retorne 1 invoice se terminar com 9, senão vazio
  const found = /9$/.test(po);
  return res.json({
    ok: true,
    po,
    found_count: found ? 1 : 0,
    invoices: found ? [{
      supplier: "Mock Supplier Ltd",
      po_number: po,
      document_number: "MOCK-76555",
      date: new Date().toISOString().slice(0,10),
      confidence: 0.9
    }] : []
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("listening on :" + PORT));
