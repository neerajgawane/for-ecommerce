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
} from '@react-email/components';

interface Props {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  newStatus: string;
  trackingNumber?: string;
  courierName?: string;
}

const STATUS_CONFIG: Record<
  string,
  { emoji: string; title: string; message: string; color: string }
> = {
  processing: {
    emoji: '📦',
    title: 'Your order is being prepared',
    message:
      'We\'re carefully packing your items with premium materials. You\'ll receive a shipping notification once your order is dispatched.',
    color: '#7C3AED',
  },
  shipped: {
    emoji: '🚚',
    title: 'Your order is on the way!',
    message:
      'Great news! Your order has been shipped and is on its way to you. You can expect delivery within 3–5 business days.',
    color: '#2563EB',
  },
  delivered: {
    emoji: '✅',
    title: 'Your order has been delivered',
    message:
      'Your order has been successfully delivered. We hope you love your new pieces! If you have any issues, please don\'t hesitate to reach out.',
    color: '#059669',
  },
  cancelled: {
    emoji: '❌',
    title: 'Your order has been cancelled',
    message:
      'Your order has been cancelled. If you paid online, your refund will be processed within 5–7 business days. If you didn\'t initiate this cancellation, please contact us immediately.',
    color: '#DC2626',
  },
};

export default function OrderStatusUpdateEmail({
  customerName,
  orderNumber,
  newStatus,
  trackingNumber,
  courierName,
}: Props) {
  const config = STATUS_CONFIG[newStatus] || STATUS_CONFIG.processing;

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {config.emoji} {config.title} — {orderNumber}
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={brandStyle}>FOR</Text>
          </Section>

          {/* Status Banner */}
          <Section style={{ ...bannerStyle, backgroundColor: config.color }}>
            <Text style={emojiStyle}>{config.emoji}</Text>
            <Text style={bannerTitleStyle}>{config.title}</Text>
          </Section>

          {/* Content */}
          <Section style={contentStyle}>
            <Text style={greetingStyle}>Hi {customerName},</Text>
            <Text style={messageStyle}>{config.message}</Text>

            {/* Order Number */}
            <Section style={orderBoxStyle}>
              <Text style={orderLabelStyle}>ORDER NUMBER</Text>
              <Text style={orderValueStyle}>{orderNumber}</Text>
            </Section>

            {/* Tracking Info (for shipped status) */}
            {newStatus === 'shipped' && (trackingNumber || courierName) && (
              <>
                <Hr style={dividerStyle} />
                <Text style={sectionTitleStyle}>TRACKING DETAILS</Text>
                {courierName && (
                  <Text style={trackingTextStyle}>
                    <strong>Courier:</strong> {courierName}
                  </Text>
                )}
                {trackingNumber && (
                  <Text style={trackingTextStyle}>
                    <strong>Tracking Number:</strong> {trackingNumber}
                  </Text>
                )}
                <Text style={trackingNoteStyle}>
                  You can use this tracking number on the courier&apos;s website to track your
                  package.
                </Text>
              </>
            )}

            {/* Delivery note */}
            {newStatus === 'delivered' && (
              <>
                <Hr style={dividerStyle} />
                <Section style={feedbackBoxStyle}>
                  <Text style={feedbackTextStyle}>
                    ⭐ Loved your order? Share it on social media and tag us — we&apos;d love to
                    see you wearing FOR!
                  </Text>
                </Section>
              </>
            )}

            {/* Refund note for cancellation */}
            {newStatus === 'cancelled' && (
              <>
                <Hr style={dividerStyle} />
                <Section style={refundBoxStyle}>
                  <Text style={refundTitleStyle}>REFUND INFORMATION</Text>
                  <Text style={refundTextStyle}>
                    If you paid online, your refund will be credited to your original payment
                    method within 5–7 business days. For any queries, reply to this email.
                  </Text>
                </Section>
              </>
            )}
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              If you have any questions, reply to this email or contact our support team.
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

const bannerStyle: React.CSSProperties = {
  padding: '28px 32px',
  textAlign: 'center' as const,
};

const emojiStyle: React.CSSProperties = {
  fontSize: '36px',
  margin: '0 0 8px',
};

const bannerTitleStyle: React.CSSProperties = {
  color: '#FFFFFF',
  fontSize: '22px',
  fontWeight: 700,
  margin: 0,
};

const contentStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  padding: '32px',
};

const greetingStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#1C1C1C',
  margin: '0 0 12px',
};

const messageStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#6B6055',
  lineHeight: '1.7',
  margin: '0 0 24px',
};

const orderBoxStyle: React.CSSProperties = {
  backgroundColor: '#F0EDE8',
  padding: '16px 20px',
  borderRadius: '4px',
};

const orderLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '2px',
  color: '#8B7355',
  fontWeight: 600,
  margin: '0 0 4px',
};

const orderValueStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#1C1C1C',
  letterSpacing: '1px',
  margin: 0,
};

const dividerStyle: React.CSSProperties = {
  borderColor: '#E8E2D9',
  margin: '24px 0',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '2px',
  color: '#8B7355',
  fontWeight: 600,
  margin: '0 0 12px',
};

const trackingTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#1C1C1C',
  margin: '0 0 6px',
};

const trackingNoteStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8B7355',
  margin: '10px 0 0',
};

const feedbackBoxStyle: React.CSSProperties = {
  backgroundColor: '#FEF9C3',
  padding: '14px 18px',
  borderRadius: '6px',
  border: '1px solid #FDE68A',
};

const feedbackTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#92400E',
  margin: 0,
  lineHeight: '1.5',
};

const refundBoxStyle: React.CSSProperties = {
  backgroundColor: '#FEF2F2',
  padding: '16px 18px',
  borderRadius: '6px',
  border: '1px solid #FECACA',
};

const refundTitleStyle: React.CSSProperties = {
  fontSize: '10px',
  letterSpacing: '2px',
  color: '#991B1B',
  fontWeight: 600,
  margin: '0 0 8px',
};

const refundTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#991B1B',
  margin: 0,
  lineHeight: '1.5',
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
