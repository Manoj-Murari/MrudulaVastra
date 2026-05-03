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
      <Head />
      <Preview>Your Mrudula Vastra order has been delivered!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={brandTypography}>MRUDULA VASTRA</Text>
            <Text style={subtitle}>Elegance Woven in Every Thread</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h1}>Order Delivered</Heading>
            <Text style={text}>Dear {customerName},</Text>
            <Text style={text}>
              Great news! Your order <strong>{orderId}</strong> has been successfully delivered.
            </Text>

            <Hr style={hr} />

            <Text style={text}>
              We hope you love your new elegant pieces from Mrudula Vastra. Your satisfaction is our highest priority, and we would be thrilled to see how you style them!
            </Text>

            <Text style={text}>
              Tag us on Instagram <Link style={link} href="https://instagram.com/mrudulavastra">@mrudulavastra</Link> to be featured on our page.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href="https://mrudulavastra.in">
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
