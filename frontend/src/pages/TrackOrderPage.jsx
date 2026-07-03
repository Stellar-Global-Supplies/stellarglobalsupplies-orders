import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { fetchOrderByTrackingToken } from '../utils/api';
import { StatusBadge, PaymentBadge } from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--neutral-100)' }}>
      <span style={{ fontSize: '14px', color: 'var(--neutral-500)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--neutral-800)', textAlign: 'right' }}>{value}</span>
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
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span className="spinner spinner-dark" style={{ width: 40, height: 40 }} />
          <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading order details...</p>
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
        padding: '20px'
      }}>
        <div className="card" style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <div style={{ padding: 32 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Order Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{error}</p>
            <a href="https://stellarglobalsupplies.com" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Visit our website
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const orderId = order.id.slice(0, 8).toUpperCase();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 32,
          padding: '24px 0'
        }} className="track-page-header">
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'var(--brand-teal)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 20,
              color: '#fff'
            }}>
              SG
            </div>
            <div>
              <h1 style={{ 
                fontSize: 24, 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Order Tracking
              </h1>
              <p style={{ 
                fontSize: 12, 
                color: 'var(--text-muted)',
                margin: 0
              }}>
                Stellar Global Supplies
              </p>
            </div>
          </div>
        </div>

        {/* Order Card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ padding: 24 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 10
            }}>
              <h2 style={{ 
                fontSize: 18, 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                margin: 0
              }}>
                Order #{orderId}
              </h2>
              <StatusBadge status={order.status} />
            </div>

            {/* Timeline */}
            <div style={{ marginBottom: 24 }}>
              <OrderTimeline currentStatus={order.status} />
            </div>

            {/* Order Details */}
            <div style={{ 
              display: 'grid', 
              gap: 0,
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              overflow: 'hidden'
            }}>
              <DetailRow label="Product Type" value={order.product_type} />
              <DetailRow label="Material" value={order.material} />
              <DetailRow label="Quantity" value={`${order.quantity} ${order.unit}`} />
              <DetailRow label="Payment Status" value={<PaymentBadge status={order.payment_status} />} />
              <DetailRow 
                label="Delivery Date" 
                value={order.delivery_timeline 
                  ? format(new Date(order.delivery_timeline), 'dd MMM yyyy')
                  : '—'
                } 
              />
              <DetailRow 
                label="Order Date" 
                value={format(new Date(order.created_at), 'dd MMM yyyy')} 
              />
            </div>

            {/* Invoice Download */}
            {order.invoice_url && (
              <div style={{ 
                marginTop: 20,
                padding: 16,
                background: 'var(--brand-teal-light)',
                borderRadius: 10,
                border: '1px solid var(--brand-teal)'
              }}>
                <div style={{ 
                  fontSize: 12, 
                  fontWeight: 700, 
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 8
                }}>
                  Invoice Ready
                </div>
                
                {/* Check if invoice is within 7 days */}
                {order.invoice_uploaded_at && new Date(order.invoice_uploaded_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? (
                  <>
                    <p style={{ 
                      margin: '0 0 12px',
                      fontSize: 13,
                      color: 'var(--text-primary)'
                    }}>
                      Your invoice is available for download (valid for 7 days):
                    </p>
                    <a 
                      href={order.invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ textDecoration: 'none' }}
                    >
                      📥 Download Invoice
                    </a>
                  </>
                ) : (
                  <p style={{ 
                    margin: 0,
                    fontSize: 13,
                    color: 'var(--text-primary)'
                  }}>
                    Invoice was available for 7 days. Please contact us at +91 96376 55556 to request your invoice.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <div className="card">
          <div style={{ padding: 24 }}>
            <h3 style={{ 
              fontSize: 14, 
              fontWeight: 700, 
              color: 'var(--text-primary)',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              Need Help?
            </h3>
            <p style={{ 
              fontSize: 14, 
              color: 'var(--text-muted)',
              marginBottom: 16,
              lineHeight: 1.6
            }}>
              Contact us for any questions about your order.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flexDirection: 'column' }} className="track-contact-buttons">
              <a 
                href="https://stellarglobalsupplies.com"
                className="btn btn-primary"
                style={{ textDecoration: 'none', width: '100%', justifyContent: 'center' }}
              >
                🌐 Visit Our Website
              </a>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a 
                  href="tel:+919637655556" 
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none', flex: 1, minWidth: 120 }}
                >
                  📞 Call Us
                </a>
                <a 
                  href="https://wa.me/919637655556" 
                  className="btn btn-whatsapp"
                  style={{ textDecoration: 'none', flex: 1, minWidth: 120 }}
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
          marginTop: 32,
          padding: '20px 0',
          fontSize: 12,
          color: 'var(--text-muted)'
        }}>
          <p style={{ margin: '0 0 8px' }}>
            <a href="https://stellarglobalsupplies.com" style={{ color: 'var(--brand-teal)', textDecoration: 'none' }}>
              stellarglobalsupplies.com
            </a>
          </p>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} Stellar Global Supplies
          </p>
          <p style={{ margin: '8px 0 0' }}>
            India's Most Reliable Industrial Supply Partner
          </p>
        </div>
      </div>
    </div>
  );
}
