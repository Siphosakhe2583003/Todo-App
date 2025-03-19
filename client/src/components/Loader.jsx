import { motion } from "framer-motion";
import React from "react";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "var(--primary-color)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  pointerEvents: "auto", // Prevents clicking on anything underneath
};

const spinnerStyle = {
  width: "64px",
  height: "64px",
  border: "4px solid rgba(0, 0, 0, 0.1)",
  borderTop: "4px solid #000",
  borderRadius: "50%",
  color: "var(--tertiary-color)",
};

const Loader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div style={overlayStyle}>
      <motion.div
        style={spinnerStyle}
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    </div>
  );
};

export default Loader;
