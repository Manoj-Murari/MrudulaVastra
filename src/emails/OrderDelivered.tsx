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
  Link,
} from "@react-email/components";
import * as React from "react";

interface OrderDeliveredEmailProps {
  orderId: string;
  customerName: string;
}

export default function OrderDelivered({
  orderId,
  customerName,
}: OrderDeliveredEmailProps) {
  return (
    <Html>
      <Head>
        <style>{`
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 0 !important; }
            .body-section { padding: 24px 16px !important; border-radius: 0 !important; }
            .brand-text { font-size: 20px !important; }
            .h1 { font-size: 20px !important; }
            .shop-btn { width: 100% !important; display: block !important; text-align: center !important; box-sizing: border-box !important; }
          }
        `}</style>
      </Head>
      <Preview>Your Mrudula Vastra order has been delivered!</Preview>
      <Body style={main}>
        <Container style={container} className="container">
          {/* Header */}
          <Section style={headerSection}>
            <Text style={brandTypography} className="brand-text">MRUDULA VASTRA</Text>
            <Text style={subtitle}>Elegance Woven in Every Thread</Text>
          </Section>

          {/* Body */}
          <Section style={bodySection} className="body-section">
            <Heading style={h1} className="h1">Order Delivered</Heading>
            <Text style={text}>Dear {customerName},</Text>
            <Text style={text}>
              Great news! Your order <strong>{orderId}</strong> has been successfully delivered.
            </Text>

            <Hr style={hr} />

            <Text style={text}>
              We hope you love your new elegant pieces from Mrudula Vastra. Your satisfaction is our highest priority, and we would be thrilled to see how you style them!
            </Text>

            <Text style={text}>
              Tag us on Instagram{" "}
              <Link style={link} href="https://instagram.com/mrudulavastra">
                @mrudulavastra
              </Link>{" "}
              to be featured on our page.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href="https://mrudulavastra.in" className="shop-btn">
                Continue Shopping
              </Button>
            </Section>

            <Hr style={hr} />

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

const link = {
  color: "#b8963e",
  textDecoration: "none",
  fontWeight: "bold",
};

const hr = {
  borderColor: "rgba(184,150,62,0.2)",
  margin: "20px 0",
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
