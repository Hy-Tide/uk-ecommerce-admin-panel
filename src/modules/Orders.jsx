import React, { useState } from 'react';
import { Download, FileText, Mail, MessageSquare, Printer, RefreshCw, ShoppingCart, Truck } from 'lucide-react';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import Select from '../components/Input';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Timeline from '../components/Timeline';

export const Orders = ({
  orders = [],
  setOrders,
  auditLogs = [],
  setAuditLogs,
  addToast
}) => {
  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState('All');
  const [filterDelivery, setFilterDelivery] = useState('All');
  
  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  // Workflow steps array
  const workflowStatuses = [
    'New Order',
    'Payment Verified',
    'Confirmed',
    'Picking',
    'Packing',
    'Ready for Dispatch',
    'Out for Delivery',
    'Delivered'
  ];

  const handleUpdateStatus = (statusValue) => {
    if (!activeOrder) return;

    // Create a new timeline step entry
    const newStep = {
      status: statusValue,
      time: new Date().toISOString(),
      desc: `Status updated manually to: ${statusValue}`
    };

    const updatedTimeline = [...activeOrder.timeline, newStep];
    const updatedOrder = {
      ...activeOrder,
      deliveryStatus: statusValue,
      timeline: updatedTimeline
    };

    // Update overall orders state
    setOrders(orders.map(o => o.id === activeOrder.id ? updatedOrder : o));
    setActiveOrder(updatedOrder);

    setAuditLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'Director David',
        action: 'Order Status Update',
        module: 'Orders',
        detail: `Updated order #${activeOrder.id} status to ${statusValue}`
      },
      ...auditLogs
    ]);

    addToast(`Order status updated to ${statusValue}`, 'success');
  };

  const handleCancelOrder = () => {
    if (!activeOrder) return;
    const newStep = {
      status: 'Cancelled',
      time: new Date().toISOString(),
      desc: 'Cancelled manually by operator'
    };
    const updatedTimeline = [...activeOrder.timeline, newStep];
    const updatedOrder = {
      ...activeOrder,
      deliveryStatus: 'Cancelled',
      timeline: updatedTimeline
    };
    setOrders(orders.map(o => o.id === activeOrder.id ? updatedOrder : o));
    setActiveOrder(updatedOrder);
    addToast('Order successfully marked as Cancelled', 'warning');
  };

  const handleRefundOrder = () => {
    if (!activeOrder) return;
    const updatedOrder = {
      ...activeOrder,
      paymentStatus: 'Refunded'
    };
    setOrders(orders.map(o => o.id === activeOrder.id ? updatedOrder : o));
    setActiveOrder(updatedOrder);
    addToast('Transaction successfully refunded', 'warning');
  };

  const openOrderDrawer = (order) => {
    setActiveOrder(order);
    setDrawerOpen(true);
  };

  // Printable Invoice Builder window trigger
  const triggerPrintWindow = () => {
    if (!activeOrder) return;
    
    const printContent = `
      <html>
        <head>
          <title>Invoice #${activeOrder.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .details { display: flex; justify-content: space-between; margin-top: 30px; }
            .items { width: 100%; border-collapse: collapse; margin-top: 40px; }
            .items th, .items td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; }
            .items th { background-color: #f9f9f9; }
            .totals { text-align: right; margin-top: 30px; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>FreshCart Grocery Enterprise</h2>
              <p>Fulfillment Center A, Zone 4</p>
              <p>support@freshcart.com</p>
            </div>
            <div>
              <h1>INVOICE</h1>
              <p>Order Reference: <strong>${activeOrder.id}</strong></p>
              <p>Date: ${new Date(activeOrder.date).toLocaleDateString()}</p>
            </div>
          </div>
          <div class="details">
            <div>
              <h3>Billed To:</h3>
              <p><strong>${activeOrder.customerName}</strong></p>
              <p>${activeOrder.address}</p>
            </div>
            <div>
              <h3>Payment & Transit:</h3>
              <p>Method: ${activeOrder.paymentMethod}</p>
              <p>Tracking Ref: ${activeOrder.trackingNumber || 'N/A'}</p>
            </div>
          </div>
          <table class="items">
            <thead>
              <tr><th>Item Description</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              ${activeOrder.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.qty * item.price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: $${activeOrder.subtotal.toFixed(2)}</p>
            ${activeOrder.discount > 0 ? `<p>Discount Applied: -$${activeOrder.discount.toFixed(2)}</p>` : ''}
            <p>Delivery Fee: $${activeOrder.deliveryFee.toFixed(2)}</p>
            <p>VAT/Tax: $${activeOrder.tax.toFixed(2)}</p>
            <h2>Grand Total: $${activeOrder.total.toFixed(2)}</h2>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    printWin.document.write(printContent);
    printWin.document.close();
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Paid': return <Badge variant="success">Paid</Badge>;
      case 'Refunded': return <Badge variant="warning">Refunded</Badge>;
      case 'Unpaid':
      default: return <Badge variant="danger">Unpaid</Badge>;
    }
  };

  const getDeliveryBadge = (status) => {
    if (status === 'Delivered') return <Badge variant="success">Delivered</Badge>;
    if (status === 'Cancelled') return <Badge variant="danger">Cancelled</Badge>;
    if (status === 'Ready for Dispatch' || status === 'Out for Delivery') return <Badge variant="accent">{status}</Badge>;
    return <Badge variant="warning">{status}</Badge>;
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());

    const matchesPayment = filterPayment === 'All' || o.paymentStatus === filterPayment;
    const matchesDelivery = filterDelivery === 'All' || o.deliveryStatus === filterDelivery;

    return matchesSearch && matchesPayment && matchesDelivery;
  });

  const columns = [
    { key: 'id', label: 'Order ID', render: (row) => <span style={{ fontWeight: '700' }}>#{row.id}</span> },
    {
      key: 'date',
      label: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    { key: 'customerName', label: 'Customer' },
    {
      key: 'total',
      label: 'Total Value',
      render: (row) => <span style={{ fontWeight: '600' }}>${row.total.toFixed(2)}</span>
    },
    { key: 'paymentStatus', label: 'Payment', render: (row) => getPaymentBadge(row.paymentStatus) },
    { key: 'deliveryStatus', label: 'Transit', render: (row) => getDeliveryBadge(row.deliveryStatus) },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => openOrderDrawer(row)}>
          Details
        </Button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>Orders Queue</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Fulfillment dispatch workflow. Access packing manifests and trigger transport logistics.</p>
        </div>
      </div>

      {/* Toolbar filters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }}><ShoppingCart size={16} /></span>
            <input
              type="text"
              placeholder="Search Customer or Order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                fontSize: '13px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            style={{ padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
          >
            <option value="All">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Refunded">Refunded</option>
          </select>

          <select
            value={filterDelivery}
            onChange={(e) => setFilterDelivery(e.target.value)}
            style={{ padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}
          >
            <option value="All">All Transit Stages</option>
            {workflowStatuses.map(st => <option key={st} value={st}>{st}</option>)}
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <Table
        columns={columns}
        data={filteredOrders}
        initialRowsPerPage={10}
      />

      {/* Details drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={activeOrder ? `Order details: #${activeOrder.id}` : ''}
        size="lg"
        footer={
          activeOrder && activeOrder.deliveryStatus !== 'Cancelled' ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="danger" size="sm" onClick={handleCancelOrder}>Cancel Order</Button>
              {activeOrder.paymentStatus === 'Paid' && (
                <Button variant="outline" size="sm" onClick={handleRefundOrder}>Issue Refund</Button>
              )}
              <Button variant="primary" size="sm" icon={Printer} onClick={triggerPrintWindow}>Print Receipt</Button>
            </div>
          ) : null
        }
      >
        {activeOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Customer Details Block */}
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer profile</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '15px' }}>{activeOrder.customerName}</h4>
                  <p style={{ fontSize: '13px' }}>{activeOrder.customerEmail}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="outline" size="sm" icon={Mail} onClick={() => addToast(`Mail template notification sent to ${activeOrder.customerEmail}`, 'success')} />
                  <Button variant="outline" size="sm" icon={MessageSquare} onClick={() => addToast(`WhatsApp alert template triggered for ${activeOrder.customerName}`, 'success')} />
                </div>
              </div>
              <p style={{ fontSize: '13px', marginTop: '12px' }}><strong>Delivery Destination:</strong> {activeOrder.address}</p>
            </div>

            {/* Workflow status adjust */}
            {activeOrder.deliveryStatus !== 'Cancelled' && (
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Transit Stage Workflow Action</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {workflowStatuses.map((st) => {
                    const isCompleted = workflowStatuses.indexOf(activeOrder.deliveryStatus) >= workflowStatuses.indexOf(st);
                    return (
                      <Button
                        key={st}
                        variant={activeOrder.deliveryStatus === st ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleUpdateStatus(st)}
                        style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderColor: isCompleted ? 'var(--primary)' : 'var(--border-color)'
                        }}
                      >
                        {st}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Workflow progression timeline */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Fulfillment trail</span>
              <Timeline steps={activeOrder.timeline} />
            </div>

            {/* Ordered Items Grid */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Cart details</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {activeOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: idx === activeOrder.items.length - 1 ? 'none' : '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</span>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quantity: {item.qty} x ${item.price.toFixed(2)}</p>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>${(item.qty * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Valuation bill metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>${activeOrder.subtotal.toFixed(2)}</span>
              </div>
              {activeOrder.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--danger)' }}>
                  <span>Discount code applied</span>
                  <span>-${activeOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Delivery fees</span>
                <span>${activeOrder.deliveryFee.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>Taxes & VAT</span>
                <span>${activeOrder.tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', color: 'var(--text-primary)' }}>
                <span>Grand Total</span>
                <span>${activeOrder.total.toFixed(2)}</span>
              </div>
            </div>

          </div>
        )}
      </Drawer>

    </div>
  );
};
export default Orders;
