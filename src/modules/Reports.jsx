import React, { useState, useEffect } from 'react';
import {
  Download, FileSpreadsheet, TrendingUp, Calendar, RefreshCw, FileText,
  Filter, CheckCircle, Package, DollarSign, Users, Ticket, Truck,
  CreditCard, ShieldCheck, BarChart3, PieChart as PieIcon, Search,
  ArrowUpRight, ArrowDownRight, Layers, Sparkles, HelpCircle, AlertCircle
} from 'lucide-react';
import Button from '../components/Button';
import Card, { StatsCard } from '../components/Card';
import ListView from '../components/ListView';
import Badge from '../components/Badge';
import Input, { Select } from '../components/Input';
import { AreaChartWidget, BarChartWidget, DonutChartWidget, LineChartWidget } from '../components/Charts';
import {
  fetchSalesReport,
  fetchCustomersReport,
  fetchOrdersReport,
  fetchInventoryReport,
  fetchCouponsReport,
  fetchTaxesReport,
  fetchDeliveriesReport,
  fetchPaymentsReport,
  fetchSearchAnalytics,
  fetchTopSearches
} from '../services/api';

// Loading Skeleton Component for smooth loading transitions
const SkeletonRow = () => (
  <div style={{
    display: 'flex',
    gap: '16px',
    padding: '16px',
    borderBottom: '1px solid var(--border-color)',
    alignItems: 'center',
    animation: 'pulse 1.5s infinite ease-in-out'
  }}>
    <div style={{ width: '120px', height: '16px', backgroundColor: 'var(--border-color)', borderRadius: '4px' }} />
    <div style={{ width: '180px', height: '16px', backgroundColor: 'var(--border-color)', borderRadius: '4px' }} />
    <div style={{ width: '90px', height: '16px', backgroundColor: 'var(--border-color)', borderRadius: '4px' }} />
    <div style={{ width: '100px', height: '16px', backgroundColor: 'var(--border-color)', borderRadius: '4px', marginLeft: 'auto' }} />
  </div>
);

const SkeletonCard = () => (
  <div style={{
    height: '240px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    animation: 'pulse 1.5s infinite ease-in-out'
  }}>
    <div style={{ width: '40%', height: '18px', backgroundColor: 'var(--border-color)', borderRadius: '4px' }} />
    <div style={{ width: '100%', height: '160px', backgroundColor: 'var(--border-color)', borderRadius: '8px' }} />
  </div>
);

