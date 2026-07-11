import React, { useState } from 'react';
import { Download, FileSpreadsheet, TrendingUp } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import { AreaChartWidget, BarChartWidget } from '../components/Charts';
import Table from '../components/Table';

export const Reports = ({
  orders = [],
  products = [],
  customers = [],
  addToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState('sales');

  const reportTabs = [
    { key: 'sales', label: 'Sales & Revenue' },
    { key: 'products', label: 'Product Performance' },
    { key: 'customers', label: 'Customer Lifetime Values' }
  ];

  // CSV Exporter helper
  const downloadCSVReport = (type) => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (type === 'sales') {
      headers = ['Order ID', 'Date', 'Customer', 'Total', 'Payment Status'];
      rows = orders.map(o => [`#${o.id}`, o.date, o.customerName, o.total, o.paymentStatus]);
      filename = 'sales_revenue_report.csv';
    } else if (type === 'products') {
      headers = ['Product Name', 'SKU', 'Stock Level', 'Regular Price', 'Cost Price'];
      rows = products.map(p => [p.name, p.sku, p.stock, p.regularPrice, p.costPrice]);
      filename = 'product_performance_report.csv';
    } else {
      headers = ['Customer Name', 'Email', 'Phone', 'Lifetime Value', 'Rewards Points'];
      rows = customers.map(c => [c.name, c.email, c.phone, c.lifetimeValue, c.rewardsPoints]);
      filename = 'customer_ltv_report.csv';
    }

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(",")].concat(rows.map(r => r.map(cell => `"${cell}"`).join(","))).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Successfully downloaded ${filename}`, 'success');
  };

  // Mock Sales Trend
  const mockDailySales = [
    { name: 'June 25', value: 120 },
    { name: 'June 26', value: 340 },
    { name: 'June 27', value: 290 },
    { name: 'June 28', value: 670 },
    { name: 'June 29', value: 450 },
    { name: 'June 30', value: 890 },
    { name: 'July 01', value: 1200 }
  ];

  // Mock Product performance metrics
  const productPerformCols = [
    { key: 'name', label: 'Product Name', render: (row) => <span style={{ fontWeight: '600' }}>{row.name}</span> },
    { key: 'sku', label: 'SKU' },
    { key: 'regularPrice', label: 'Retail Price', render: (row) => <span>${row.regularPrice.toFixed(2)}</span> },
    { key: 'costPrice', label: 'Unit Cost', render: (row) => <span>${row.costPrice.toFixed(2)}</span> },
    {
      key: 'margin',
      label: 'Gross Profit Margin',
      render: (row) => {
        const margin = ((row.regularPrice - row.costPrice) / row.regularPrice) * 100;
        return <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{margin.toFixed(1)}%</span>;
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Enterprise Reports Centre</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Audit storefront financials, review margin metrics, and compile CSV spreadsheets.</p>
        </div>
        <Button variant="primary" size="sm" icon={Download} onClick={() => downloadCSVReport(activeSubTab)}>
          Export Report
        </Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={reportTabs} activeTab={activeSubTab} onChange={setActiveSubTab} />

      {/* Dynamic Tab Renders */}
      {activeSubTab === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card title="Sales Revenue Growth trend">
            <div style={{ height: '300px', marginTop: '16px' }}>
              <AreaChartWidget data={mockDailySales} xKey="name" yKeys={['value']} height={280} />
            </div>
          </Card>
          <Card title="Summary Financial Table">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span>Total Gross Sales</span>
                <strong>${orders.reduce((sum,o)=>sum+o.total,0).toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span>Completed Shipments</span>
                <strong>{orders.filter(o=>o.deliveryStatus==='Delivered').length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <span>Cancelled Orders</span>
                <strong>{orders.filter(o=>o.deliveryStatus==='Cancelled').length}</strong>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeSubTab === 'products' && (
        <Card title="Product Yield & Margin Audits">
          <div style={{ marginTop: '12px' }}>
            <Table
              columns={productPerformCols}
              data={products}
              initialRowsPerPage={5}
            />
          </div>
        </Card>
      )}

      {activeSubTab === 'customers' && (
        <Card title="Customer Life Time Values (LTV) Rankings">
          <div style={{ marginTop: '12px' }}>
            <Table
              columns={[
                { key: 'name', label: 'Customer Name', render: (row) => <span style={{ fontWeight: '600' }}>{row.name}</span> },
                { key: 'email', label: 'Email Address' },
                { key: 'lifetimeValue', label: 'LTV Gross Spent', render: (row) => <strong style={{ color: 'var(--primary)' }}>${row.lifetimeValue.toFixed(2)}</strong> },
                { key: 'rewardsPoints', label: 'Reward Balances', render: (row) => <span>{row.rewardsPoints} pts</span> }
              ]}
              data={customers.sort((a,b)=>b.lifetimeValue - a.lifetimeValue)}
              initialRowsPerPage={5}
            />
          </div>
        </Card>
      )}

    </div>
  );
};
export default Reports;
