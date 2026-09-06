import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_sample_sales_data(num_rows=300):
    np.random.seed(42)
    random.seed(42)

    categories = {
        "Technology": ["Laptops", "Smartphones", "Monitors", "Headphones", "Keyboards"],
        "Furniture": ["Ergonomic Chairs", "Desks", "Bookshelves", "Filing Cabinets"],
        "Office Supplies": ["Binders", "Paper Reams", "Pens & Markers", "Staplers", "Sticky Notes"]
    }

    regions = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East"]
    customers = [f"Customer {chr(65 + i)}{i+1:02d}" for i in range(25)]

    start_date = datetime(2025, 1, 1)
    
    data = []
    for i in range(1, num_rows + 1):
        order_id = f"ORD-{2025000 + i}"
        days_offset = random.randint(0, 365)
        order_date = (start_date + timedelta(days=days_offset)).strftime("%Y-%m-%d")
        
        category = random.choice(list(categories.keys()))
        product = random.choice(categories[category])
        region = random.choice(regions)
        customer = random.choice(customers)
        
        quantity = random.randint(1, 15)
        
        if category == "Technology":
            unit_price = round(random.uniform(150.0, 1200.0), 2)
            margin_pct = random.uniform(0.20, 0.45)
        elif category == "Furniture":
            unit_price = round(random.uniform(80.0, 600.0), 2)
            margin_pct = random.uniform(0.15, 0.35)
        else:
            unit_price = round(random.uniform(5.0, 50.0), 2)
            margin_pct = random.uniform(0.25, 0.50)

        sales = round(quantity * unit_price, 2)
        discount = round(sales * random.choice([0, 0, 0, 0.05, 0.10]), 2)
        net_sales = sales - discount
        profit = round(net_sales * margin_pct, 2)

        data.append({
            "Order ID": order_id,
            "Order Date": order_date,
            "Customer": customer,
            "Product": product,
            "Category": category,
            "Region": region,
            "Quantity": quantity,
            "Unit Price": unit_price,
            "Sales": sales,
            "Discount": discount,
            "Profit": profit
        })

    df = pd.DataFrame(data)
    df.to_excel("sample_sales.xlsx", index=False, engine="openpyxl")
    print(f"Successfully generated sample_sales.xlsx with {len(df)} rows.")

if __name__ == "__main__":
    generate_sample_sales_data()
