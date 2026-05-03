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
      <Head>
        <style>{`
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 0 !important; }
            .body-section { padding: 24px 16px !important; border-radius: 0 !important; }
            .brand-text { font-size: 20px !important; }
            .h1 { font-size: 20px !important; }
            .track-btn { width: 100% !important; display: block !important; text-align: center !important; box-sizing: border-box !important; }
          }
        `}</style>
      </Head>
      <Preview>Your Mrudula Vastra order has been shipped!</Preview>
      <Body style={main}>
        <Container style={container} className="container">
          {/* Header */}
          <Section style={headerSection}>
            <Text style={brandTypography} className="brand-text">MRUDULA VASTRA</Text>
            <Text style={subtitle}>Elegance Woven in Every Thread</Text>
          </Section>

          {/* Body */}
          <Section style={bodySection} className="body-section">
            <Heading style={h1} className="h1">Your Order is on the Way!</Heading>
            <Text style={text}>Dear {customerName},</Text>
            <Text style={text}>
              We are excited to let you know that your order <strong>{orderId}</strong> has been shipped and is now on its way to you.
            </Text>

            <Hr style={hr} />

            {/* Shipping details box */}
            <Section style={shippingSection}>
              <Text style={shippingLabel}>Shipping Details</Text>
              <Text style={shippingText}><strong>Courier:</strong> {carrierName}</Text>
              <Text style={shippingText}><strong>Tracking ID:</strong> {trackingId}</Text>
            </Section>

            {trackingUrl ? (
              <Section style={buttonContainer}>
                <Button style={button} href={trackingUrl} className="track-btn">
                  Track Your Order
                </Button>
              </Section>
            ) : (
              <Text style={text}>
                Please use the tracking ID provided above on the courier&apos;s website to track your shipment.
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

const hr = {
  borderColor: "rgba(184,150,62,0.2)",
  margin: "20px 0",
};

const shippingSection = {
  padding: "20px",
  backgroundColor: "#f9f8f6",
  border: "1px solid rgba(184,150,62,0.1)",
  borderRadius: "4px",
  marginBottom: "24px",
};

const shippingLabel = {
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "#b8963e",
  fontWeight: "bold",
  margin: "0 0 12px",
};

const shippingText = {
  fontSize: "14px",
  color: "#333333",
  lineHeight: "24px",
  margin: "0 0 4px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#1A3C2E",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "4px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "14px",
  letterSpacing: "0.05em",
  display: "inline-block",
};

const footerText = {
  fontSize: "13px",
  color: "#666",
  lineHeight: "20px",
  marginTop: "32px",
};
