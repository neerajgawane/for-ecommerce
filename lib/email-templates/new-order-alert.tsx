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

export default function NewOrderAlertEmail({ order }: Props) {
  const isCod = order.paymentMethod === 'cod';

  return (
    <Html lang="en">
      <Head />
      <Preview>
        New order {order.orderNumber} — ₹{order.totalAmount.toLocaleString()} from{' '}
        {order.customerName}
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={brandStyle}>FOR — ADMIN</Text>
          </Section>

          {/* Alert Banner */}
          <Section style={alertBannerStyle}>
            <Text style={alertTitleStyle}>🛒 New Order Received</Text>
            <Text style={alertSubtitleStyle}>
              {order.customerName} just placed an order
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={contentStyle}>
            {/* Order Summary */}
            <Row>
              <Column style={{ width: '50%' }}>
                <Text style={labelStyle}>ORDER NUMBER</Text>
                <Text style={valueStyle}>{order.orderNumber}</Text>
              </Column>
              <Column style={{ width: '25%' }}>
                <Text style={labelStyle}>TOTAL</Text>
                <Text style={valueBoldStyle}>₹{order.totalAmount.toLocaleString()}</Text>
              </Column>
              <Column style={{ width: '25%' }}>
                <Text style={labelStyle}>PAYMENT</Text>
                <Text style={valueStyle}>
                  {isCod ? 'COD' : 'Online'}
                </Text>
              </Column>
            </Row>

            <Hr style={dividerStyle} />

            {/* Items */}
            <Text style={sectionTitleStyle}>ITEMS ORDERED ({order.items.length})</Text>
            {order.items.map((item, i) => (
              <Row key={i} style={itemRowStyle}>
                <Column style={{ width: '60%' }}>
                  <Text style={itemNameStyle}>{item.name}</Text>
                  <Text style={itemDetailStyle}>
                    Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                  </Text>
                </Column>
                <Column style={{ width: '40%', textAlign: 'right' as const }}>
                  <Text style={itemPriceStyle}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr style={dividerStyle} />

            {/* Customer & Shipping */}
            <Row>
              <Column style={{ width: '50%', paddingRight: '12px' }}>
                <Text style={sectionTitleStyle}>CUSTOMER</Text>
                <Text style={infoStyle}><strong>{order.customerName}</strong></Text>
                <Text style={infoStyle}>{order.customerEmail}</Text>
                <Text style={infoStyle}>{order.customerPhone}</Text>
              </Column>
              <Column style={{ width: '50%', paddingLeft: '12px' }}>
                <Text style={sectionTitleStyle}>SHIP TO</Text>
                <Text style={infoStyle}>{order.shippingAddress}</Text>
                <Text style={infoStyle}>
                  {order.shippingCity}, {order.shippingState}
                </Text>
                <Text style={infoStyle}>PIN: {order.shippingPincode}</Text>
              </Column>
            </Row>

            <Hr style={dividerStyle} />

            {/* Action note */}
            <Section style={actionBoxStyle}>
              <Text style={actionTextStyle}>
                👉 Log into your admin panel to process this order and update its status.
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              This is an automated notification from your FOR store.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const bodyStyle: React.CSSProperties = {
  backgroundColor: '#F3F4F6',
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
  padding: '20px 32px',
  textAlign: 'center' as const,
};

const brandStyle: React.CSSProperties = {
  color: '#FAF8F5',
  fontSize: '16px',
  fontWeight: 700,
  letterSpacing: '4px',
  margin: 0,
};

const alertBannerStyle: React.CSSProperties = {
  backgroundColor: '#065F46',
  padding: '20px 32px',
  textAlign: 'center' as const,
};

const alertTitleStyle: React.CSSProperties = {
  color: '#FFFFFF',
  fontSize: '20px',
  fontWeight: 700,
  margin: '0 0 4px',
};

const alertSubtitleStyle: React.CSSProperties = {
  color: '#A7F3D0',
  fontSize: '14px',
  margin: 0,
};

const contentStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  padding: '28px 32px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '1.5px',
  color: '#9CA3AF',
  fontWeight: 600,
  margin: '0 0 4px',
};

const valueStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#1F2937',
  margin: 0,
};

const valueBoldStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#1F2937',
  margin: 0,
};

const dividerStyle: React.CSSProperties = {
  borderColor: '#E5E7EB',
  margin: '20px 0',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '2px',
  color: '#6B7280',
  fontWeight: 600,
  margin: '0 0 12px',
};

const itemRowStyle: React.CSSProperties = {
  marginBottom: '10px',
};

const itemNameStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 500,
  color: '#1F2937',
  margin: '0 0 2px',
};

const itemDetailStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6B7280',
  margin: 0,
};

const itemPriceStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#1F2937',
  margin: 0,
};

const infoStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#374151',
  lineHeight: '1.5',
  margin: '0 0 2px',
};

const actionBoxStyle: React.CSSProperties = {
  backgroundColor: '#FEF3C7',
  padding: '14px 18px',
  borderRadius: '6px',
  border: '1px solid #FDE68A',
};

const actionTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#92400E',
  margin: 0,
  lineHeight: '1.5',
};

const footerStyle: React.CSSProperties = {
  padding: '20px 32px',
  textAlign: 'center' as const,
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#9CA3AF',
  margin: 0,
};
