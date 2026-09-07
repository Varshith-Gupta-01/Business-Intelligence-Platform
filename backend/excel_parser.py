import pandas as pd
import numpy as np
import math
from io import BytesIO
from typing import Dict, Any, Optional
try:
    from backend.semantic_profiler import profile_dataset
except ImportError:
    from semantic_profiler import profile_dataset

def sanitize_json_payload(obj: Any) -> Any:
    if obj is None:
        return None
    if isinstance(obj, dict):
        return {k: sanitize_json_payload(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [sanitize_json_payload(item) for item in obj]
    if isinstance(obj, (np.floating, float)):
        val = float(obj)
        if math.isnan(val) or math.isinf(val):
            return None
        return val
    if isinstance(obj, (np.integer, int)):
        return int(obj)
    if isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    if isinstance(obj, np.ndarray):
        return sanitize_json_payload(obj.tolist())
    return obj

def format_file_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.2f} MB"

def extract_dataset_overview(df: pd.DataFrame, file_name: str, file_size: int = 0, semantic_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    row_count = len(df)
    column_count = len(df.columns)
    total_cells = row_count * column_count

    total_missing_values = int(df.isna().sum().sum())
    rows_with_missing_values = int(df.isna().any(axis=1).sum())
    duplicate_rows = int(df.duplicated().sum())

    numeric_cols_count = 0
    categorical_cols_count = 0
    date_cols_count = 0

    detected_date_col = None
    min_date_str = None
    max_date_str = None
    date_range_str = "No date column detected"

    sales_keywords = {"sales", "revenue", "profit", "quantity", "qty", "product", "order_date", "customer", "region", "order id", "unit price", "discount", "invoiceno", "stockcode", "unitprice", "customerid", "invoicedate"}
    found_sales_indicators = 0

    # Quick lookup from semantic profile if available
    def clean_col(c: str) -> str:
        return "".join(e for e in str(c).lower().replace("_", " ").replace("-", " ") if e.isalnum() or e.isspace()).strip()

    profile_col_map = {}
    if semantic_profile and "columns" in semantic_profile:
        for c in semantic_profile["columns"]:
            raw_name = str(c["name"])
            profile_col_map[raw_name] = c
            profile_col_map[raw_name.strip()] = c
            profile_col_map[clean_col(raw_name)] = c

    for col in df.columns:
        col_str = str(col).strip()
        col_clean = clean_col(col_str)

        if any(kw in col_clean for kw in sales_keywords):
            found_sales_indicators += 1

        series_clean = df[col].dropna()

        if pd.api.types.is_numeric_dtype(df[col]):
            numeric_cols_count += 1
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            date_cols_count += 1
            if detected_date_col is None:
                detected_date_col = col_str
                try:
                    min_date = series_clean.min()
                    max_date = series_clean.max()
                    min_date_str = min_date.strftime("%b %Y") if hasattr(min_date, "strftime") else str(min_date)
                    max_date_str = max_date.strftime("%b %Y") if hasattr(max_date, "strftime") else str(max_date)
                    date_range_str = f"{min_date_str} — {max_date_str}"
                except Exception:
                    pass
        else:
            if "date" in col_clean or "time" in col_clean:
                try:
                    parsed_dates = pd.to_datetime(series_clean, errors='coerce').dropna()
                    if len(parsed_dates) > 0 and len(parsed_dates) >= 0.5 * len(series_clean):
                        date_cols_count += 1
                        if detected_date_col is None:
                            detected_date_col = col_str
                            min_date = parsed_dates.min()
                            max_date = parsed_dates.max()
                            min_date_str = min_date.strftime("%b %Y") if hasattr(min_date, "strftime") else str(min_date)
                            max_date_str = max_date.strftime("%b %Y") if hasattr(max_date, "strftime") else str(max_date)
                            date_range_str = f"{min_date_str} — {max_date_str}"
                    else:
                        categorical_cols_count += 1
                except Exception:
                    categorical_cols_count += 1
            else:
                categorical_cols_count += 1

    dataset_type = "Sales Dataset" if found_sales_indicators >= 2 else "General Dataset"

    column_summary = []
    for col in df.columns:
        col_str = str(col).strip()
        col_clean = clean_col(col_str)

        col_type = "Text / Category"
        if pd.api.types.is_numeric_dtype(df[col]):
            col_type = "Numeric"
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            col_type = "Date"
        elif ("date" in col_clean or "time" in col_clean):
            series_clean = df[col].dropna()
            try:
                parsed_dates = pd.to_datetime(series_clean, errors='coerce').dropna()
                if len(parsed_dates) > 0 and len(parsed_dates) >= 0.5 * len(series_clean):
                    col_type = "Date"
            except Exception:
                pass

        sem_role = "unknown"
        sem_conf = 0.50
        matched_profile = profile_col_map.get(col_str) or profile_col_map.get(col) or profile_col_map.get(col_clean)
        if matched_profile:
            sem_role = matched_profile.get("semantic_role", "unknown")
            sem_conf = matched_profile.get("confidence", 0.50)

        column_summary.append({
            "column_name": col_str,
            "data_type": col_type,
            "semantic_role": sem_role,
            "confidence": sem_conf,
            "unique_values": int(df[col].nunique(dropna=True)),
            "missing_values": int(df[col].isna().sum())
        })

    return {
        "file_name": file_name,
        "file_size": file_size,
        "file_size_formatted": format_file_size(file_size),
        "row_count": row_count,
        "column_count": column_count,
        "total_cells": total_cells,
        "numeric_columns_count": numeric_cols_count,
        "categorical_columns_count": categorical_cols_count,
        "date_columns_count": date_cols_count,
        "total_missing_values": total_missing_values,
        "rows_with_missing_values": rows_with_missing_values,
        "duplicate_rows": duplicate_rows,
        "date_column_name": detected_date_col or "None",
        "date_range": date_range_str,
        "dataset_type": dataset_type,
        "columns": column_summary
    }

def parse_sales_excel(file_content: bytes, file_name: str, file_size: int = 0) -> Dict[str, Any]:
    # Read Excel file using openpyxl engine
    try:
        df = pd.read_excel(BytesIO(file_content), engine='openpyxl')
    except Exception as e:
        raise ValueError(f"Could not read Excel file: {str(e)}")

    if df.empty:
        raise ValueError("The uploaded Excel worksheet is empty.")

    if file_size == 0:
        file_size = len(file_content)

    # Task 03: Profile dataset with Semantic Profiler
    semantic_profile = profile_dataset(df)

    # Extract Dataset Overview with Semantic Roles
    dataset_overview = extract_dataset_overview(df, file_name, file_size, semantic_profile)

    original_cols = [str(col).strip() for col in df.columns]
    
    # Standardize column headers for matching (lowercase, clean symbols)
    def clean_col(c: str) -> str:
        return "".join(e for e in c.lower().replace("_", " ").replace("-", " ") if e.isalnum() or e.isspace()).strip()

    clean_to_orig = {}
    for orig in original_cols:
        cleaned = clean_col(orig)
        clean_to_orig[cleaned] = orig

    # Flexible matching dictionary
    aliases = {
        "order_id": ["order id", "orderid", "order_id", "transaction id", "trans id", "id", "order number", "invoiceno", "invoice no"],
        "order_date": ["order date", "order_date", "orderdate", "date", "trans date", "transaction date", "ship date", "invoicedate", "invoice date"],
        "customer": ["customer", "customer name", "client", "buyer", "customer id", "client name", "customerid"],
        "product": ["product", "product name", "item", "item name", "product_name", "description", "stockcode", "stock code"],
        "category": ["category", "product category", "item category", "cat", "department", "sub category"],
        "region": ["region", "location", "territory", "zone", "country", "state", "city", "market"],
        "quantity": ["quantity", "qty", "units", "count", "quantity sold", "units sold"],
        "unit_price": ["unit price", "price", "unit_price", "rate", "price per unit", "unitprice"],
        "sales": ["sales", "revenue", "total sales", "amount", "total amount", "line total", "sales amount"],
        "discount": ["discount", "disc", "discount amount", "rebate"],
        "profit": ["profit", "net profit", "margin", "earnings", "total profit", "income"]
    }

    field_matching = {}
    for field, candidates in aliases.items():
        matched_orig = None
        for cand in candidates:
            if cand in clean_to_orig:
                matched_orig = clean_to_orig[cand]
                break
        if not matched_orig:
            for cleaned_key, orig in clean_to_orig.items():
                if any(cand in cleaned_key for cand in candidates):
                    matched_orig = orig
                    break
        if matched_orig:
            field_matching[field] = matched_orig

    # Extract clean dataframe for dashboard calculations
    norm_df = pd.DataFrame()
    for field, orig_col in field_matching.items():
        norm_df[field] = df[orig_col]

    # Derivations if missing columns
    if "sales" not in norm_df.columns and "quantity" in norm_df.columns and "unit_price" in norm_df.columns:
        try:
            norm_df["sales"] = pd.to_numeric(norm_df["quantity"], errors='coerce') * pd.to_numeric(norm_df["unit_price"], errors='coerce')
            field_matching["sales"] = "Calculated (Quantity * Unit Price)"
        except Exception:
            pass

    # Coerce numeric columns
    for num_col in ["sales", "profit", "quantity", "unit_price", "discount"]:
        if num_col in norm_df.columns:
            norm_df[num_col] = pd.to_numeric(norm_df[num_col], errors='coerce').fillna(0)

    # Coerce dates
    if "order_date" in norm_df.columns:
        norm_df["order_date"] = pd.to_datetime(norm_df["order_date"], errors='coerce')

    total_rows = len(df)

    # 1. KPI Calculations
    kpis = {}
    if "sales" in norm_df.columns:
        total_sales = float(norm_df["sales"].sum())
        kpis["total_sales"] = {
            "title": "Total Sales",
            "value": round(total_sales, 2),
            "formatted": f"${total_sales:,.2f}",
            "type": "currency"
        }

    if "profit" in norm_df.columns:
        total_profit = float(norm_df["profit"].sum())
        kpis["total_profit"] = {
            "title": "Total Profit",
            "value": round(total_profit, 2),
            "formatted": f"${total_profit:,.2f}",
            "type": "currency"
        }

    if "order_id" in norm_df.columns:
        unique_orders = int(norm_df["order_id"].nunique())
        kpis["total_orders"] = {
            "title": "Total Orders",
            "value": unique_orders,
            "formatted": f"{unique_orders:,}",
            "type": "number"
        }
    else:
        kpis["total_orders"] = {
            "title": "Total Orders",
            "value": total_rows,
            "formatted": f"{total_rows:,}",
            "type": "number"
        }

    if "quantity" in norm_df.columns:
        total_qty = float(norm_df["quantity"].sum())
        kpis["total_quantity"] = {
            "title": "Total Quantity",
            "value": round(total_qty, 0),
            "formatted": f"{int(total_qty):,}",
            "type": "number"
        }

    if "sales" in norm_df.columns:
        order_count = kpis["total_orders"]["value"]
        if order_count > 0:
            aov = kpis["total_sales"]["value"] / order_count
            kpis["avg_order_value"] = {
                "title": "Average Order Value",
                "value": round(aov, 2),
                "formatted": f"${aov:,.2f}",
                "type": "currency"
            }

    if "sales" in norm_df.columns and "profit" in norm_df.columns and kpis["total_sales"]["value"] > 0:
        profit_margin = (kpis["total_profit"]["value"] / kpis["total_sales"]["value"]) * 100
        kpis["profit_margin"] = {
            "title": "Profit Margin",
            "value": round(profit_margin, 2),
            "formatted": f"{profit_margin:.1f}%",
            "type": "percentage"
        }

    # 2. Charts Aggregation
    charts = {}

    # Chart 1: Sales Trend
    if "order_date" in norm_df.columns and "sales" in norm_df.columns:
        valid_dates = norm_df.dropna(subset=["order_date"]).copy()
        if not valid_dates.empty:
            valid_dates["period"] = valid_dates["order_date"].dt.to_period("M").astype(str)
            trend_group = valid_dates.groupby("period").agg(
                sales=("sales", "sum"),
                profit=("profit", "sum") if "profit" in norm_df.columns else ("sales", lambda x: 0)
            ).reset_index().sort_values("period")
            
            trend_data = []
            for _, row in trend_group.iterrows():
                item = {
                    "period": row["period"],
                    "sales": round(float(row["sales"]), 2)
                }
                if "profit" in norm_df.columns:
                    item["profit"] = round(float(row["profit"]), 2)
                trend_data.append(item)
            
            charts["sales_trend"] = {
                "title": "Sales & Profit Trend",
                "type": "line",
                "data": trend_data,
                "x_key": "period",
                "series": ["sales"] + (["profit"] if "profit" in norm_df.columns else [])
            }

    # Chart 2: Sales by Region
    if "region" in norm_df.columns and "sales" in norm_df.columns:
        region_group = norm_df.groupby("region").agg(
            sales=("sales", "sum"),
            profit=("profit", "sum") if "profit" in norm_df.columns else ("sales", lambda x: 0)
        ).reset_index().sort_values("sales", ascending=False).head(10)

        region_data = []
        for _, row in region_group.iterrows():
            item = {
                "region": str(row["region"]),
                "sales": round(float(row["sales"]), 2)
            }
            if "profit" in norm_df.columns:
                item["profit"] = round(float(row["profit"]), 2)
            region_data.append(item)

        charts["sales_by_region"] = {
            "title": "Sales by Region / Country",
            "type": "bar",
            "data": region_data,
            "x_key": "region",
            "series": ["sales"] + (["profit"] if "profit" in norm_df.columns else [])
        }

    # Chart 3: Sales by Category
    if "category" in norm_df.columns and "sales" in norm_df.columns:
        cat_group = norm_df.groupby("category").agg(
            sales=("sales", "sum"),
            profit=("profit", "sum") if "profit" in norm_df.columns else ("sales", lambda x: 0)
        ).reset_index().sort_values("sales", ascending=False).head(10)

        cat_data = []
        for _, row in cat_group.iterrows():
            item = {
                "category": str(row["category"]),
                "sales": round(float(row["sales"]), 2)
            }
            if "profit" in norm_df.columns:
                item["profit"] = round(float(row["profit"]), 2)
            cat_data.append(item)

        charts["sales_by_category"] = {
            "title": "Sales by Category",
            "type": "bar",
            "data": cat_data,
            "x_key": "category",
            "series": ["sales"] + (["profit"] if "profit" in norm_df.columns else [])
        }

    # Chart 4: Top 10 Products by Sales
    if "product" in norm_df.columns and "sales" in norm_df.columns:
        prod_group = norm_df.groupby("product").agg(
            sales=("sales", "sum"),
            quantity=("quantity", "sum") if "quantity" in norm_df.columns else ("sales", lambda x: 0)
        ).reset_index().sort_values("sales", ascending=False).head(10)

        prod_data = []
        for _, row in prod_group.iterrows():
            prod_name = str(row["product"])
            if len(prod_name) > 25:
                prod_name = prod_name[:22] + "..."
            item = {
                "product": prod_name,
                "full_name": str(row["product"]),
                "sales": round(float(row["sales"]), 2)
            }
            if "quantity" in norm_df.columns:
                item["quantity"] = round(float(row["quantity"]), 0)
            prod_data.append(item)

        charts["top_products"] = {
            "title": "Top 10 Products / Descriptions by Sales",
            "type": "horizontal_bar",
            "data": prod_data,
            "x_key": "product",
            "series": ["sales"]
        }

    # Task 04: Sanitize row records for client-side interactive cross-filtering
    records_df = df.copy()
    for col in records_df.columns:
        if pd.api.types.is_datetime64_any_dtype(records_df[col]):
            records_df[col] = records_df[col].dt.strftime("%Y-%m-%d").fillna("")
    records = records_df.where(pd.notnull(records_df), None).to_dict(orient="records")

    return sanitize_json_payload({
        "file_name": file_name,
        "total_rows": total_rows,
        "mapped_columns": {field: orig for field, orig in field_matching.items()},
        "unmapped_columns": [c for c in original_cols if c not in field_matching.values()],
        "dataset_overview": dataset_overview,
        "semantic_profile": semantic_profile,
        "records": records,
        "kpis": kpis,
        "charts": charts,
        "metadata": {
            "sheet_name": "Primary Worksheet",
            "total_columns": len(original_cols)
        }
    })
