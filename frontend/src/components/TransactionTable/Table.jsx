import React, { useState, useMemo } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, TablePagination, Box, TextField, Button,
  MenuItem, FormControl, Select, InputLabel, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton,
  InputAdornment, TableSortLabel, Grid, Typography,
  Card, CardContent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { 
  Search, FilterList, Download, PictureAsPdf,
  TrendingUp, AccountBalance, SwapHoriz, Assessment
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const TransactionTable = () => {
  // Sample data - replace with your actual data
  const initialData = [
    { id: "TXN001", date: '2024-03-20', type: 'Deposit', amount: 1000, status: 'Completed' },
    { id: "TXN002", date: '2024-03-19', type: 'Withdrawal', amount: 500, status: 'Pending' },
    { id: "TXN003", date: '2024-03-18', type: 'Transfer', amount: 750, status: 'Completed' },
    { id: "TXN004", date: '2024-03-17', type: 'Payment', amount: 250, status: 'Completed' },
  ];

  // Pie chart data
  const pieChartData = [
    { name: 'Deposit', value: 1000, color: '#4CAF50' },
    { name: 'Withdrawal', value: 500, color: '#f44336' },
    { name: 'Transfer', value: 750, color: '#2196F3' },
    { name: 'Payment', value: 250, color: '#FF9800' },
  ];

  // State management
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    type: '',
    status: '',
    minAmount: '',
    maxAmount: '',
  });

  // Sorting function
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle search button click
  const handleSearch = () => {
    // Here you would make your API call with searchQuery and filters
    console.log('Making API call with:', { searchQuery, filters });
  };

  // Filter data based on search and filters
  const filteredAndSortedData = useMemo(() => {
    let filteredData = [...initialData];

    // Apply search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredData = filteredData.filter(item =>
        Object.values(item).some(value => 
          value.toString().toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply filters
    if (filters.startDate && filters.endDate) {
      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= filters.startDate && itemDate <= filters.endDate;
      });
    }

    if (filters.type) {
      filteredData = filteredData.filter(item => item.type === filters.type);
    }

    if (filters.status) {
      filteredData = filteredData.filter(item => item.status === filters.status);
    }

    if (filters.minAmount) {
      filteredData = filteredData.filter(item => item.amount >= Number(filters.minAmount));
    }

    if (filters.maxAmount) {
      filteredData = filteredData.filter(item => item.amount <= Number(filters.maxAmount));
    }

    // Apply sorting
    return filteredData.sort((a, b) => {
      const isAsc = order === 'asc';
      if (orderBy === 'amount') {
        return isAsc ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
      }
      return isAsc
        ? a[orderBy].toString().localeCompare(b[orderBy].toString())
        : b[orderBy].toString().localeCompare(a[orderBy].toString());
    });
  }, [initialData, searchQuery, filters, orderBy, order]);

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Type', 'Amount', 'Status'];
    const csvData = filteredAndSortedData.map(row => 
      [row.id, row.date, row.type, row.amount, row.status].join(',')
    );
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      type: '',
      status: '',
      minAmount: '',
      maxAmount: '',
    });
    setSearchQuery('');
    setPage(0);
  };

  // Transaction summary calculations
  const transactionSummary = {
    totalVolume: filteredAndSortedData.reduce((sum, item) => sum + item.amount, 0),
    totalTransactions: filteredAndSortedData.length,
    avgTransactionSize: filteredAndSortedData.reduce((sum, item) => sum + item.amount, 0) / filteredAndSortedData.length || 0,
    completedTransactions: filteredAndSortedData.filter(item => item.status === 'Completed').length,
  };

  // Rest of the state management and helper functions remain the same...
  // (Keep all the existing functions from the previous version)

  return (
    <Box sx={{ width: '100%' }}>
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
        <Button
          variant="contained"
          onClick={handleSearch}
        >
          Search
        </Button>
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
          <Button onClick={resetFilters} color="inherit">
            Reset
          </Button>
          <Button 
            onClick={() => setFilterDialogOpen(false)} 
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
                  <TableCell>{row.id}</TableCell>
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
        {/* Transaction Summary Cards */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transaction Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transaction Types Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
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