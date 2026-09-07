import pandas as pd
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from semantic_profiler import profile_dataset

def test_sales_dataset_profiling():
    data = {
        "Order ID": [f"ORD-{i:04d}" for i in range(100)],
        "Order Date": pd.date_range("2025-01-01", periods=100),
        "Customer": [f"Customer {i%10}" for i in range(100)],
        "Product": [f"Product {i%5}" for i in range(100)],
        "Category": ["Technology" if i%2==0 else "Furniture" for i in range(100)],
        "Region": ["North", "South", "East", "West"] * 25,
        "Quantity": [i % 5 + 1 for i in range(100)],
        "Sales": [round(10.5 * i + 5.0, 2) for i in range(100)],
        "Profit": [round(2.5 * i, 2) for i in range(100)]
    }
    df = pd.DataFrame(data)
    result = profile_dataset(df)

    role_map = {col["name"]: col["semantic_role"] for col in result["columns"]}

    assert role_map["Order ID"] == "identifier", f"Expected identifier, got {role_map['Order ID']}"
    assert role_map["Order Date"] == "time_dimension", f"Expected time_dimension, got {role_map['Order Date']}"
    assert role_map["Category"] == "dimension", f"Expected dimension, got {role_map['Category']}"
    assert role_map["Sales"] == "measure", f"Expected measure, got {role_map['Sales']}"
    assert role_map["Profit"] == "measure", f"Expected measure, got {role_map['Profit']}"
    assert role_map["Quantity"] == "measure", f"Expected measure, got {role_map['Quantity']}"
    print("[PASS] Sales dataset profiling test passed.")

def test_online_retail_profiling_bugfix():
    data = {
        "InvoiceNo": ["536365", "C536379"] * 50,
        "StockCode": ["85123A", "71053"] * 50,
        "Description": ["WHITE HANGING HEART T-LIGHT HOLDER", "WHITE METAL LANTERN"] * 50,
        "Quantity": [6, -1] * 50,
        "InvoiceDate": pd.date_range("2010-12-01", periods=100),
        "UnitPrice": [2.55, 3.39] * 50,
        "CustomerID": [17850.0, 17850.0] * 50,
        "Country": ["United Kingdom", "France"] * 50
    }
    df = pd.DataFrame(data)
    result = profile_dataset(df)

    role_map = {col["name"]: col["semantic_role"] for col in result["columns"]}

    assert role_map["InvoiceNo"] == "identifier", f"Expected identifier for InvoiceNo, got {role_map['InvoiceNo']}"
    assert role_map["StockCode"] == "identifier", f"Expected identifier for StockCode, got {role_map['StockCode']}"
    assert role_map["Description"] == "attribute", f"Expected attribute for Description, got {role_map['Description']}"
    assert role_map["Quantity"] == "measure", f"Expected measure for Quantity, got {role_map['Quantity']}"
    assert role_map["InvoiceDate"] == "time_dimension", f"Expected time_dimension for InvoiceDate, got {role_map['InvoiceDate']}"
    assert role_map["UnitPrice"] == "measure", f"Expected measure for UnitPrice, got {role_map['UnitPrice']}"
    assert role_map["CustomerID"] == "identifier", f"Expected identifier for CustomerID, got {role_map['CustomerID']}"
    assert role_map["Country"] == "dimension", f"Expected dimension for Country, got {role_map['Country']}"

    # Verify filter candidates exclude identifiers and measures
    filter_cols = [c["column_name"] for c in result["filter_candidates"]]
    assert "Country" in filter_cols, "Country should be a filter candidate"
    assert "InvoiceDate" in filter_cols, "InvoiceDate should be a date filter candidate"
    assert "InvoiceNo" not in filter_cols, "InvoiceNo should NOT be a filter candidate"
    assert "CustomerID" not in filter_cols, "CustomerID should NOT be a filter candidate"
    assert "UnitPrice" not in filter_cols, "UnitPrice should NOT be a filter candidate"

    print("[PASS] Online Retail regression test passed successfully.")

def test_hr_dataset_profiling():
    data = {
        "Employee ID": [f"EMP-{i:03d}" for i in range(50)],
        "Employee Name": [f"Employee Name {i}" for i in range(50)],
        "Department": (["Engineering", "HR", "Sales", "Marketing"] * 13)[:50],
        "Salary": [50000 + i * 1000 for i in range(50)],
        "Joining Date": pd.date_range("2020-01-01", periods=50),
        "Active": [True if i % 2 == 0 else False for i in range(50)]
    }
    df = pd.DataFrame(data)
    result = profile_dataset(df)

    role_map = {col["name"]: col["semantic_role"] for col in result["columns"]}

    assert role_map["Employee ID"] == "identifier", f"Expected identifier, got {role_map['Employee ID']}"
    assert role_map["Department"] == "dimension", f"Expected dimension, got {role_map['Department']}"
    assert role_map["Salary"] == "measure", f"Expected measure, got {role_map['Salary']}"
    assert role_map["Joining Date"] == "time_dimension", f"Expected time_dimension, got {role_map['Joining Date']}"
    assert role_map["Active"] == "boolean", f"Expected boolean, got {role_map['Active']}"
    print("[PASS] HR dataset profiling test passed.")

def test_filter_candidate_exclusion():
    data = {
        "Transaction ID": [f"TX-{i:05d}" for i in range(100)],
        "Region": ["North", "South", "East", "West"] * 25,
        "Notes": [f"Long free text note {i}" for i in range(100)],
        "Revenue": [100.0 + i for i in range(100)]
    }
    df = pd.DataFrame(data)
    result = profile_dataset(df)

    candidates = [c["column_name"] for c in result["filter_candidates"]]

    assert "Region" in candidates, "Expected Region in filter candidates"
    assert "Transaction ID" not in candidates, "Transaction ID should be excluded from filter candidates"
    assert "Revenue" not in candidates, "Revenue should be excluded from filter candidates"
    print("[PASS] Filter candidate exclusion test passed.")

def test_json_serialization_safety():
    import json
    import numpy as np
    from excel_parser import sanitize_json_payload

    raw_payload = {
        "valid_number": 123.45,
        "nan_value": float("nan"),
        "inf_value": float("inf"),
        "neg_inf_value": float("-inf"),
        "numpy_nan": np.nan,
        "nested_dict": {
            "inner_nan": float("nan"),
            "inner_list": [1.0, float("nan"), float("inf")]
        }
    }

    sanitized = sanitize_json_payload(raw_payload)

    # Must serialize without raising ValueError: Out of range float values are not JSON compliant: nan
    json_str = json.dumps(sanitized)
    assert "NaN" not in json_str, "JSON string should not contain NaN"
    assert "Infinity" not in json_str, "JSON string should not contain Infinity"

    decoded = json.loads(json_str)
    assert decoded["valid_number"] == 123.45
    assert decoded["nan_value"] is None
    assert decoded["inf_value"] is None
    assert decoded["neg_inf_value"] is None
    assert decoded["numpy_nan"] is None
    assert decoded["nested_dict"]["inner_nan"] is None
    assert decoded["nested_dict"]["inner_list"] == [1.0, None, None]
    print("[PASS] JSON serialization safety test passed.")

if __name__ == "__main__":
    test_sales_dataset_profiling()
    test_online_retail_profiling_bugfix()
    test_hr_dataset_profiling()
    test_filter_candidate_exclusion()
    test_json_serialization_safety()
    print("ALL SEMANTIC PROFILER TESTS PASSED SUCCESSFULLY!")
