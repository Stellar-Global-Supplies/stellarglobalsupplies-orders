import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { fetchOrderById, updateOrderStatus, sendEmailNotification, delayOrder, deliverOrder } from '../utils/api';
import { StatusBadge, PaymentBadge } from '../components/StatusBadge';
import OrderTimeline, { STATUS_ORDER } from '../components/OrderTimeline';
import { buildWhatsAppMessage } from '../utils/whatsapp';

const NEXT_STATUS = {
  'Order Received': 'Processing',
  'Processing':     'Ready to Dispatch',
  'Ready to Dispatch': 'Delivered',
};

const STATUS_ACTIONS = {
  'Order Received': { label: 'Mark as Processing',       icon: '⚙️' },
  'Processing':     { label: 'Mark Ready to Dispatch',   icon: '📦' },
  'Ready to Dispatch': { label: 'Mark as Delivered',     icon: '✅' },
};

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--neutral-100)' }}>
      <span style={{ fontSize: '13px', color: 'var(--neutral-400)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--neutral-800)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order,         setOrder]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [updatingStatus, setUpdating]     = useState(false);
  const [sendingEmail,  setSendingEmail]  = useState(false);
  const [confirmModal,  setConfirmModal]  = useState(false);
  const [delayModal,    setDelayModal]    = useState(false);
  const [deliverModal,  setDeliverModal]  = useState(false);
  const [newDeliveryDate, setNewDeliveryDate] = useState(null);
  const [invoiceFile,   setInvoiceFile]   = useState(null);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await fetchOrderById(id);
      setOrder(data);
    } catch (err) {
      toast.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrder(); }, [id]); // eslint-disable-line

  const handleStatusUpdate = async () => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdating(true);
    setConfirmModal(false);
    try {
      await updateOrderStatus(order.id, next);
      toast.success(`Order moved to "${next}"`);
      await loadOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      await sendEmailNotification(order.id, 'status_update');
      toast.success('Email notification sent!');
    } catch (err) {
      toast.error(err.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleWhatsApp = () => {
    const url = buildWhatsAppMessage(order);
    window.open(url, '_blank');
  };

  const handleDelay = async () => {
    if (!newDeliveryDate) {
      toast.error('Please select a new delivery date');
      return;
    }
    setUpdating(true);
    setDelayModal(false);
    try {
      await delayOrder(order.id, newDeliveryDate.toISOString().split('T')[0]);
      toast.success('Delivery date updated');
      await loadOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to delay order');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeliver = async () => {
    if (!invoiceFile) {
      toast.error('Please attach an invoice');
      return;
    }
    setSendingEmail(true);
    setDeliverModal(false);
    try {
      await deliverOrder(order.id, invoiceFile);
      toast.success('Order marked as delivered with invoice');
      await loadOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to mark as delivered');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!order) return null;

  const nextStatus = NEXT_STATUS[order.status];
  const action     = STATUS_ACTIONS[order.status];

  return (
    <>
      {/* Confirm Status Modal */}
      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title">Confirm Status Change</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: 'var(--neutral-600)', lineHeight: 1.7 }}>
                Move order <strong>#{order.id.slice(0, 8).toUpperCase()}</strong> from{' '}
                <strong>{order.status}</strong> → <strong>{nextStatus}</strong>?
                <br /><br />
                This will also trigger an email notification to{' '}
                <strong>{order.customer_name}</strong> at <strong>{order.email}</strong>.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={updatingStatus}>
                {updatingStatus ? <><span className="spinner" /> Updating…</> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delay Order Modal */}
      {delayModal && (
        <div className="modal-overlay" onClick={() => setDelayModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title">Delay Order</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setDelayModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: 'var(--neutral-600)', lineHeight: 1.7, marginBottom: 16 }}>
                Select a new delivery date for order <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>.
              </p>
              <DatePicker
                selected={newDeliveryDate}
                onChange={setNewDeliveryDate}
                minDate={new Date()}
                dateFormat="dd MMM yyyy"
                placeholderText="Select new delivery date"
                className="form-control"
                popperPlacement="bottom-start"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDelayModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleDelay} disabled={updatingStatus}>
                {updatingStatus ? <><span className="spinner" /> Updating…</> : 'Update Date'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deliver Order Modal */}
      {deliverModal && (
        <div className="modal-overlay" onClick={() => setDeliverModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title">Mark as Delivered</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeliverModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: 'var(--neutral-600)', lineHeight: 1.7, marginBottom: 16 }}>
                Attach the invoice for order <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>.
              </p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setInvoiceFile(e.target.files[0])}
                className="form-control"
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeliverModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleDeliver} disabled={sendingEmail}>
                {sendingEmail ? <><span className="spinner" /> Processing…</> : 'Mark as Delivered'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')} style={{ padding: '6px 8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div>
              <h1 className="page-title">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="page-subtitle">
                Created {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* WhatsApp */}
          <button className="btn btn-whatsapp" onClick={handleWhatsApp}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            WhatsApp Customer
          </button>

          {/* Email */}
          <button className="btn btn-secondary" onClick={handleSendEmail} disabled={sendingEmail}>
            {sendingEmail
              ? <><span className="spinner spinner-dark" /> Sending…</>
              : <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Send Email
                </>
            }
          </button>

          {/* Advance Status */}
          {action && (
            <button
              className="btn btn-primary"
              onClick={() => setConfirmModal(true)}
              disabled={updatingStatus}
            >
              {updatingStatus
                ? <><span className="spinner" /> Updating…</>
                : <>{action.icon} {action.label}</>
              }
            </button>
          )}

          {/* Delay Order - only in Processing */}
          {order.status === 'Processing' && (
            <button
              className="btn btn-secondary"
              onClick={() => { setNewDeliveryDate(new Date(order.delivery_timeline)); setDelayModal(true); }}
              disabled={updatingStatus}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Delay Order
            </button>
          )}

          {/* Mark as Delivered - with invoice */}
          {order.status === 'Ready to Dispatch' && (
            <button
              className="btn btn-primary"
              onClick={() => setDeliverModal(true)}
              disabled={updatingStatus}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Mark as Delivered
            </button>
          )}

          {order.status === 'Delivered' && (
            <span className="btn" style={{ background: 'var(--brand-teal-light)', color: 'var(--brand-teal)', cursor: 'default' }}>
              ✅ Order Complete
            </span>
          )}
        </div>
      </div>

      <div className="page-body">
        {/* Timeline */}
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <div className="card-title" style={{ marginBottom: '4px' }}>Order Progress</div>
          <OrderTimeline currentStatus={order.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Customer Info */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Customer Details</span>
            </div>
            <div className="card-body">
              <DetailRow label="Name"   value={order.customer_name} />
              <DetailRow label="Phone"  value={order.phone} />
              <DetailRow label="Email"  value={order.email} />
            </div>
          </div>

          {/* Order Info */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Order Details</span>
            </div>
            <div className="card-body">
              <DetailRow label="Product Type"  value={order.product_type} />
              <DetailRow label="Material"      value={order.material} />
              <DetailRow label="Quantity"      value={`${order.quantity} ${order.unit}`} />
              <DetailRow label="Sale Cost"     value={`₹${Number(order.sale_cost).toLocaleString('en-IN')}`} />
              <DetailRow label="Payment"       value={<PaymentBadge status={order.payment_status} />} />
              <DetailRow
                label="Delivery Timeline"
                value={order.delivery_timeline
                  ? format(new Date(order.delivery_timeline), 'dd MMM yyyy')
                  : '—'}
              />
              <DetailRow label="Current Status" value={<StatusBadge status={order.status} />} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <span className="card-title">Quick Actions</span>
          </div>
          <div className="card-body" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-whatsapp" onClick={handleWhatsApp}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Send WhatsApp to Customer
            </button>

            <button className="btn btn-secondary" onClick={handleSendEmail} disabled={sendingEmail}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {sendingEmail ? 'Sending…' : 'Send Email Notification'}
            </button>

            <button className="btn btn-secondary" onClick={() => navigate('/orders')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
