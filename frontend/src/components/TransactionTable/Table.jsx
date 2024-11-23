import React, { useState , useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, 
  DialogTitle, FormControl, Grid, IconButton, InputAdornment, InputLabel,
  MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TableSortLabel, TextField, Typography
} from '@mui/material';
import {
  Search, FilterList, Download, PictureAsPdf, AccountBalance,
  SwapHoriz, TrendingUp, Assessment
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axiosClient from "../utils/axios";

const TransactionTable = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    type: '',
    status: '',
    minAmount: '',
    maxAmount: ''
  });

 
  // Sample data - replace with your actual data
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axiosClient.get('/transaction/allTransactions');
        console.log(response.data.data);

        // Extract the required attributes from the fetched data
        const transformedData = response.data.data.map(transaction => ({
          id: transaction.transactionid,
          date: new Date(transaction.transaction_timestamp).toLocaleDateString(),
          type: transaction.type,
          amount: transaction.originamountdetails.transactionAmount,
          status: transaction.status || 'Unknown', // Assuming status is not provided in the original data
        }));

        setData(transformedData);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTransactions();

  }, [data]);

  const handleTransactionClick = (transactionId) => {
    navigate(`/transaction/${transactionId}`);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      type: '',
      status: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const handleSearch = () => {
    // Implement search logic
  };

  const exportToCSV = () => {
    // Implement CSV export logic
  };

  // Sample transaction summary data
  const transactionSummary = {
    totalVolume: 150000,
    totalTransactions: 45,
    avgTransactionSize: 3333.33,
    completedTransactions: 40
  };

  // Sample pie chart data
  const pieChartData = [
    { name: 'Deposits', value: 40, color: '#0088FE' },
    { name: 'Withdrawals', value: 30, color: '#00C49F' },
    { name: 'Transfers', value: 20, color: '#FFBB28' },
    { name: 'Payments', value: 10, color: '#FF8042' }
  ];

  
  const filteredAndSortedData = data.slice().sort((a, b) => {
    const compareValue = order === 'asc' ? 1 : -1;
    if (orderBy === 'amount') {
      return (a[orderBy] - b[orderBy]) * compareValue;
    }
    return a[orderBy].localeCompare(b[orderBy]) * compareValue;
  });

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Search and Filter Header */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ backgroundColor: 'white', flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" onClick={handleSearch}>Search</Button>
        <Button variant="contained" startIcon={<FilterList />} onClick={() => setFilterDialogOpen(true)}>
          Filters
        </Button>
        <IconButton onClick={exportToCSV} title="Export to CSV">
          <Download />
        </IconButton>
        <IconButton title="Export to PDF">
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
        <DialogTitle>Filter Transactions</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                sx={{ width: '100%' }}
              />
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => handleFilterChange('type', e.target.value)}
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
                onChange={(e) => handleFilterChange('status', e.target.value)}
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
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              fullWidth
            />

            <TextField
              label="Maximum Amount"
              type="number"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetFilters} color="inherit">Reset</Button>
          <Button onClick={() => setFilterDialogOpen(false)} variant="contained">
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
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  Transaction ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'date'}
                  direction={orderBy === 'date' ? order : 'asc'}
                  onClick={() => handleSort('date')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'type'}
                  direction={orderBy === 'type' ? order : 'asc'}
                  onClick={() => handleSort('type')}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'amount'}
                  direction={orderBy === 'amount' ? order : 'asc'}
                  onClick={() => handleSort('amount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        cursor: 'pointer',
                        color: 'primary.main',
                        '&:hover': {
                          textDecoration: 'underline',
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
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAndSortedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Statistics Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Transaction Summary Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', minHeight: 450 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transaction Summary
              </Typography>
              <Grid container spacing={2} sx={{ mt: 4 }}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Volume
                      </Typography>
                      <Typography variant="h6">
                        ${transactionSummary.totalVolume.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <SwapHoriz sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Transactions
                      </Typography>
                      <Typography variant="h6">
                        {transactionSummary.totalTransactions}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Average Size
                      </Typography>
                      <Typography variant="h6">
                        ${transactionSummary.avgTransactionSize.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Completed
                      </Typography>
                      <Typography variant="h6">
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
          <Card sx={{ height: '100%', minHeight: 450 }}>
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