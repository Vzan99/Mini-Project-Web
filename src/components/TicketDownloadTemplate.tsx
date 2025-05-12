import React from "react";
import QRCode from "react-qr-code";

interface TicketDownloadTemplateProps {
  ticketCode: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventImageUrl: string;
}

const TicketDownloadTemplate: React.FC<TicketDownloadTemplateProps> = ({
  ticketCode,
  eventName,
  eventDate,
  eventLocation,
  eventImageUrl,
}) => {
  // Use only inline styles to avoid any CSS inheritance issues
  const containerStyle: React.CSSProperties = {
    width: "800px",
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontFamily: "Arial, sans-serif",
    color: "#000000",
    boxSizing: "border-box",
  };

  const flexRowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    gap: "24px",
  };

  const imageContainerStyle: React.CSSProperties = {
    width: "25%",
  };

  const imageBoxStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    padding: "8px",
    borderRadius: "4px",
    marginBottom: "8px",
    width: "150px",
    height: "150px",
    overflow: "hidden",
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "4px",
  };

  const detailsContainerStyle: React.CSSProperties = {
    width: "50%",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "12px",
    color: "#000000",
  };

  const textStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#4B5563",
    marginBottom: "8px",
  };

  const qrContainerStyle: React.CSSProperties = {
    width: "25%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const qrBoxStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    padding: "8px",
    borderRadius: "4px",
    marginBottom: "8px",
    width: "150px",
    height: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const footerStyle: React.CSSProperties = {
    marginTop: "20px",
    borderTop: "1px solid #E5E7EB",
    paddingTop: "12px",
  };

  const footerTextStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#9CA3AF",
    textAlign: "center",
  };

  return (
    <div style={containerStyle}>
      <div style={flexRowStyle}>
        {/* Left side - Event image */}
        <div style={imageContainerStyle}>
          <div style={imageBoxStyle}>
            <img
              src={eventImageUrl}
              alt={eventName}
              style={imageStyle}
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* Middle - Ticket details */}
        <div style={detailsContainerStyle}>
          <h3 style={titleStyle}>{eventName}</h3>
          <p style={textStyle}>Date: {eventDate}</p>
          <p style={textStyle}>Location: {eventLocation}</p>
          <p style={textStyle}>Ticket Code: {ticketCode}</p>
        </div>

        {/* Right side - QR code */}
        <div style={qrContainerStyle}>
          <div style={qrBoxStyle}>
            <QRCode value={ticketCode} size={130} level="H" />
          </div>
        </div>
      </div>

      <div style={footerStyle}>
        <p style={footerTextStyle}>
          Powered by Quick Ticket • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default TicketDownloadTemplate;
