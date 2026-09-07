/**
 * Generic Dashboard Recalculator
 * Recalculates KPIs and Charts dynamically from filtered records
 */

export function recalculateDashboardData(initialData, activeFilters) {
  if (!initialData || !initialData.records) {
    return initialData;
  }

  const { records, mapped_columns, semantic_profile } = initialData;
  
  // Calculate active filter count (ignoring "All" / empty selections)
  let activeCount = 0;
  Object.entries(activeFilters || {}).forEach(([key, val]) => {
    if (key === 'dateRange') {
      if (val && (val.start || val.end)) activeCount++;
    } else if (val && val !== 'All' && val !== '') {
      activeCount++;
    }
  });

  if (activeCount === 0) {
    return {
      ...initialData,
      isFiltered: false,
      activeFilterCount: 0,
      filteredRowCount: records.length
    };
  }

  // Filter records
  const filteredRecords = records.filter(row => {
    for (const [key, val] of Object.entries(activeFilters)) {
      if (key === 'dateRange') {
        if (!val || (!val.start && !val.end)) continue;
        const colName = val.column;
        const rowDateStr = row[colName];
        if (!rowDateStr) return false;
        
        if (val.start && rowDateStr < val.start) return false;
        if (val.end && rowDateStr > val.end) return false;
      } else {
        if (!val || val === 'All' || val === '') continue;
        if (String(row[key]) !== String(val)) {
          return false;
        }
      }
    }
    return true;
  });

  const totalFilteredRows = filteredRecords.length;

  if (totalFilteredRows === 0) {
    return {
      ...initialData,
      isFiltered: true,
      activeFilterCount: activeCount,
      filteredRowCount: 0,
      isEmpty: true,
      kpis: {},
      charts: {}
    };
  }

  // Map normalized fields
  const colOrderDate = mapped_columns.order_date;
  const colSales = mapped_columns.sales;
  const colProfit = mapped_columns.profit;
  const colQuantity = mapped_columns.quantity;
  const colRegion = mapped_columns.region;
  const colCategory = mapped_columns.category;
  const colProduct = mapped_columns.product;
  const colOrderId = mapped_columns.order_id;

  // 1. Recalculate KPIs
  const newKpis = {};

  if (colSales) {
    const totalSales = filteredRecords.reduce((sum, r) => sum + (Number(r[colSales]) || 0), 0);
    newKpis.total_sales = {
      title: "Total Sales",
      value: round(totalSales, 2),
      formatted: `$${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      type: "currency"
    };
  }

  if (colProfit) {
    const totalProfit = filteredRecords.reduce((sum, r) => sum + (Number(r[colProfit]) || 0), 0);
    newKpis.total_profit = {
      title: "Total Profit",
      value: round(totalProfit, 2),
      formatted: `$${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      type: "currency"
    };
  }

  if (colOrderId) {
    const uniqueOrders = new Set(filteredRecords.map(r => r[colOrderId])).size;
    newKpis.total_orders = {
      title: "Total Orders",
      value: uniqueOrders,
      formatted: uniqueOrders.toLocaleString(),
      type: "number"
    };
  } else {
    newKpis.total_orders = {
      title: "Total Orders",
      value: totalFilteredRows,
      formatted: totalFilteredRows.toLocaleString(),
      type: "number"
    };
  }

  if (colQuantity) {
    const totalQty = filteredRecords.reduce((sum, r) => sum + (Number(r[colQuantity]) || 0), 0);
    newKpis.total_quantity = {
      title: "Total Quantity",
      value: Math.round(totalQty),
      formatted: Math.round(totalQty).toLocaleString(),
      type: "number"
    };
  }

  if (newKpis.total_sales && newKpis.total_orders) {
    const orderCnt = newKpis.total_orders.value;
    if (orderCnt > 0) {
      const aov = newKpis.total_sales.value / orderCnt;
      newKpis.avg_order_value = {
        title: "Average Order Value",
        value: round(aov, 2),
        formatted: `$${aov.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        type: "currency"
      };
    }
  }

  if (newKpis.total_sales && newKpis.total_profit && newKpis.total_sales.value > 0) {
    const margin = (newKpis.total_profit.value / newKpis.total_sales.value) * 100;
    newKpis.profit_margin = {
      title: "Profit Margin",
      value: round(margin, 2),
      formatted: `${margin.toFixed(1)}%`,
      type: "percentage"
    };
  }

  // 2. Recalculate Charts
  const newCharts = {};

  // Chart 1: Sales Trend (Monthly YYYY-MM)
  if (colOrderDate && colSales) {
    const periodMap = {};
    filteredRecords.forEach(r => {
      const dateStr = String(r[colOrderDate] || '');
      if (dateStr.length >= 7) {
        const period = dateStr.substring(0, 7); // YYYY-MM
        if (!periodMap[period]) {
          periodMap[period] = { sales: 0, profit: 0 };
        }
        periodMap[period].sales += Number(r[colSales]) || 0;
        if (colProfit) periodMap[period].profit += Number(r[colProfit]) || 0;
      }
    });

    const trendData = Object.keys(periodMap).sort().map(p => {
      const item = { period: p, sales: round(periodMap[p].sales, 2) };
      if (colProfit) item.profit = round(periodMap[p].profit, 2);
      return item;
    });

    newCharts.sales_trend = {
      title: "Sales & Profit Trend",
      type: "line",
      data: trendData,
      x_key: "period",
      series: ["sales"].concat(colProfit ? ["profit"] : [])
    };
  }

  // Chart 2: Sales by Region
  if (colRegion && colSales) {
    const regMap = {};
    filteredRecords.forEach(r => {
      const reg = String(r[colRegion] || 'Unknown');
      if (!regMap[reg]) regMap[reg] = { sales: 0, profit: 0 };
      regMap[reg].sales += Number(r[colSales]) || 0;
      if (colProfit) regMap[reg].profit += Number(r[colProfit]) || 0;
    });

    const regData = Object.keys(regMap).map(reg => ({
      region: reg,
      sales: round(regMap[reg].sales, 2),
      ...(colProfit ? { profit: round(regMap[reg].profit, 2) } : {})
    })).sort((a, b) => b.sales - a.sales).slice(0, 10);

    newCharts.sales_by_region = {
      title: "Sales by Region",
      type: "bar",
      data: regData,
      x_key: "region",
      series: ["sales"].concat(colProfit ? ["profit"] : [])
    };
  }

  // Chart 3: Sales by Category
  if (colCategory && colSales) {
    const catMap = {};
    filteredRecords.forEach(r => {
      const cat = String(r[colCategory] || 'Unknown');
      if (!catMap[cat]) catMap[cat] = { sales: 0, profit: 0 };
      catMap[cat].sales += Number(r[colSales]) || 0;
      if (colProfit) catMap[cat].profit += Number(r[colProfit]) || 0;
    });

    const catData = Object.keys(catMap).map(cat => ({
      category: cat,
      sales: round(catMap[cat].sales, 2),
      ...(colProfit ? { profit: round(catMap[cat].profit, 2) } : {})
    })).sort((a, b) => b.sales - a.sales).slice(0, 10);

    newCharts.sales_by_category = {
      title: "Sales by Category",
      type: "bar",
      data: catData,
      x_key: "category",
      series: ["sales"].concat(colProfit ? ["profit"] : [])
    };
  }

  // Chart 4: Top Products
  if (colProduct && colSales) {
    const prodMap = {};
    filteredRecords.forEach(r => {
      const prod = String(r[colProduct] || 'Unknown');
      if (!prodMap[prod]) prodMap[prod] = { sales: 0, quantity: 0 };
      prodMap[prod].sales += Number(r[colSales]) || 0;
      if (colQuantity) prodMap[prod].quantity += Number(r[colQuantity]) || 0;
    });

    const prodData = Object.keys(prodMap).map(prod => {
      const shortName = prod.length > 25 ? prod.substring(0, 22) + '...' : prod;
      return {
        product: shortName,
        full_name: prod,
        sales: round(prodMap[prod].sales, 2),
        ...(colQuantity ? { quantity: Math.round(prodMap[prod].quantity) } : {})
      };
    }).sort((a, b) => b.sales - a.sales).slice(0, 10);

    newCharts.top_products = {
      title: "Top 10 Products by Sales",
      type: "horizontal_bar",
      data: prodData,
      x_key: "product",
      series: ["sales"]
    };
  }

  // Chart 5: Profit Analysis
  if (colProfit && (colCategory || colRegion)) {
    const groupCol = colCategory || colRegion;
    const groupName = colCategory ? "Category" : "Region";
    const profMap = {};
    filteredRecords.forEach(r => {
      const key = String(r[groupCol] || 'Unknown');
      if (!profMap[key]) profMap[key] = { profit: 0, sales: 0 };
      profMap[key].profit += Number(r[colProfit]) || 0;
      if (colSales) profMap[key].sales += Number(r[colSales]) || 0;
    });

    const profData = Object.keys(profMap).map(k => ({
      name: k,
      profit: round(profMap[k].profit, 2),
      sales: round(profMap[k].sales, 2)
    })).sort((a, b) => b.profit - a.profit).slice(0, 10);

    newCharts.profit_analysis = {
      title: `Profit Breakdown by ${groupName}`,
      type: "bar",
      data: profData,
      x_key: "name",
      series: ["profit"]
    };
  }

  // Chart 6: Quantity Analysis
  if (colQuantity && (colCategory || colProduct)) {
    const groupCol = colCategory || colProduct;
    const groupName = colCategory ? "Category" : "Product";
    const qtyMap = {};
    filteredRecords.forEach(r => {
      const key = String(r[groupCol] || 'Unknown');
      if (!qtyMap[key]) qtyMap[key] = 0;
      qtyMap[key] += Number(r[colQuantity]) || 0;
    });

    const qtyData = Object.keys(qtyMap).map(k => {
      const name = k.length > 25 ? k.substring(0, 22) + '...' : k;
      return { name, quantity: Math.round(qtyMap[k]) };
    }).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

    newCharts.quantity_analysis = {
      title: `Quantity Sold by ${groupName}`,
      type: "bar",
      data: qtyData,
      x_key: "name",
      series: ["quantity"]
    };
  }

  return {
    ...initialData,
    isFiltered: true,
    activeFilterCount: activeCount,
    filteredRowCount: totalFilteredRows,
    isEmpty: false,
    kpis: newKpis,
    charts: newCharts
  };
}

function round(val, decimals = 2) {
  return Number(Math.round(val + 'e' + decimals) + 'e-' + decimals);
}