export const Reports = ({ addToast }) => {
  const [activeTab, setActiveTab] = useState('sales');
  const [format, setFormat] = useState('json');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePreset, setActivePreset] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [reportData, setReportData] = useState([]);
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Search Analytics state
  const [searchSummary, setSearchSummary] = useState({
    totalSearches: 0,
    zeroResultSearches: 0,
    uniqueUsersCount: 0
  });

  const reportTabs = [
    { key: 'sales', label: 'Sales Report', icon: TrendingUp },
    { key: 'customers', label: 'Customer Report', icon: Users },
    { key: 'orders', label: 'Order Report', icon: FileText },
    { key: 'inventory', label: 'Inventory Report', icon: Package },
    { key: 'coupons', label: 'Coupon Report', icon: Ticket },
    { key: 'taxes', label: 'Tax Report', icon: DollarSign },
    { key: 'deliveries', label: 'Delivery Report', icon: Truck },
    { key: 'payments', label: 'Payment Report', icon: CreditCard },
    { key: 'search', label: 'Search Analytics', icon: Search }
  ];

  // Quick Date Preset Handler
  const handlePresetSelect = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    const formatDateStr = (d) => d.toISOString().split('T')[0];

    if (preset === 'today') {
      setStartDate(formatDateStr(today));
      setEndDate(formatDateStr(today));
    } else if (preset === '7days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 7);
      setStartDate(formatDateStr(past));
      setEndDate(formatDateStr(today));
    } else if (preset === '30days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      setStartDate(formatDateStr(past));
      setEndDate(formatDateStr(today));
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(formatDateStr(firstDay));
      setEndDate(formatDateStr(today));
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  // Fetch report data based on active tab
  const loadReport = async () => {
    setLoading(true);
    const params = { format: 'json' };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    try {
      if (activeTab === 'search') {
        const [aRes, tRes] = await Promise.all([
          fetchSearchAnalytics(),
          fetchTopSearches({ limit: 50 })
        ]);

        if (aRes && aRes.success !== false) {
          const stats = aRes.data || {};
          setSearchSummary({
            totalSearches: stats.totalSearches || 0,
            zeroResultSearches: stats.zeroResultSearches || 0,
            uniqueUsersCount: stats.uniqueUsersCount || 0
          });
        }

        if (tRes && tRes.success !== false) {
          const topList = tRes.data?.topSearches || (Array.isArray(tRes.data) ? tRes.data : []);
          setReportData(Array.isArray(topList) ? topList : []);
          setReportCount(topList.length);
        } else {
          setReportData([]);
          setReportCount(0);
        }
      } else {
        let res;
        switch (activeTab) {
          case 'sales': res = await fetchSalesReport(params); break;
          case 'customers': res = await fetchCustomersReport(params); break;
          case 'orders': res = await fetchOrdersReport(params); break;
          case 'inventory': res = await fetchInventoryReport(params); break;
          case 'coupons': res = await fetchCouponsReport(params); break;
          case 'taxes': res = await fetchTaxesReport(params); break;
          case 'deliveries': res = await fetchDeliveriesReport(params); break;
          case 'payments': res = await fetchPaymentsReport(params); break;
          default: res = await fetchSalesReport(params); break;
        }

        if (res && res.success !== false) {
          const dataList = res.data || (Array.isArray(res) ? res : []);
          setReportData(Array.isArray(dataList) ? dataList : []);
          setReportCount(res.count !== undefined ? res.count : (Array.isArray(dataList) ? dataList.length : 0));
        } else {
          setReportData([]);
          setReportCount(0);
        }
      }
    } catch (err) {
      console.error(`Error loading ${activeTab} report:`, err);
      setReportData([]);
      setReportCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [activeTab, startDate, endDate]);

  // Export report in selected format (json, csv, excel, pdf)
  const handleExportReport = async () => {
    setExporting(true);
    const params = { format };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    try {
      let res;
      if (activeTab === 'search') {
        res = await fetchTopSearches({ limit: 100 });
      } else {
        switch (activeTab) {
          case 'sales': res = await fetchSalesReport(params); break;
          case 'customers': res = await fetchCustomersReport(params); break;
          case 'orders': res = await fetchOrdersReport(params); break;
          case 'inventory': res = await fetchInventoryReport(params); break;
          case 'coupons': res = await fetchCouponsReport(params); break;
          case 'taxes': res = await fetchTaxesReport(params); break;
          case 'deliveries': res = await fetchDeliveriesReport(params); break;
          case 'payments': res = await fetchPaymentsReport(params); break;
          default: res = await fetchSalesReport(params); break;
        }
      }

      if (format === 'json') {
        const jsonStr = JSON.stringify(res?.data || reportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeTab}_report_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        if (addToast) addToast(`Exported ${activeTab} report as JSON`, 'success');
      } else {
        let csvRows = [];
        if (Array.isArray(reportData) && reportData.length > 0) {
          const keys = Object.keys(reportData[0]);
          csvRows.push(keys.join(','));
          reportData.forEach(row => {
            csvRows.push(keys.map(k => `"${row[k] !== undefined ? row[k] : ''}"`).join(','));
          });
        }
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${activeTab}_report_${format}_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (addToast) addToast(`Exported ${activeTab} report as ${format.toUpperCase()}`, 'success');
      }
    } catch (err) {
      console.error('Export error:', err);
      if (addToast) addToast(`Error exporting ${activeTab} report`, 'danger');
    } finally {
      setExporting(false);
    }
  };

  // Compute KPI Summary Cards ONLY from real data
  const renderKPIs = () => {
    if (activeTab === 'search') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <StatsCard title="Total Customer Searches" value={searchSummary.totalSearches} icon={Search} iconColor="#6366f1" iconBg="#ede9fe" />
          <StatsCard title="Zero Result Searches" value={searchSummary.zeroResultSearches} icon={AlertCircle} iconColor="#ef4444" iconBg="#fee2e2" />
          <StatsCard title="Unique Searching Users" value={searchSummary.uniqueUsersCount} icon={Users} iconColor="#0ea5e9" iconBg="#e0f2fe" />
          <StatsCard title="Tracked Keywords" value={reportData.length} icon={Sparkles} iconColor="#10b981" iconBg="#d1fae5" />
        </div>
      );
    }

    if (activeTab === 'sales') {
      const grossRev = reportData.reduce((sum, r) => sum + Number(r.total || 0), 0);
      const subTot = reportData.reduce((sum, r) => sum + Number(r.subTotal || 0), 0);
      const discounts = reportData.reduce((sum, r) => sum + Number(r.discount || 0), 0);
      const avgValue = reportData.length > 0 ? (grossRev / reportData.length) : 0;

      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <StatsCard title="Gross Sales Revenue" value={`£${grossRev.toFixed(2)}`} icon={DollarSign} iconColor="#10b981" iconBg="#d1fae5" />
          <StatsCard title="SubTotal Base" value={`£${subTot.toFixed(2)}`} icon={TrendingUp} iconColor="#6366f1" iconBg="#ede9fe" />
          <StatsCard title="Avg Order Value (AOV)" value={`£${avgValue.toFixed(2)}`} icon={FileText} iconColor="#0ea5e9" iconBg="#e0f2fe" />
          <StatsCard title="Total Discounts Claimed" value={`£${discounts.toFixed(2)}`} icon={Ticket} iconColor="#f59e0b" iconBg="#fef3c7" />
        </div>
      );
    }

    if (activeTab === 'customers') {
      const totalCust = reportData.length;
      const totalSpentSum = reportData.reduce((sum, c) => sum + (typeof c.totalSpent === 'number' ? c.totalSpent : parseFloat(String(c.totalSpent || 0).replace(/[^0-9.]/g, '')) || 0), 0);
      const avgSpent = totalCust > 0 ? totalSpentSum / totalCust : 0;

      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <StatsCard title="Total Customers" value={totalCust} icon={Users} iconColor="#6366f1" iconBg="#ede9fe" />
          <StatsCard title="Gross Customer Spend" value={`£${totalSpentSum.toFixed(2)}`} icon={DollarSign} iconColor="#10b981" iconBg="#d1fae5" />
          <StatsCard title="Average Lifetime Value" value={`£${avgSpent.toFixed(2)}`} icon={TrendingUp} iconColor="#0ea5e9" iconBg="#e0f2fe" />
        </div>
      );
    }

    if (activeTab === 'orders') {
      const totalOrd = reportData.length;
      const delivered = reportData.filter(o => o.status === 'Delivered').length;
      const paid = reportData.filter(o => o.paymentStatus === 'Paid').length;
      const fulfillmentRate = totalOrd > 0 ? ((delivered / totalOrd) * 100).toFixed(1) : '0';

      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <StatsCard title="Total Orders" value={totalOrd} icon={FileText} iconColor="#6366f1" iconBg="#ede9fe" />
          <StatsCard title="Fulfillment Rate" value={`${fulfillmentRate}%`} icon={CheckCircle} iconColor="#10b981" iconBg="#d1fae5" />
          <StatsCard title="Paid Orders" value={paid} icon={CreditCard} iconColor="#0ea5e9" iconBg="#e0f2fe" />
        </div>
      );
    }

    if (activeTab === 'inventory') {
      const totalSkus = reportData.length;
      const lowStock = reportData.filter(i => (i.stock || 0) > 0 && (i.stock || 0) < 10).length;
      const outStock = reportData.filter(i => (i.stock || 0) === 0).length;

      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <StatsCard title="Monitored SKUs" value={totalSkus} icon={Package} iconColor="#6366f1" iconBg="#ede9fe" />
          <StatsCard title="Low Stock Items" value={lowStock} icon={Filter} iconColor="#f59e0b" iconBg="#fef3c7" />
          <StatsCard title="Out of Stock Items" value={outStock} icon={Layers} iconColor="#ef4444" iconBg="#fee2e2" />
        </div>
      );
    }

    return null;
  };

  // Dynamic Chart Generator based EXCLUSIVELY on real data
  const renderTabChart = () => {
    if (loading) {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      );
    }

    if (!Array.isArray(reportData) || reportData.length === 0) {
      return null;
    }

    if (activeTab === 'search') {
      const searchChartData = reportData.slice(0, 10).map(s => ({
        name: s.query || s.keyword || 'Search',
        value: Number(s.count || s.searches || 1)
      }));

      return (
        <Card title="Top Searched Keywords Frequency">
          <div style={{ height: '250px', marginTop: '12px' }}>
            <BarChartWidget data={searchChartData} xKey="name" yKey="value" height={230} />
          </div>
        </Card>
      );
    }

    if (activeTab === 'sales') {
      const salesChartData = reportData.map(r => ({
        name: r.orderNumber || r.date || 'Order',
        value: Number(r.total || 0),
        subTotal: Number(r.subTotal || 0)
      }));

      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <Card title="Sales Revenue Growth Trend">
            <div style={{ height: '240px', marginTop: '12px' }}>
              <AreaChartWidget data={salesChartData} xKey="name" yKeys={['value']} height={220} />
            </div>
          </Card>
          <Card title="SubTotal vs Gross Revenue Comparison">
            <div style={{ height: '240px', marginTop: '12px' }}>
              <BarChartWidget data={salesChartData} xKey="name" yKey="value" height={220} />
            </div>
          </Card>
        </div>
      );
    }

    if (activeTab === 'customers') {
      const custChartData = reportData.slice(0, 10).map(c => ({
        name: c.name || c.email || 'Customer',
        value: typeof c.totalSpent === 'number' ? c.totalSpent : parseFloat(String(c.totalSpent || 0).replace(/[^0-9.]/g, '')) || 0
      }));

      return (
        <Card title="Top Customer Lifetime Value (LTV) Distribution">
          <div style={{ height: '250px', marginTop: '12px' }}>
            <BarChartWidget data={custChartData} xKey="name" yKey="value" height={230} />
          </div>
        </Card>
      );
    }

    if (activeTab === 'orders') {
      const statusCounts = {};
      reportData.forEach(o => {
        const s = o.status || 'Pending';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });

      const donutData = Object.keys(statusCounts).map(s => ({ name: s, value: statusCounts[s] }));

      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <Card title="Order Status Breakdown">
            <div style={{ height: '240px', marginTop: '12px' }}>
              <DonutChartWidget data={donutData} height={220} />
            </div>
          </Card>
          <Card title="Order Volume Trend">
            <div style={{ height: '240px', marginTop: '12px' }}>
              <LineChartWidget data={reportData.slice(0, 10).map((r, i) => ({ name: r.orderNumber || `Ord ${i + 1}`, value: Number(r.total || 0) }))} height={220} />
            </div>
          </Card>
        </div>
      );
    }

    if (activeTab === 'inventory') {
      const stockData = reportData.slice(0, 12).map(i => ({
        name: i.name || 'Item',
        value: Number(i.stock || 0)
      }));

      return (
        <Card title="Product Stock Levels (Inventory)">
          <div style={{ height: '250px', marginTop: '12px' }}>
            <BarChartWidget data={stockData} xKey="name" yKey="value" height={230} />
          </div>
        </Card>
      );
    }

    if (activeTab === 'coupons') {
      const couponData = reportData.map(c => ({
        name: c.code || 'Coupon',
        value: Number(c.usageCount || 0)
      }));

      return (
        <Card title="Coupon Claim Frequency">
          <div style={{ height: '250px', marginTop: '12px' }}>
            <BarChartWidget data={couponData} xKey="name" yKey="value" height={230} />
          </div>
        </Card>
      );
    }

    if (activeTab === 'taxes') {
      const taxData = reportData.map(t => ({
        name: t.orderNumber || 'Tax',
        value: parseFloat(String(t.tax || 0).replace(/[^0-9.]/g, '')) || 0
      }));

      return (
        <Card title="VAT / Tax Paid Over Orders">
          <div style={{ height: '250px', marginTop: '12px' }}>
            <AreaChartWidget data={taxData} xKey="name" yKeys={['value']} height={230} />
          </div>
        </Card>
      );
    }

    if (activeTab === 'deliveries') {
      const delStatus = {};
      reportData.forEach(d => {
        const s = d.status || 'Dispatched';
        delStatus[s] = (delStatus[s] || 0) + 1;
      });

      const delData = Object.keys(delStatus).map(s => ({ name: s, value: delStatus[s] }));

      return (
        <Card title="Delivery Status Distribution">
          <div style={{ height: '250px', marginTop: '12px' }}>
            <DonutChartWidget data={delData} height={230} />
          </div>
        </Card>
      );
    }

    if (activeTab === 'payments') {
      const payData = reportData.map(p => ({
        name: p.orderNumber || 'Payment',
        value: parseFloat(String(p.amount || 0).replace(/[^0-9.]/g, '')) || 0
      }));

      return (
        <Card title="Payment Transaction Volume">
          <div style={{ height: '250px', marginTop: '12px' }}>
            <BarChartWidget data={payData} xKey="name" yKey="value" height={230} />
          </div>
        </Card>
      );
    }

    return null;
  };

  // Filter Data by Search Term
  const filteredData = (Array.isArray(reportData) ? reportData : []).filter(row => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return row && typeof row === 'object' && Object.values(row).some(v => String(v || '').toLowerCase().includes(term));
  });

  // Render Table Columns dynamically per report type
  const getColumns = () => {
    switch (activeTab) {
      case 'search':
        return [
          { key: 'query', label: 'Search Keyword / Query', render: r => <strong style={{ color: 'var(--primary)' }}>{r.query || r.keyword || r._id || 'Keyword'}</strong> },
          { key: 'count', label: 'Total Searches', render: r => <Badge variant="info">{r.count || r.searches || 1} searches</Badge> },
          { key: 'resultsCount', label: 'Results Returned', render: r => <span>{r.resultsCount !== undefined ? `${r.resultsCount} items` : 'N/A'}</span> }
        ];

      case 'sales':
        return [
          { key: 'orderNumber', label: 'Order #', render: r => <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)' }}>{r.orderNumber || '#ORD'}</span> },
          { key: 'date', label: 'Date', render: r => r.date ? new Date(r.date).toLocaleDateString() : '' },
          { key: 'subTotal', label: 'Sub Total', render: r => `£${Number(r.subTotal || 0).toFixed(2)}` },
          { key: 'discount', label: 'Discount', render: r => `£${Number(r.discount || 0).toFixed(2)}` },
          { key: 'shipping', label: 'Shipping', render: r => `£${Number(r.shipping || 0).toFixed(2)}` },
          { key: 'total', label: 'Total Sales', render: r => <strong style={{ color: 'var(--success)' }}>£{Number(r.total || 0).toFixed(2)}</strong> }
        ];

      case 'customers':
        return [
          { key: 'name', label: 'Customer Name', render: r => <strong style={{ color: 'var(--text-primary)' }}>{r.name}</strong> },
          { key: 'email', label: 'Email Address' },
          { key: 'phone', label: 'Phone' },
          { key: 'joinedDate', label: 'Joined Date', render: r => r.joinedDate ? new Date(r.joinedDate).toLocaleDateString() : '' },
          { key: 'totalOrders', label: 'Total Orders', render: r => <Badge variant="info">{r.totalOrders || 0} orders</Badge> },
          { key: 'totalSpent', label: 'Total Spent', render: r => <strong style={{ color: 'var(--primary)' }}>{typeof r.totalSpent === 'number' ? `£${r.totalSpent.toFixed(2)}` : (r.totalSpent || '£0.00')}</strong> }
        ];

      case 'orders':
        return [
          { key: 'orderNumber', label: 'Order #', render: r => <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)' }}>{r.orderNumber}</span> },
          { key: 'date', label: 'Date', render: r => r.date ? new Date(r.date).toLocaleDateString() : '' },
          { key: 'customer', label: 'Customer' },
          { key: 'status', label: 'Order Status', render: r => <Badge variant={r.status === 'Delivered' ? 'success' : r.status === 'Cancelled' ? 'danger' : 'warning'}>{r.status || 'Pending'}</Badge> },
          { key: 'paymentStatus', label: 'Payment Status', render: r => <Badge variant={r.paymentStatus === 'Paid' ? 'success' : 'secondary'}>{r.paymentStatus || 'Pending'}</Badge> },
          { key: 'itemsCount', label: 'Items', render: r => `${r.itemsCount || 0} items` },
          { key: 'total', label: 'Total Amount', render: r => <strong>£{Number(r.total || 0).toFixed(2)}</strong> }
        ];

      case 'inventory':
        return [
          { key: 'name', label: 'Product Name', render: r => <strong style={{ color: 'var(--text-primary)' }}>{r.name}</strong> },
          { key: 'sku', label: 'SKU', render: r => <span style={{ fontFamily: 'monospace' }}>{r.sku}</span> },
          { key: 'category', label: 'Category' },
          { key: 'variation', label: 'Variation / Size', render: r => r.variation || 'Standard' },
          { key: 'stock', label: 'Stock Level', render: r => <span style={{ fontWeight: '700', color: (r.stock || 0) < 10 ? 'var(--danger)' : 'var(--text-primary)' }}>{r.stock || 0} units</span> },
          { key: 'status', label: 'Stock Status', render: r => <Badge variant={(r.stock || 0) > 0 ? 'success' : 'danger'}>{r.status || ((r.stock || 0) > 0 ? 'In Stock' : 'Out of Stock')}</Badge> }
        ];

      case 'coupons':
        return [
          { key: 'code', label: 'Promo Code', render: r => <span style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--primary)' }}>{r.code}</span> },
          { key: 'type', label: 'Discount Type' },
          { key: 'discount', label: 'Discount Value', render: r => typeof r.discount === 'number' ? `${r.discount}%` : (r.discount || '0%') },
          { key: 'usageCount', label: 'Times Claimed', render: r => `${r.usageCount || 0} uses` },
          { key: 'status', label: 'Status', render: r => <Badge variant={r.status === 'Active' ? 'success' : 'secondary'}>{r.status || 'Active'}</Badge> }
        ];

      case 'taxes':
        return [
          { key: 'orderNumber', label: 'Order #', render: r => <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{r.orderNumber}</span> },
          { key: 'date', label: 'Date', render: r => r.date ? new Date(r.date).toLocaleDateString() : '' },
          { key: 'subTotal', label: 'Sub Total' },
          { key: 'discount', label: 'Discount' },
          { key: 'taxableAmount', label: 'Taxable Base' },
          { key: 'tax', label: 'VAT / Tax Paid', render: r => <strong style={{ color: 'var(--primary)' }}>{r.tax}</strong> },
          { key: 'total', label: 'Gross Total' }
        ];

      case 'deliveries':
        return [
          { key: 'orderNumber', label: 'Order #' },
          { key: 'date', label: 'Dispatch Date' },
          { key: 'customer', label: 'Customer' },
          { key: 'phone', label: 'Contact Phone' },
          { key: 'address', label: 'Delivery Address' },
          { key: 'deliverySlot', label: 'Time Slot', render: r => r.deliverySlot || 'Standard' },
          { key: 'status', label: 'Delivery Status', render: r => <Badge variant={r.status === 'Delivered' ? 'success' : 'info'}>{r.status || 'Dispatched'}</Badge> }
        ];

      case 'payments':
        return [
          { key: 'orderNumber', label: 'Order #' },
          { key: 'date', label: 'Payment Date' },
          { key: 'customer', label: 'Customer' },
          { key: 'intentId', label: 'Payment Intent ID', render: r => <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{r.intentId || 'pi_simulated'}</span> },
          { key: 'amount', label: 'Amount Paid', render: r => <strong style={{ color: 'var(--success)' }}>{r.amount}</strong> },
          { key: 'refundAmount', label: 'Refunded', render: r => r.refundAmount || '£0.00' },
          { key: 'status', label: 'Gateway Status', render: r => <Badge variant={r.status === 'Succeeded' || r.status === 'Paid' ? 'success' : 'danger'}>{r.status || 'Completed'}</Badge> }
        ];

      default:
        return [];
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={24} style={{ color: 'var(--primary)' }} /> Admin Analytics & Reports
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Audit live backend financial data, tax ledgers, customer lifetime metrics, search analytics, and export data spreadsheets.
          </p>
        </div>

        {/* Global Export Options */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '8px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <Select
            label=""
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={[
              { label: 'JSON Data Format', value: 'json' },
              { label: 'CSV Spreadsheet', value: 'csv' },
              { label: 'Excel Workbook (.xlsx)', value: 'excel' },
              { label: 'PDF Document (.pdf)', value: 'pdf' }
            ]}
          />
          <Button variant="primary" size="sm" icon={Download} loading={exporting} onClick={handleExportReport}>
            Export {activeTab.toUpperCase()} Report
          </Button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      {renderKPIs()}

      {/* Report Categories Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', borderBottom: '1px solid var(--border-color)' }}>
        {reportTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-card)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 2px 10px rgba(79,70,229,0.3)' : '1px solid var(--border-color)',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter & Date Presets Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: 'var(--bg-card)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>

        {/* Quick Date Presets */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginRight: '6px' }}>Range:</span>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
            { id: 'month', label: 'This Month' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handlePresetSelect(p.id)}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activePreset === p.id ? 'var(--primary)' : 'var(--bg-app)',
                color: activePreset === p.id ? '#fff' : 'var(--text-secondary)'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Input type="date" label="" value={startDate} onChange={(e) => { setStartDate(e.target.value); setActivePreset('custom'); }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>to</span>
            <Input type="date" label="" value={endDate} onChange={(e) => { setEndDate(e.target.value); setActivePreset('custom'); }} />
          </div>

          <div style={{ position: 'relative', width: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in ledger..."
              style={{
                width: '100%',
                padding: '6px 12px 6px 30px',
                fontSize: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadReport}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Visual Chart / Graph Section */}
      {renderTabChart()}

      {/* Main Report Table Display */}
      <Card title={`${reportTabs.find(t => t.key === activeTab)?.label || 'Report'} Ledger (${filteredData.length} records)`}>
        <div style={{ marginTop: '12px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : filteredData.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <FileText size={36} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontWeight: '600' }}>No real report records available for the selected timeframe.</span>
            </div>
          ) : (
            <ListView
              columns={getColumns()}
              data={filteredData}
              initialRowsPerPage={10}
            />
          )}
        </div>
      </Card>

    </div>
  );
};

export default Reports;
