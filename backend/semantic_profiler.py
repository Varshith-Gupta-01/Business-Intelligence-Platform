import pandas as pd
import numpy as np
import re
from typing import Dict, Any, List, Optional

def profile_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    row_count = len(df)
    column_count = len(df.columns)
    
    columns_profile = []
    filter_candidates = []

    # Common keyword sets
    id_keywords = {"id", "code", "uuid", "guid", "key", "number", "no", "num", "hash", "trans", "sk", "pk", "invoiceno", "stockcode", "customerid", "orderid"}
    time_keywords = {"date", "time", "year", "month", "day", "timestamp", "created", "updated", "joining", "datetime", "dt", "period", "invoicedate", "orderdate"}
    measure_keywords = {"sales", "revenue", "profit", "cost", "amount", "price", "quantity", "units", "discount", "salary", "spend", "clicks", "conversions", "margin", "score", "total", "rate", "fee", "val", "value", "unitprice"}
    dim_keywords = {"region", "country", "state", "city", "category", "type", "department", "status", "group", "channel", "segment", "brand", "product", "item", "level", "gender", "zone", "market", "mode"}
    attr_keywords = {"name", "desc", "description", "address", "comment", "notes", "text", "summary", "title", "details", "remark"}
    bool_keywords = {"active", "is_", "has_", "flag", "paid", "cancelled", "deleted", "enabled"}

    def clean_name(s: str) -> str:
        # Split camelCase / PascalCase to space separated words
        s_spaced = re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', str(s))
        s_spaced = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1 \2', s_spaced)
        return "".join(c for c in s_spaced.lower().replace("_", " ").replace("-", " ") if c.isalnum() or c.isspace()).strip()

    def get_tokens(s: str) -> set:
        return set(clean_name(s).split())

    for col in df.columns:
        col_str = str(col).strip()
        tokens = get_tokens(col_str)
        col_clean = clean_name(col_str)

        series = df[col]
        non_null_series = series.dropna()
        missing_count = int(series.isna().sum())
        missing_pct = float(missing_count / row_count) if row_count > 0 else 0.0
        unique_count = int(series.nunique(dropna=True))
        unique_ratio = float(unique_count / row_count) if row_count > 0 else 0.0

        # Technical Data Type Detection
        tech_dtype = "unknown"
        if pd.api.types.is_numeric_dtype(series):
            tech_dtype = "numeric"
        elif pd.api.types.is_datetime64_any_dtype(series):
            tech_dtype = "datetime"
        elif pd.api.types.is_bool_dtype(series):
            tech_dtype = "boolean"
        else:
            # Check boolean pattern in strings or numbers
            unique_vals_set = set(non_null_series.astype(str).str.lower().str.strip().unique())
            if len(unique_vals_set) > 0 and unique_vals_set.issubset({"true", "false", "yes", "no", "0", "1", "y", "n", "active", "inactive", "t", "f"}):
                tech_dtype = "boolean"
            else:
                # Check date pattern in strings
                if any(kw in col_clean for kw in ["date", "time", "created", "joining", "period"]):
                    try:
                        parsed = pd.to_datetime(non_null_series, errors='coerce').dropna()
                        if len(parsed) > 0 and len(parsed) >= 0.6 * len(non_null_series):
                            tech_dtype = "datetime"
                        else:
                            tech_dtype = "string"
                    except Exception:
                        tech_dtype = "string"
                else:
                    tech_dtype = "string"

        # Flags for role detection
        is_id_name = any(kw in tokens for kw in id_keywords) or any(kw in col_clean for kw in ["id", "code", "uuid", "num", "number", "invoiceno", "stockcode", "customerid"])
        is_time_name = tech_dtype == "datetime" or any(kw in tokens for kw in time_keywords) or any(kw in col_clean for kw in ["date", "time", "invoicedate", "orderdate"])
        has_measure_kw = any(kw in tokens for kw in measure_keywords) or any(kw in col_clean for kw in ["sales", "revenue", "profit", "cost", "price", "quantity", "unitprice", "salary", "amount"])

        # Semantic Role & Confidence Classification
        semantic_role = "unknown"
        confidence = 0.50

        # Rule 1: Time Dimension
        if is_time_name:
            semantic_role = "time_dimension"
            confidence = 0.99 if tech_dtype == "datetime" else 0.92

        # Rule 2: Identifier (Explicit ID/Code/Number keyword AND NOT a measure keyword)
        elif is_id_name and not has_measure_kw:
            semantic_role = "identifier"
            confidence = 0.98 if any(kw in tokens for kw in id_keywords) else 0.92

        # Rule 3: High Uniqueness Identifier fallback (uniqueness ratio >= 85% and not a measure)
        elif unique_ratio >= 0.85 and row_count >= 20 and not has_measure_kw:
            semantic_role = "identifier"
            confidence = 0.88

        # Rule 4: Boolean
        elif tech_dtype == "boolean" or any(kw in tokens for kw in bool_keywords):
            semantic_role = "boolean"
            confidence = 0.95

        # Rule 5: Measure (Numeric datatype with measure keyword or continuous values)
        elif tech_dtype == "numeric" and not is_id_name:
            if has_measure_kw:
                semantic_role = "measure"
                confidence = 0.97
            elif unique_count > 15 or pd.api.types.is_float_dtype(series):
                semantic_role = "measure"
                confidence = 0.85
            elif unique_count <= 10:
                semantic_role = "dimension"
                confidence = 0.80
            else:
                semantic_role = "measure"
                confidence = 0.75

        # Rule 6: Dimension vs Attribute (for string/categorical columns)
        elif tech_dtype == "string":
            has_dim_kw = any(kw in tokens for kw in dim_keywords) or any(kw in col_clean for kw in dim_keywords)
            has_attr_kw = any(kw in tokens for kw in attr_keywords) or any(kw in col_clean for kw in attr_keywords)
            
            if has_attr_kw:
                semantic_role = "attribute"
                confidence = 0.90
            elif (unique_count <= 100 or unique_ratio < 0.20) or has_dim_kw:
                semantic_role = "dimension"
                confidence = 0.94 if has_dim_kw else 0.86
            elif unique_ratio >= 0.20:
                semantic_role = "attribute"
                confidence = 0.82
            else:
                semantic_role = "dimension"
                confidence = 0.75

        col_profile = {
            "name": col_str,
            "data_type": tech_dtype,
            "semantic_role": semantic_role,
            "confidence": round(confidence, 2),
            "unique_count": unique_count,
            "missing_count": missing_count,
            "missing_pct": round(missing_pct, 4)
        }
        columns_profile.append(col_profile)

        # Filter Candidate Evaluation
        if semantic_role in ["dimension", "boolean"] and unique_count > 1 and unique_count <= 50:
            options = [str(val) for val in non_null_series.unique() if str(val).strip() != ""]
            options.sort()
            filter_candidates.append({
                "column_name": col_str,
                "type": "select",
                "semantic_role": semantic_role,
                "options": options[:50]
            })
        elif semantic_role == "time_dimension":
            filter_candidates.append({
                "column_name": col_str,
                "type": "date_range",
                "semantic_role": semantic_role
            })

    return {
        "dataset": {
            "row_count": row_count,
            "column_count": column_count
        },
        "columns": columns_profile,
        "filter_candidates": filter_candidates
    }
