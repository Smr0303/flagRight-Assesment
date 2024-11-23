import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Paper,
  Container,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axiosClient from "../utils/axios";

function TransactionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await axiosClient.get(`/transaction/getTransaction/${id}`);
        if (response.status === 200) {
          const data = response.data.data;
          const transformedTransaction = {
            transactionid: String(data.transactionid),
            type: String(data.type),
            transaction_timestamp: new Date(data.transaction_timestamp).toLocaleString(),
            originuserid: String(data.originuserid),
            destinationuserid: String(data.destinationuserid),
            originamountdetails: `${data.originamountdetails.transactionAmount} ${data.originamountdetails.transactionCurrency}`,
            destinationamountdetails: `${data.destinationamountdetails.transactionAmount} ${data.destinationamountdetails.transactionCurrency}`,
            promotioncodeused: String(data.promotioncodeused),
            reference: String(data.reference),
            origindevice_data: `${data.origindevicedata.deviceMaker}/${data.origindevicedata.appVersion}`,
            destinationdevice_data: `${data.destinationdevicedata.deviceMaker}/${data.destinationdevicedata.appVersion}`,
            tags: data.tags.map(tag => `${tag.value}`).join(', '),
            description: String(data.description),
            originemail: String(data.originemail),
            destinationemail: String(data.destinationemail),
          };
          setTransaction(transformedTransaction);
        }
      } catch (error) {
        setError("Failed to fetch transaction details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setSnackbarOpen(true);
    setTimeout(() => {
      setCopiedField(null);
      setSnackbarOpen(false);
    }, 2000);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const renderField = (label, value, copyable = false) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 2,
        px: 2,
        "&:hover": {
          bgcolor: "action.hover",
        },
      }}
    >
      <Typography color="text.secondary" variant="subtitle1">
        {label}
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <Typography color="text.primary" variant="body1" fontWeight="medium">
          {value}
        </Typography>
        {copyable && (
          <IconButton
            size="small"
            onClick={() => copyToClipboard(value, label)}
            color={copiedField === label ? "success" : "primary"}
          >
            {copiedField === label ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>
    </Box>
  );

  const Section = ({ title, children }) => (
    <Paper elevation={1} sx={{ mb: 3, overflow: "hidden" }}>
      <Box sx={{ p: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Box>{children}</Box>
    </Paper>
  );

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Card sx={{ mb: 4 }}>
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            p: 4,
            textAlign: "center",
            position: "relative",
          }}
        >
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "primary.contrastText",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" gutterBottom>
            Transaction Details
          </Typography>
          <Typography variant="subtitle1">ID: {transaction.transactionid}</Typography>
        </Box>
      </Card>

      <Section title="Basic Information">
        {renderField("Transaction ID", transaction.transactionid, true)}
        <Divider />
        {renderField("Type", transaction.type)}
        <Divider />
        {renderField("Timestamp", transaction.transaction_timestamp)}
      </Section>

      <Section title="User Information">
        {renderField("Origin User ID", transaction.originuserid, true)}
        <Divider />
        {renderField("Destination User ID", transaction.destinationuserid, true)}
        <Divider />
        {renderField("Origin Email", transaction.originemail, true)}
        <Divider />
        {renderField("Destination Email", transaction.destinationemail, true)}
      </Section>

      <Section title="Amount Details">
        {renderField("Origin Amount", transaction.originamountdetails)}
        <Divider />
        {renderField("Destination Amount", transaction.destinationamountdetails)}
        <Divider />
        {renderField("Promotion Code Used", transaction.promotioncodeused)}
      </Section>

      <Section title="Additional Information">
        {renderField("Reference", transaction.reference, true)}
        <Divider />
        {renderField("Origin Device Data", transaction.origindevice_data)}
        <Divider />
        {renderField("Destination Device Data", transaction.destinationdevice_data)}
        <Divider />
        {renderField("Tags", transaction.tags)}
        <Divider />
        {renderField("Description", transaction.description)}
      </Section>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default TransactionPage;