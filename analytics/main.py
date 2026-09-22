from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="NEXUS Intelligence Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))


@app.get("/health")
def health():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT NOW()")
    db_time = cur.fetchone()[0]
    cur.close()
    conn.close()

    return {
        "success": True,
        "service": "NEXUS Intelligence Engine",
        "database": "connected",
        "time": db_time
    }


@app.get("/analytics/overview")
def overview():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            COUNT(*) AS total_orders,
            COALESCE(SUM(total), 0) AS revenue,
            COALESCE(AVG(total), 0) AS average_order_value
        FROM orders
    """)

    orders, revenue, average_order_value = cur.fetchone()

    cur.execute("""
        SELECT COUNT(*)
        FROM customers
    """)
    customers = cur.fetchone()[0]

    cur.execute("""
        SELECT COALESCE(SUM(quantity), 0)
        FROM inventory
    """)
    stock_units = cur.fetchone()[0]

    cur.close()
    conn.close()

    return {
        "success": True,
        "orders": orders,
        "revenue": float(revenue),
        "average_order_value": float(average_order_value),
        "customers": customers,
        "stock_units": stock_units
    }

@app.get("/analytics/forecast")
def forecast():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT created_at::date AS day,
               COALESCE(SUM(total), 0)::float AS revenue
        FROM orders
        GROUP BY created_at::date
        ORDER BY day
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    values = [float(row[1]) for row in rows]

    if not values:
        return {
            "success": True,
            "forecast_daily_revenue": 0,
            "forecast_30_day_revenue": 0,
            "confidence": "low",
            "trend": "no-data"
        }

    window = values[-7:]
    average = sum(window) / len(window)

    if len(window) > 1:
        slope = (
            len(window) * sum(i * v for i, v in enumerate(window))
            - sum(range(len(window))) * sum(window)
        ) / (
            len(window) * sum(i*i for i in range(len(window)))
            - sum(range(len(window))) ** 2
        )
    else:
        slope = 0

    prediction = max(0, average + slope)

    trend = (
        "rising" if slope > 0.01 * max(average, 1)
        else "falling" if slope < -0.01 * max(average, 1)
        else "stable"
    )

    confidence = (
        "high" if len(values) >= 30
        else "medium" if len(values) >= 7
        else "low"
    )

    return {
        "success": True,
        "forecast_daily_revenue": round(prediction, 2),
        "forecast_30_day_revenue": round(prediction * 30, 2),
        "confidence": confidence,
        "trend": trend,
        "history": [
            {"date": str(day), "revenue": revenue}
            for day, revenue in rows
        ]
    }

@app.get("/analytics/product-demand")
def product_demand():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            p.id,
            p.name,
            p.sku,
            COALESCE(sales.units_sold, 0) AS units_sold,
            COALESCE(sales.revenue, 0)::float AS revenue,
            COALESCE(inv.stock, 0) AS stock
        FROM products p
        LEFT JOIN (
            SELECT product_id,
                   SUM(quantity) AS units_sold,
                   SUM(quantity * unit_price) AS revenue
            FROM order_items
            GROUP BY product_id
        ) sales ON sales.product_id = p.id
        LEFT JOIN (
            SELECT product_id,
                   SUM(quantity) AS stock
            FROM inventory
            GROUP BY product_id
        ) inv ON inv.product_id = p.id
        ORDER BY units_sold DESC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    products = []

    for product_id, name, sku, units_sold, revenue, stock in rows:
        units_sold = int(units_sold or 0)
        stock = int(stock or 0)

        daily_demand = units_sold / 30
        days_remaining = (
            round(stock / daily_demand, 1)
            if daily_demand > 0
            else None
        )

        if stock == 0:
            risk = "critical"
        elif days_remaining is not None and days_remaining <= 7:
            risk = "high"
        elif days_remaining is not None and days_remaining <= 30:
            risk = "medium"
        else:
            risk = "low"

        products.append({
            "id": product_id,
            "name": name,
            "sku": sku,
            "units_sold": units_sold,
            "revenue": float(revenue or 0),
            "stock": stock,
            "daily_demand": round(daily_demand, 2),
            "days_remaining": days_remaining,
            "risk": risk
        })

    return {
        "success": True,
        "products": products
    }

@app.get("/analytics/reorder")
def reorder_recommendations():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            p.id,
            p.name,
            p.sku,
            COALESCE(s.units_sold_30d, 0) AS units_sold_30d,
            COALESCE(inv.stock, 0) AS stock
        FROM products p
        LEFT JOIN (
            SELECT oi.product_id, SUM(oi.quantity) AS units_sold_30d
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY oi.product_id
        ) s ON s.product_id = p.id
        LEFT JOIN (
            SELECT product_id, SUM(quantity) AS stock
            FROM inventory
            GROUP BY product_id
        ) inv ON inv.product_id = p.id
        ORDER BY units_sold_30d DESC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    recommendations = []

    for product_id, name, sku, sold, stock in rows:
        sold = int(sold or 0)
        stock = int(stock or 0)

        daily_demand = sold / 30

        # Target: approximately 30 days of stock + 20% safety buffer
        target_stock = daily_demand * 30 * 1.20
        reorder_qty = max(0, round(target_stock - stock))

        if stock == 0 and daily_demand > 0:
            priority = "urgent"
        elif reorder_qty > 0:
            priority = "recommended"
        else:
            priority = "none"

        recommendations.append({
            "id": product_id,
            "name": name,
            "sku": sku,
            "stock": stock,
            "units_sold_30d": sold,
            "daily_demand": round(daily_demand, 2),
            "target_stock": round(target_stock),
            "reorder_quantity": reorder_qty,
            "priority": priority
        })

    recommendations.sort(
        key=lambda x: (
            {"urgent": 0, "recommended": 1, "none": 2}[x["priority"]],
            -x["reorder_quantity"]
        )
    )

    return {
        "success": True,
        "recommendations": recommendations
    }
