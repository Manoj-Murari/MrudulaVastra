import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface Order {
  id: string;
  customer_name: string | null;
  created_at: string;
  total_amount: number;
}

interface UnshippedOrdersReportProps {
  orders: Order[];
}

export default function UnshippedOrdersReport({ orders = [] }: UnshippedOrdersReportProps) {
  const pendingCount = orders.length;

  return (
    <Html>
      <Head />
      <Preview>{`Daily Unshipped Orders Report (${pendingCount})`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={brandTypography}>MRUDULA VASTRA</Text>
            <Text style={subtitle}>Daily Operations Report</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h1}>Unshipped Orders Update</Heading>
            <Text style={text}>
              {pendingCount === 0 
                ? "Great job! All paid orders have been shipped. There are no pending shipments at the moment."
                : `You have ${pendingCount} order${pendingCount === 1 ? '' : 's'} that ${pendingCount === 1 ? 'is' : 'are'} currently pending shipment.`
              }
            </Text>

            {pendingCount > 0 && (
              <Section style={orderListContainer}>
                {orders.map((order, index) => {
                  const date = new Date(order.created_at).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <div key={order.id} style={orderCard}>
                      <Text style={orderIdText}><strong>Order ID:</strong> {order.id}</Text>
                      <Text style={orderDetailText}><strong>Customer:</strong> {order.customer_name || "Guest"}</Text>
                      <Text style={orderDetailText}><strong>Date:</strong> {date}</Text>
                      <Text style={orderDetailText}><strong>Amount:</strong> ₹{order.total_amount.toLocaleString("en-IN")}</Text>
                      {index < orders.length - 1 && <Hr style={divider} />}
                    </div>
                  );
                })}
              </Section>
            )}

            <Text style={footerText}>
              Please log in to the admin dashboard to process these orders.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#fcfbf8",
  fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  width: "600px",
  border: "1px solid #e6e2d6",
};

const headerSection = {
  backgroundColor: "#1c352d",
  padding: "40px 20px",
  textAlign: "center" as const,
};

const brandTypography = {
  margin: "0",
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  letterSpacing: "4px",
  textTransform: "uppercase" as const,
};

const subtitle = {
  margin: "10px 0 0",
  color: "#d4af37",
  fontSize: "12px",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
};

const bodySection = {
  padding: "40px",
};

const h1 = {
  color: "#1c352d",
  fontSize: "22px",
  fontWeight: "bold",
  margin: "0 0 20px",
};

const text = {
  color: "#4a4a4a",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 30px",
};

const orderListContainer = {
  backgroundColor: "#faf9f5",
  padding: "20px",
  borderRadius: "4px",
  border: "1px solid #e6e2d6",
  marginBottom: "30px",
};

const orderCard = {
  margin: "10px 0",
};

const orderIdText = {
  margin: "0 0 5px",
  fontSize: "15px",
  color: "#1c352d",
};

const orderDetailText = {
  margin: "0 0 5px",
  fontSize: "14px",
  color: "#4a4a4a",
};

const divider = {
  borderColor: "#e6e2d6",
  margin: "15px 0",
};

const footerText = {
  color: "#888888",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "30px 0 0",
  textAlign: "center" as const,
};
