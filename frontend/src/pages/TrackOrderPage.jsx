import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { fetchOrderByTrackingToken, isInvoiceValid } from '../utils/api';
import { StatusBadge, PaymentBadge } from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';

function DetailRow({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      borderBottom: '1px solid var(--border-color)',
      gap: 8,
    }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function TrackOrderPage() {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOrderByTrackingToken(token);
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [token]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '20px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <span className="spinner spinner-dark" style={{ width: 40, height: 40 }} />
          <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 14 }}>Loading order details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '20px',
      }}>
        <div className="card" style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ padding: '32px 24px' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Order Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>{error}</p>
            <a href="https://stellarglobalsupplies.com" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Visit our website
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const orderId     = order.id.slice(0, 8).toUpperCase();
  const invoiceOk   = isInvoiceValid(order);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '16px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', padding: '20px 0 24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 4,
          }}>
            <div style={{
              width: 40, height: 40,
              background: 'var(--brand-teal)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 16,
              color: '#fff',
              flexShrink: 0,
            }}>SG</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>Order Tracking</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stellar Global Supplies</div>
            </div>
          </div>
        </div>

        {/* Order Card */}
        <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
          {/* Card top: order ID + status */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 16px 12px',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Order</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>#{orderId}</div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {/* Timeline */}
          <div style={{ padding: '0 16px 16px' }}>
            <OrderTimeline currentStatus={order.status} />
          </div>

          {/* Details table */}
          <div style={{ borderTop: '1px solid var(--border-color)' }}>
            <DetailRow label="Product Type"   value={order.product_type} />
            <DetailRow label="Material"       value={order.material} />
            <DetailRow label="Quantity"       value={`${order.quantity} ${order.unit}`} />
            <DetailRow label="Payment"        value={<PaymentBadge status={order.payment_status} />} />
            <DetailRow label="Delivery Date"  value={
              order.delivery_timeline
                ? format(new Date(order.delivery_timeline), 'dd MMM yyyy')
                : '—'
            } />
            <DetailRow label="Order Date"     value={format(new Date(order.created_at), 'dd MMM yyyy')} />
          </div>

          {/* ── Invoice section ────────────────────────────────────────────
              FIX: Show this block whenever invoice_url exists.
              Show download button if within 7 days, expired message otherwise.
              Previously this was hidden when invoice_uploaded_at was null.
          ─────────────────────────────────────────────────────────────── */}
          {order.invoice_url && (
            <div style={{
              margin: '0 16px 16px',
              padding: 16,
              background: invoiceOk ? 'var(--brand-teal-light)' : 'var(--neutral-100)',
              borderRadius: 10,
              border: `1px solid ${invoiceOk ? 'var(--brand-teal)' : 'var(--border-color)'}`,
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 8,
              }}>
                {invoiceOk ? '📄 Invoice Ready' : '📄 Invoice'}
              </div>

              {invoiceOk ? (
                <>
                  <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    Your invoice is available for download for 7 days from delivery.
                  </p>
                  <a
                    href={order.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    📥 Download Invoice
                  </a>
                </>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  The invoice download link has expired (valid for 7 days after delivery).
                  Please contact us at <strong>+91 96376 55556</strong> to request a new copy.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Need Help Card */}
        <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ padding: 16 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 12,
            }}>
              Need Help?
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
              Contact us for any questions about your order.
            </p>

            {/* Mobile-friendly stacked buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href="https://stellarglobalsupplies.com"
                className="btn btn-primary"
                style={{ textDecoration: 'none', justifyContent: 'center' }}
              >
                🌐 Visit Our Website
              </a>
              <div style={{ display: 'flex', gap: 10 }}>
                <a
                  href="tel:+919637655556"
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}
                >
                  📞 Call Us
                </a>
                <a
                  href="https://wa.me/919637655556"
                  className="btn btn-whatsapp"
                  style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '16px 0 24px',
          fontSize: 12,
          color: 'var(--text-muted)',
          lineHeight: 1.8,
        }}>
          <a href="https://stellarglobalsupplies.com" style={{ color: 'var(--brand-teal)', textDecoration: 'none' }}>
            stellarglobalsupplies.com
          </a>
          <br />
          © {new Date().getFullYear()} Stellar Global Supplies
          <br />
          India's Most Reliable Industrial Supply Partner
        </div>

      </div>
    </div>
  );
}
