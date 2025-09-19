from fastapi import FastAPI

app = FastAPI(title="Esker Invoice Crawler (Hello)")

@app.get("/health")
def health():
    return {"ok": True}
