import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from '@react-email/components';
import type { OrderEmailData } from '@/lib/email';

interface Props {
  order: OrderEmailData;
}

export default function OrderConfirmationEmail({ order }: Props) {
  const shipping = order.totalAmount >= 999 ? 0 : 79;
  const isCod = order.paymentMethod === 'cod';

  return (
    <Html lang="en">
      <Head />
      <Preview>Your order {order.orderNumber} has been confirmed — FOR</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={brandStyle}>FOR</Text>
          </Section>

          {/* Main Content */}
          <Section style={contentStyle}>
            <Text style={headingStyle}>Order Confirmed ✓</Text>
            <Text style={subheadingStyle}>
              Thank you, {order.customerName}! We&apos;ve received your order and will begin
              processing it shortly.
            </Text>

            {/* Order Number */}
            <Section style={orderNumberBoxStyle}>
              <Text style={orderNumberLabelStyle}>ORDER NUMBER</Text>
              <Text style={orderNumberValueStyle}>{order.orderNumber}</Text>
            </Section>

            <Hr style={dividerStyle} />

            {/* Items */}
            <Text style={sectionTitleStyle}>ORDER ITEMS</Text>
            {order.items.map((item, i) => (
              <Row key={i} style={itemRowStyle}>
                <Column style={{ width: '70%' }}>
                  <Text style={itemNameStyle}>{item.name}</Text>
                  <Text style={itemDetailStyle}>
                    Size: {item.size} · Qty: {item.quantity}
                  </Text>
                </Column>
                <Column style={{ width: '30%', textAlign: 'right' as const }}>
                  <Text style={itemPriceStyle}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr style={dividerStyle} />

            {/* Pricing */}
            <Row style={pricingRowStyle}>
              <Column style={{ width: '60%' }}>
                <Text style={pricingLabelStyle}>Subtotal</Text>
              </Column>
              <Column style={{ width: '40%', textAlign: 'right' as const }}>
                <Text style={pricingValueStyle}>
                  ₹{(order.totalAmount - shipping - (isCod ? 49 : 0)).toLocaleString()}
                </Text>
              </Column>
            </Row>
            <Row style={pricingRowStyle}>
              <Column style={{ width: '60%' }}>
                <Text style={pricingLabelStyle}>Shipping</Text>
              </Column>
              <Column style={{ width: '40%', textAlign: 'right' as const }}>
                <Text style={pricingValueStyle}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </Text>
              </Column>
            </Row>
            {isCod && (
              <Row style={pricingRowStyle}>
                <Column style={{ width: '60%' }}>
                  <Text style={pricingLabelStyle}>COD Charge</Text>
                </Column>
                <Column style={{ width: '40%', textAlign: 'right' as const }}>
                  <Text style={pricingValueStyle}>₹49</Text>
                </Column>
              </Row>
            )}

            <Hr style={dividerStyle} />

            <Row style={pricingRowStyle}>
              <Column style={{ width: '60%' }}>
                <Text style={totalLabelStyle}>Total</Text>
              </Column>
              <Column style={{ width: '40%', textAlign: 'right' as const }}>
                <Text style={totalValueStyle}>₹{order.totalAmount.toLocaleString()}</Text>
              </Column>
            </Row>

            <Hr style={dividerStyle} />

            {/* Shipping & Payment Info */}
            <Row>
              <Column style={{ width: '50%', paddingRight: '12px' }}>
                <Text style={sectionTitleStyle}>SHIPPING TO</Text>
                <Text style={infoTextStyle}>{order.customerName}</Text>
                <Text style={infoTextStyle}>{order.shippingAddress}</Text>
                <Text style={infoTextStyle}>
                  {order.shippingCity}, {order.shippingState} — {order.shippingPincode}
                </Text>
                <Text style={infoTextStyle}>{order.customerPhone}</Text>
              </Column>
              <Column style={{ width: '50%', paddingLeft: '12px' }}>
                <Text style={sectionTitleStyle}>PAYMENT</Text>
                <Text style={infoTextStyle}>
                  {isCod ? 'Cash on Delivery' : 'Paid Online (Razorpay)'}
                </Text>
                <Text style={{ ...infoTextStyle, marginTop: '16px' }}>
                  <strong>ESTIMATED DELIVERY</strong>
                </Text>
                <Text style={infoTextStyle}>3–5 business days</Text>
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              If you have any questions about your order, reply to this email or contact us
              at support.
            </Text>
            <Text style={footerBrandStyle}>FOR — Made for You</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const bodyStyle: React.CSSProperties = {
  backgroundColor: '#FAF8F5',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: '#1C1C1C',
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const brandStyle: React.CSSProperties = {
  color: '#FAF8F5',
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '6px',
  margin: 0,
};

const contentStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  padding: '32px',
};

const headingStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 600,
  color: '#1C1C1C',
  margin: '0 0 8px',
};

const subheadingStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#6B6055',
  lineHeight: '1.6',
  margin: '0 0 24px',
};

const orderNumberBoxStyle: React.CSSProperties = {
  backgroundColor: '#F0EDE8',
  padding: '16px 20px',
  borderRadius: '4px',
  marginBottom: '24px',
};

const orderNumberLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '2px',
  color: '#8B7355',
  fontWeight: 600,
  margin: '0 0 4px',
};

const orderNumberValueStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#1C1C1C',
  letterSpacing: '1px',
  margin: 0,
};

const dividerStyle: React.CSSProperties = {
  borderColor: '#E8E2D9',
  margin: '20px 0',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '2px',
  color: '#8B7355',
  fontWeight: 600,
  margin: '0 0 12px',
};

const itemRowStyle: React.CSSProperties = {
  marginBottom: '12px',
};

const itemNameStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#1C1C1C',
  margin: '0 0 2px',
};

const itemDetailStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8B7355',
  margin: 0,
};

const itemPriceStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#1C1C1C',
  margin: 0,
};

const pricingRowStyle: React.CSSProperties = {
  marginBottom: '6px',
};

const pricingLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#6B6055',
  margin: 0,
};

const pricingValueStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#1C1C1C',
  margin: 0,
};

const totalLabelStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#1C1C1C',
  margin: 0,
};

const totalValueStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#1C1C1C',
  margin: 0,
};

const infoTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#1C1C1C',
  lineHeight: '1.5',
  margin: '0 0 2px',
};

const footerStyle: React.CSSProperties = {
  padding: '24px 32px',
  textAlign: 'center' as const,
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8B7355',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const footerBrandStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#C8C2B8',
  letterSpacing: '3px',
  fontWeight: 600,
  margin: 0,
};
