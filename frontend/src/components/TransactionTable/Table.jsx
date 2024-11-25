import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import {
  Search,
  FilterList,
  Download,
  PictureAsPdf,
  AccountBalance,
  SwapHoriz,
  TrendingUp,
  Assessment,
  Close,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import axiosClient from "../utils/axios";
import CronAndCreateButtons from "../CronButtons";

/*
for pagination
1. page
2. rowsPerPage
3. pagintion object
4.data

*/

const TransactionTable = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [paginationObj, setPaginationObj] = useState({
    next_page: null,

    next_page_available: null,

    previous_page: null,

    previous_page_available: false,

    total: 0,

    total_pages: null,
  });

  const [orderBy, setOrderBy] = useState("date");

  const [order, setOrder] = useState("desc");

  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    type: "",
    status: "",
    minAmount: "",
    maxAmount: "",
  });

  const [transactionSummary, setTransactionSummary] = useState({
    totalVolume: 150000,
    totalTransactions: 45,
    avgTransactionSize: 3333.33,
    completedTransactions: 40,
  });
  const [pieChartData, setPieChartData] = useState([]);

  // Sample data - replace with your actual data
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(
          "/transaction/searchTransaction",
          {
            params: {
              page: page + 1,
              per_page: rowsPerPage,
            },
          }
        );



        // Extract the required attributes from the fetched data
        const transformedData = response.data.data.map((transaction) => ({
          id: transaction.transactionid,
          date: new Date(
            transaction.transaction_timestamp
          ).toLocaleDateString(),
          type: transaction.type,
          amount: transaction.originamountdetails.transactionAmount,
          status: transaction.status || "Unknown", // Assuming status is not provided in the original data
        }));

        setData(transformedData);

        const val = response.data.pagination;

        setPaginationObj({
          next_page: val.next_page,
          next_page_available: val.next_page_available,
          previous_page: val.previous_page,
          previous_page_available: val.previous_page_available,
          total: val.total,
          total_pages: val.total_pages,
        });

        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    const fetchTransactionSummaryAndPieChartData = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get("/transaction/getSummary");

        setTransactionSummary(
          response.data.data.transactionSummary || {
            totalVolume: 0,
            totalTransactions: 0,
            avgTransactionSize: 0,
            completedTransactions: 0,
          }
        );
        setPieChartData(response.data.data.pieChartData || []);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    fetchTransactions();
    fetchTransactionSummaryAndPieChartData();

  }, []);

  const handleTransactionClick = (transactionId) => {
    navigate(`/transaction/${transactionId}`);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      type: "",
      status: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  const resetPaginationObj = () => {

    setPage(0);

    setPaginationObj({
      next_page: null,

      next_page_available: null,

      previous_page: null,

      previous_page_available: false,

      total: 0,

      total_pages: null,
    });
  };

  const handleChangePage = async (event, newPage) => {

    if (loading) {
      console.log("data is loading...");
      return;
    }
    await handleSearch(newPage, rowsPerPage);
  };

  const handleSearch = async (newPage, newRowsPerPage) => {
    setLoading(true);

    try {

      const filledFilters = {};

      // Only add filters that have values
      if (searchQuery) {
        filledFilters.description = searchQuery;
      }

      if (filters.startDate) {
        filledFilters.startTimestamp = new Date(filters.startDate).getTime();
      }

      if (filters.endDate) {
        filledFilters.endTimestamp = new Date(filters.endDate).getTime();
      }

      if (filters.type) {
        filledFilters.type = filters.type;
      }

      if (filters.status) {
        filledFilters.status = filters.status;
      }

      if (filters.minAmount) {
        filledFilters.minAmount = Number(filters.minAmount);
      }

      if (filters.maxAmount) {
        filledFilters.maxAmount = Number(filters.maxAmount);
      }

      const searchParams = {
        ...filledFilters,
        page: newPage + 1,
        per_page: newRowsPerPage,
      };



      const response = await axiosClient.get("/transaction/searchTransaction", {
        params: searchParams,
      });



      // Transform the received data to match your table structure
      const transformedData = response.data.data.map((transaction) => ({
        id: transaction.transactionid,
        date: new Date(transaction.transaction_timestamp).toLocaleDateString(),
        type: transaction.type,
        amount: transaction.originamountdetails.transactionAmount,
        status: transaction.status || "Unknown",
      }));

      setData([...transformedData]);

      const val = response.data.pagination;

      setPage(val.page - 1);
      setRowsPerPage(val.per_page);



      setPaginationObj({
        next_page: val.next_page,
        next_page_available: val.next_page_available,
        previous_page: val.previous_page,
        previous_page_available: val.previous_page_available,
        total: val.total,
        total_pages: val.total_pages,
      });

      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error fetching filtered transactions:", err);
      // Here you might want to add error handling, such as showing a snackbar
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await axiosClient.get("/transaction/allTransactions", {
        params: {
          page: 0,
          per_page: 0,
          current_user_id: null,
          export_all: true,
        },
      });

      const transactions = response.data.data;

      const tempData = transactions.map((transaction) => ({
        TransactionID: transaction.transactionid,
        Type: transaction.type,
        Timestamp: new Date(transaction.transaction_timestamp).toLocaleString(),
        Description: transaction.description,
        Reference: transaction.reference,
        // Origin Details
        OriginUserID: transaction.originuserid,
        OriginEmail: transaction.originemail,
        OriginCountry: transaction.originamountdetails.country,
        OriginAmount: transaction.originamountdetails.transactionAmount,
        OriginCurrency: transaction.originamountdetails.transactionCurrency,
        OriginIP: transaction.origindevicedata.ipAddress,
        OriginDevice: transaction.origindevicedata.deviceMaker,
        // Destination Details
        DestinationUserID: transaction.destinationuserid,
        DestinationEmail: transaction.destinationemail,
        DestinationCountry: transaction.destinationamountdetails.country,
        DestinationAmount:
          transaction.destinationamountdetails.transactionAmount,
        DestinationCurrency:
          transaction.destinationamountdetails.transactionCurrency,
        DestinationIP: transaction.destinationdevicedata.ipAddress,
        DestinationDevice: transaction.destinationdevicedata.deviceMaker,
        // Additional Info
        PromotionUsed: transaction.promotioncodeused ? "Yes" : "No",
      }));



      const headers = [
        "TransactionID",
        "Type",
        "Timestamp",
        "Description",
        "Reference",
        "OriginUserID",
        "OriginEmail",
        "OriginCountry",
        "OriginAmount",
        "OriginCurrency",
        "OriginIP",
        "OriginDevice",
        "DestinationUserID",
        "DestinationEmail",
        "DestinationCountry",
        "DestinationAmount",
        "DestinationCurrency",
        "DestinationIP",
        "DestinationDevice",
        "PromotionUsed",
      ];

      const csvContent = [
        headers,
        ...tempData.map((row) => headers.map((header) => row[header])),
      ]
        .map((e) => e.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "transactions.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePdfDownload = async () => {
    try {
      const response = await axiosClient.get(
        "/transaction/getTransactionReport",
        {
          responseType: "blob", // Ensures the response is treated as binary
        }
      );

      const url = window.URL.createObjectURL(response.data);

      window.open(url);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredAndSortedData = useMemo(() => {

    return data.slice().sort((a, b) => {
      const compareValue = order === "asc" ? 1 : -1;
      if (orderBy === "amount") {
        return (a[orderBy] - b[orderBy]) * compareValue;
      }
      return a[orderBy].localeCompare(b[orderBy]) * compareValue;
    });
  }, [data]);


  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* Search and Filter Header */}

      <CronAndCreateButtons />
      <Box
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: "#f5f5f5",
          borderRadius: 1,
          display: "flex",
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              resetFilters();
              handleSearch(0, rowsPerPage);
            }
          }}
          sx={{ backgroundColor: "white", flexGrow: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => { resetFilters(); handleSearch(0, rowsPerPage) }}
                  sx={{ color: "primary.main" }}
                >
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          startIcon={<FilterList />}
          onClick={() => setFilterDialogOpen(true)}
        >
          Filters
        </Button>
        <IconButton onClick={exportToCSV} title="Export to CSV">
          <Download />
        </IconButton>
        <IconButton
          onClick={handlePdfDownload}
          title="Download Transaction Summary"
        >
          <PictureAsPdf />
        </IconButton>
      </Box>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Filter Transactions
          <IconButton
            aria-label="close"
            onClick={() => setFilterDialogOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange("startDate", date)}
                sx={{ width: "100%" }}
              />
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange("endDate", date)}
                sx={{ width: "100%" }}
              />
            </LocalizationProvider>

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Deposit">Deposit</MenuItem>
                <MenuItem value="Withdrawal">Withdrawal</MenuItem>
                <MenuItem value="Transfer">Transfer</MenuItem>
                <MenuItem value="Payment">Payment</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Minimum Amount"
              type="number"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange("minAmount", e.target.value)}
              fullWidth
            />

            <TextField
              label="Maximum Amount"
              type="number"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters} color="inherit">
            Reset
          </Button>
          <Button
            onClick={() => {
              resetPaginationObj();
              setFilterDialogOpen(false);
              handleSearch(0, rowsPerPage);
            }}
            variant="contained"
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Table Section */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "id"}
                  direction={orderBy === "id" ? order : "asc"}
                  onClick={() => handleSort("id")}
                >
                  Transaction ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "date"}
                  direction={orderBy === "date" ? order : "asc"}
                  onClick={() => handleSort("date")}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "type"}
                  direction={orderBy === "type" ? order : "asc"}
                  onClick={() => handleSort("type")}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "amount"}
                  direction={orderBy === "amount" ? order : "asc"}
                  onClick={() => handleSort("amount")}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => handleSort("status")}
                >
                  Status
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedData.length === 0 ? (
              paginationObj.total === 0 ? (<TableCell colspan={5} sx={{ textAlign: 'center' }}>No transactions related to this description</TableCell>) :
                <TableCell colspan={5} sx={{ textAlign: 'center' }}>Loading...</TableCell>
            ) : (
              filteredAndSortedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        cursor: "pointer",
                        color: "primary.main",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                      onClick={() => handleTransactionClick(row.id)}
                    >
                      {row.id}
                    </Box>
                  </TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>${row.amount}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={paginationObj.total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, n) => handleChangePage(e, n)}
          onRowsPerPageChange={(event) => {

            const newRowsPerPage = (parseInt(event.target.value, 10))
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
            handleSearch(0, newRowsPerPage);
          }}
        />
      </TableContainer>

      {/* Statistics Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Transaction Summary Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", minHeight: 450 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Transaction Summary
              </Typography>
              <Grid container spacing={4} sx={{ mt: 4 }}>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                    <AccountBalance
                      sx={{ mr: 2, fontSize: 30, color: "primary.main" }}
                    />
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary">
                        Total Volume
                      </Typography>
                      <Typography variant="h5">
                        ${transactionSummary.totalVolume?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                    <SwapHoriz
                      sx={{ mr: 2, fontSize: 30, color: "primary.main" }}
                    />
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary">
                        Total Transactions
                      </Typography>
                      <Typography variant="h4">
                        {transactionSummary.totalTransactions}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                    <TrendingUp
                      sx={{ mr: 2, fontSize: 30, color: "primary.main" }}
                    />
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary">
                        Average Size
                      </Typography>
                      <Typography variant="h4">
                        $
                        {transactionSummary.avgTransactionSize?.toFixed(2) || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                    <Assessment
                      sx={{ mr: 2, fontSize: 30, color: "primary.main" }}
                    />
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary">
                        Completed
                      </Typography>
                      <Typography variant="h4">
                        {transactionSummary.completedTransactions}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Chart Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", minHeight: 450 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transaction Types Distribution
              </Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionTable;
