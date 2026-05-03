import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface OrderItem {
  name: string;
  variant?: string | null;
  quantity: number;
  price: number;
}

interface OrderReceiptEmailProps {
  orderId: string;
  customerName: string;
  totalAmount: string;
  items: OrderItem[];
  shippingAddress: string;
}

export default function OrderReceipt({
  orderId,
  customerName,
  totalAmount,
  items,
  shippingAddress,
}: OrderReceiptEmailProps) {
  return (
    <Html>
      <Head>
        <style>{`
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 0 !important; }
            .body-section { padding: 24px 16px !important; border-radius: 0 !important; }
            .brand-text { font-size: 20px !important; }
            .h1 { font-size: 20px !important; }
            .item-name-col { width: 68% !important; }
            .item-price-col { width: 32% !important; text-align: right !important; }
          }
        `}</style>
      </Head>
      <Preview>Thank you for your elegant purchase — Mrudula Vastra</Preview>
      <Body style={main}>
        <Container style={container} className="container">
          {/* Header */}
          <Section style={headerSection}>
            <Text style={brandTypography} className="brand-text">MRUDULA VASTRA</Text>
            <Text style={subtitle}>Elegance Woven in Every Thread</Text>
          </Section>

          {/* Body */}
          <Section style={bodySection} className="body-section">
            <Heading style={h1} className="h1">Order Confirmed</Heading>
            <Text style={text}>Dear {customerName},</Text>
            <Text style={text}>
              Thank you for choosing Mrudula Vastra. We are thrilled to prepare
              your exquisite selections. Here are your order details:
            </Text>

            <Text style={orderSubLabel}>Order ID: {orderId}</Text>
            <Hr style={hr} />

            {/* Items — table-based, mobile-safe */}
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemNameCol} className="item-name-col">
                  <Text style={itemName}>{item.name}</Text>
                  {item.variant && <Text style={itemVariant}>{item.variant}</Text>}
                  <Text style={itemQty}>Qty: {item.quantity}</Text>
                </Column>
                <Column style={itemPriceCol} className="item-price-col">
                  <Text style={itemPrice}>₹{item.price.toLocaleString("en-IN")}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={hr} />

            {/* Total */}
            <Row style={totalRow}>
              <Column style={{ width: "60%" }}>
                <Text style={totalLabel}>Total</Text>
              </Column>
              <Column style={{ width: "40%", textAlign: "right" as const }}>
                <Text style={totalValue}>{totalAmount}</Text>
              </Column>
            </Row>

            {/* Shipping */}
            <Section style={shippingSection}>
              <Text style={shippingLabel}>Shipping To:</Text>
              <Text style={shippingText}>{shippingAddress}</Text>
            </Section>

            <Text style={text}>
              Once your order has shipped, we will notify you with the tracking details.
            </Text>

            <Text style={footerText}>
              With gratitude,
              <br />
              The Mrudula Vastra Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#FDFBF7",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "100%",
  maxWidth: "580px",
};

const headerSection = {
  textAlign: "center" as const,
  padding: "32px 16px",
};

const brandTypography = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1A3C2E",
  letterSpacing: "0.1em",
  margin: "0",
  textAlign: "center" as const,
};

const subtitle = {
  fontSize: "10px",
  letterSpacing: "0.3em",
  color: "#b8963e",
  textTransform: "uppercase" as const,
  margin: "4px 0 0",
  textAlign: "center" as const,
};

const bodySection = {
  backgroundColor: "#ffffff",
  padding: "40px",
  border: "1px solid rgba(184,150,62,0.15)",
  borderRadius: "8px",
};

const h1 = {
  color: "#1A3C2E",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const text = {
  color: "#333333",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0 0 12px",
};

const orderSubLabel = {
  color: "#b8963e",
  fontSize: "12px",
  fontWeight: "bold",
  letterSpacing: "0.05em",
  textAlign: "center" as const,
  marginTop: "24px",
};

const hr = {
  borderColor: "rgba(184,150,62,0.2)",
  margin: "20px 0",
};

const itemRow = {
  marginBottom: "16px",
  width: "100%",
};

const itemNameCol = {
  width: "70%",
  verticalAlign: "top" as const,
  paddingRight: "8px",
};

const itemPriceCol = {
  width: "30%",
  verticalAlign: "top" as const,
  textAlign: "right" as const,
};

const itemName = {
  fontSize: "15px",
  fontWeight: "bold",
  color: "#1A3C2E",
  margin: "0 0 4px",
};

const itemVariant = {
  fontSize: "12px",
  color: "#666666",
  margin: "0 0 4px",
};

const itemQty = {
  fontSize: "12px",
  color: "#888888",
  margin: "0",
};

const itemPrice = {
  fontSize: "15px",
  fontWeight: "bold",
  color: "#1A3C2E",
  margin: "0",
  textAlign: "right" as const,
};

const totalRow = {
  width: "100%",
  marginBottom: "24px",
};

const totalLabel = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#1A3C2E",
  margin: "0",
};

const totalValue = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#1A3C2E",
  margin: "0",
  textAlign: "right" as const,
};

const shippingSection = {
  padding: "16px",
  backgroundColor: "#f9f8f6",
  border: "1px solid rgba(184,150,62,0.1)",
  borderRadius: "4px",
  marginBottom: "24px",
};

const shippingLabel = {
  fontSize: "11px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "#b8963e",
  fontWeight: "bold",
  margin: "0 0 4px",
};

const shippingText = {
  fontSize: "14px",
  color: "#333333",
  lineHeight: "20px",
  margin: "0",
};

const footerText = {
  fontSize: "13px",
  color: "#666",
  lineHeight: "20px",
  marginTop: "32px",
};
