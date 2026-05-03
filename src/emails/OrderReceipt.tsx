import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
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
      <Head />
      <Preview>Thank you for your elegant purchase — Mrudula Vastra</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={brandTypography}>MRUDULA VASTRA</Text>
            <Text style={subtitle}>Elegance Woven in Every Thread</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h1}>Order Confirmed</Heading>
            <Text style={text}>Dear {customerName},</Text>
            <Text style={text}>
              Thank you for choosing Mrudula Vastra. We are thrilled to prepare
              your exquisite selections. Here are your order details:
            </Text>

            <Text style={orderSubLabel}>Order ID: {orderId}</Text>
            <Hr style={hr} />

            {/* Iterating Cart Items */}
            {items.map((item, index) => (
              <Section key={index} style={itemRow}>
                <div style={{ flex: 1 }}>
                  <Text style={itemName}>{item.name}</Text>
                  {item.variant && <Text style={itemVariant}>{item.variant}</Text>}
                  <Text style={itemQty}>Qty: {item.quantity}</Text>
                </div>
                <div>
                  <Text style={itemPrice}>₹{item.price.toLocaleString("en-IN")}</Text>
                </div>
              </Section>
            ))}

            <Hr style={hr} />
            <Section style={totalRow}>
              <Text style={totalLabel}>Total</Text>
              <Text style={totalValue}>{totalAmount}</Text>
            </Section>

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

// Styling (Mocked closely to brand specifics)
const main = {
  backgroundColor: "#FDFBF7", // cream
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
  maxWidth: "100%",
};

const headerSection = {
  textAlign: "center" as const,
  padding: "32px 0",
};

const brandTypography = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1A3C2E", // forest
  letterSpacing: "0.1em",
  margin: "0",
};

const subtitle = {
  fontSize: "10px",
  letterSpacing: "0.3em",
  color: "#b8963e", // gold
  textTransform: "uppercase" as const,
  margin: "4px 0 0",
};

const bodySection = {
  backgroundColor: "#ffffff",
  padding: "40px",
  border: "1px solid rgba(184,150,62,0.15)", // gold/15
  borderRadius: "8px",
  boxShadow: "0 4px 24px rgba(26,60,46,0.04)",
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
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
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
};

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
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
