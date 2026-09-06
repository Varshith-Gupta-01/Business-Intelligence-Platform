from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import traceback
try:
    from backend.excel_parser import parse_sales_excel
except ImportError:
    from excel_parser import parse_sales_excel

app = FastAPI(title="AI Business Intelligence Platform - Dashboard API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "excel-dashboard-backend"}

@app.post("/api/dashboard/upload")
async def upload_excel_dashboard(file: UploadFile = File(...)):
    # 1. Validate file uploaded
    if not file:
        raise HTTPException(status_code=400, detail="No file provided in request.")

    filename = file.filename or "uploaded_sales_data.xlsx"

    # 2. Validate file extension (.xlsx support required)
    if not filename.lower().endswith(".xlsx"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only Excel '.xlsx' files are supported."
        )

    # 3. Read content
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read upload payload: {str(e)}")

    # 4. Parse Excel & calculate dashboard data
    try:
        dashboard_data = parse_sales_excel(content, filename, len(content))
        return {
            "success": True,
            "data": dashboard_data
        }
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the Excel file: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
