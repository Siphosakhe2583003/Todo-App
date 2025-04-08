import { Modal, Box, Typography, Button } from "@mui/material";
import { PropTypes } from "prop-types";

export default function Popup({ open, onClose, message, runOnClose }) {
  function handleClose() {
    console.log(typeof runOnClose)
    runOnClose()
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="popup-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "30%",
          bgcolor: "var(--primary-color, #101218)",
          color: "whitesmoke",
          boxShadow: 24,
          p: 3,
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        <Typography id="popup-title" variant="h6" fontWeight="bold">Confirm Deletion</Typography>
        <Typography sx={{ mt: 1, mb: 2 }}>{message}</Typography>
        <Box sx={{
          display: "flex",
          justifyContent: "space-evenly"
        }}>
          <Button variant="contained" color="primary" onClick={onClose} sx={{ bgcolor: "var(--tertiary-color, #00ADB5)" }}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleClose} sx={{ bgcolor: "red" }}>Confirm</Button>
        </Box>
      </Box>
    </Modal>
  );
}

Popup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  runOnClose: PropTypes.func.isRequired,
};
