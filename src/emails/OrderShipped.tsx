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
  Link,
  Button,
} from "@react-email/components";
import * as React from "react";

interface OrderShippedEmailProps {
  orderId: string;
  customerName: string;
  carrierName: string;
  trackingId: string;
}

export default function OrderShipped({
  orderId,
  customerName,
  carrierName,
  trackingId,
}: OrderShippedEmailProps) {
  // Simple check for common carriers to construct a tracking link if possible
  let trackingUrl = "";
  const carrier = carrierName.toLowerCase();
  if (carrier.includes("delhivery")) {
    trackingUrl = `https://www.delhivery.com/track/package/${trackingId}`;
  } else if (carrier.includes("bluedart") || carrier.includes("blue dart")) {
    trackingUrl = `https://www.bluedart.com/tracking`;
  } else if (carrier.includes("dtdc")) {
    trackingUrl = `https://www.dtdc.in/tracking/shipment-tracking.asp`;
  } else if (carrier.includes("xpressbees")) {
    trackingUrl = `https://www.xpressbees.com/track?trackingId=${trackingId}`;
  } else if (carrier.includes("ecom")) {
    trackingUrl = `https://ecomexpress.in/tracking/?awb=${trackingId}`;
  } else if (carrier.includes("shadowfax")) {
    trackingUrl = `https://www.shadowfax.in/track-shipment?orderId=${trackingId}`;
  }

  return (
    <Html>
      <Head />
      <Preview>Your Mrudula Vastra order has been shipped!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={brandTypography}>MRUDULA VASTRA</Text>
            <Text style={subtitle}>Elegance Woven in Every Thread</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h1}>Your Order is on the Way!</Heading>
            <Text style={text}>Dear {customerName},</Text>
            <Text style={text}>
              We are excited to let you know that your order <strong>{orderId}</strong> has been shipped and is now on its way to you.
            </Text>

            <Hr style={hr} />

            <Section style={shippingSection}>
              <Text style={shippingLabel}>Shipping Details</Text>
              <Text style={shippingText}><strong>Courier:</strong> {carrierName}</Text>
              <Text style={shippingText}><strong>Tracking ID:</strong> {trackingId}</Text>
            </Section>

            {trackingUrl ? (
              <Section style={buttonContainer}>
                <Button style={button} href={trackingUrl}>
                  Track Your Order
                </Button>
              </Section>
            ) : (
              <Text style={text}>
                Please use the tracking ID provided above on the courier's website to track your shipment.
              </Text>
            )}

            <Hr style={hr} />

            <Text style={text}>
              Thank you for shopping with us. We hope you love your exquisite selections!
            </Text>
            
            <Text style={footerText}>
              Warm regards,
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

const hr = {
  borderColor: "rgba(184,150,62,0.2)",
  margin: "20px 0",
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

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#1A3C2E",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "4px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "14px",
  letterSpacing: "0.05em",
};

const footerText = {
  fontSize: "13px",
  color: "#666",
  lineHeight: "20px",
  marginTop: "32px",
};
