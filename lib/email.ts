import { Resend } from 'resend';
import OrderConfirmationEmail from './email-templates/order-confirmation';
import NewOrderAlertEmail from './email-templates/new-order-alert';
import OrderStatusUpdateEmail from './email-templates/order-status-update';

// ── Resend client (lazy — only created when actually sending) ─────────────────
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'FOR <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@for.com';

// ── Generic email sender ──────────────────────────────────────────────────────
interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const resend = getResend();
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY not set — skipping email:', subject);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
    });

    if (error) {
      console.error('❌ Email send error:', error);
      return null;
    }

    console.log(`✅ Email sent: "${subject}" → ${to}`);
    return data;
  } catch (err) {
    console.error('❌ Email send failed:', err);
    return null;
  }
}

// ── Convenience functions ─────────────────────────────────────────────────────

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
  }>;
}

/** Send order confirmation to customer */
export async function sendOrderConfirmation(order: OrderEmailData) {
  return sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmed — ${order.orderNumber} | FOR`,
    react: OrderConfirmationEmail({ order }),
  });
}

/** Send new order alert to admin */
export async function sendNewOrderAlert(order: OrderEmailData) {
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `🛒 New Order: ${order.orderNumber} — ₹${order.totalAmount.toLocaleString()}`,
    react: NewOrderAlertEmail({ order }),
  });
}

/** Send order status update to customer */
export async function sendOrderStatusUpdate(data: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  newStatus: string;
  trackingNumber?: string;
  courierName?: string;
}) {
  const statusSubjects: Record<string, string> = {
    processing: `Your order ${data.orderNumber} is being prepared | FOR`,
    shipped: `Your order ${data.orderNumber} has been shipped! 🚚 | FOR`,
    delivered: `Your order ${data.orderNumber} has been delivered ✅ | FOR`,
    cancelled: `Order ${data.orderNumber} has been cancelled | FOR`,
  };

  const subject = statusSubjects[data.newStatus] || `Order ${data.orderNumber} update | FOR`;

  return sendEmail({
    to: data.customerEmail,
    subject,
    react: OrderStatusUpdateEmail(data),
  });
}
