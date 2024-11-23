import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axiosClient from '../utils/axios';
import { useNavigate } from 'react-router-dom';


const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(25,118,210)',
    },
  },
});

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 1000,
  margin: '20px auto',
  padding: theme.spacing(2),
}));

const TRANSACTION_TYPES = ['PAYMENT', 'WITHDRAWAL', 'REFUND', 'TRANSFER'];

const TransactionForm = () => {


const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: '',
    originuserid: '',
    destinationuserid: '',
    originamountdetails: '',
    destinationamountdetails: '',
    promotioncodeused: '',
    reference: '',
    origindevice_data: '',
    destinationdevice_data: '',
    tags: '',
    description: '',
    originemail: '',
    destinationemail: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const generateRandomData = () => {
    const randomData = {
      type: TRANSACTION_TYPES[Math.floor(Math.random() * TRANSACTION_TYPES.length)],
      originuserid: `USER${Math.floor(Math.random() * 10000)}`,
      destinationuserid: `USER${Math.floor(Math.random() * 10000)}`,
      originamountdetails: `${Math.floor(Math.random() * 1000)} USD`,
      destinationamountdetails: `${Math.floor(Math.random() * 1000)} USD`,
      promotioncodeused: Math.random() > 0.5 ? 'PROMO2024' : '',
      reference: `REF${Math.floor(Math.random() * 100000)}`,
      origindevice_data: `iPhone/${Math.floor(Math.random() * 5 + 10)}.0`,
      destinationdevice_data: `Android/${Math.floor(Math.random() * 5 + 10)}.0`,
      tags: 'payment, mobile',
      description: 'Transaction description',
      originemail: `user${Math.floor(Math.random() * 1000)}@example.com`,
      destinationemail: `user${Math.floor(Math.random() * 1000)}@example.com`
    };
    setFormData(randomData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosClient.post('/transaction/addTransaction',  JSON.stringify({
          type: formData.type,
          originUserId: formData.originuserid,
          destinationUserId: formData.destinationuserid,
          originAmountDetails: formData.originamountdetails,
          destinationAmountDetails: formData.destinationamountdetails,
          promotionCodeUsed: false,
          reference: formData.reference,
          originDeviceData: formData.origindevice_data,
          destinationDeviceData: formData.destinationdevice_data,
          tags: formData.tags.split(',').map(tag => ({ value: tag.trim() })),
          description: formData.description,
          originEmail: formData.originemail,
          destinationEmail: formData.destinationemail,
        }),
      );
      

     if(response.status === 200) {
        alert(`Transaction created with transaction id: ${response.data.data.p_transactionid}`);
        navigate("/");
    }
      

    } catch (error) {
        console.error('Error creating transaction:', error);

        switch(error.status) {

            case 400: alert('Error creating transaction');
            break

            default: alert('Internal Server Error');
        }

    }
  };

  const renderFormField = (key) => {
    if (key === 'type') {
      return (
        <FormControl fullWidth size="small">
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            id="type"
            name="type"
            value={formData.type}
            label="Type"
            onChange={handleChange}
            required
          >
            {TRANSACTION_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
      <TextField
        required={['destinationuserid', 'originamountdetails', 'destinationamountdetails', 'description', 'destinationemail'].includes(key)}
        fullWidth
        label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
        name={key}
        value={formData[key]}
        onChange={handleChange}
        variant="outlined"
        size="small"
      />
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledCard>
        <CardHeader 
          title="Create Transaction" 
          titleTypographyProps={{ 
            variant: 'h5', 
            color: 'primary',
            align: 'center'
          }} 
        />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {Object.keys(formData).map((key) => (
                <Grid item xs={12} sm={6} key={key}>
                  {renderFormField(key)}
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={generateRandomData}
              >
                Random Data
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
              >
                Create Transaction
              </Button>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    </ThemeProvider>
  );
};

export default TransactionForm;