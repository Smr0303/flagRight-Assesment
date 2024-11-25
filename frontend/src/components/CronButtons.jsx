import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startCron, stopCron } from '../store/authSlice';
import axiosClient from '../components/utils/axios';
import { useNavigate } from 'react-router-dom';

const CronAndCreateButtons = () => {
  const cronStatus = useSelector((state) => state.auth.cron); // Get the cron state from Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();


  useEffect(() => {
    const checkCronStatus = async () => {
      try {
        const response = await axiosClient.get('/cron/cronStatus', {
          withCredentials: true,
        });

        if (response.data.isRunning) {

          console.log("Cron is alerady running");
          dispatch(startCron());

        } else {
  
          dispatch(stopCron());
        }
      } catch (error) {
        console.error('Error checking cron status:', error);
      }
    };

    checkCronStatus();
  }, [dispatch]);

  const handleToggleCron = async () => {
    if (cronStatus) {
      try {
        const response = await axiosClient.post("/cron/stopCron", {
          withCredentials: true,
        });

        if (response.status === 200) alert("Job stopped successfully");

        dispatch(stopCron());

        window.location.reload();

      } catch (error) {

        switch (error.status) {
          case 400:
            if (error.response.data.message.includes('CRON job is not running')) {
              alert('CRON job is not running.');
            }
            break;
          case 401:
            if (error.response.data.message.includes('Please login again')) {
              alert('Please login again to access this resource');
            }
            if (error.response.data.message.includes('User not found')) {
              alert('User not found');
            }
            if (error.response.data.message.includes('Invalid token')) {
              alert('Invalid token. Please login again.');
            }
            break;
          case 403:
            if (error.response.data.message.includes('Token expired')) {
              alert('Token expired. Please login again.');
            }
            if (error.response.data.message.includes('Role')) {
              alert(`Only admins are allowed to control cron job`);
            }
            break;
          default:
            alert('Internal Server Error');
        }
      }
    } else {

      try {
        const response = await axiosClient.post("/cron/startCron", {
          withCredentials: true,
        });

        if (response.status === 200) alert("Job started successfully and Please dont forget to close the cron job");

        dispatch(startCron());
      }
      catch (error) {
        switch (error.status) {
          case 400:
            if (error.response.data.message.includes('CRON job is alerady running')) {
              alert('CRON job is alerady running.');
            }
            break;
          case 401:
            if (error.response.data.message.includes('Please login again')) {
              alert('Please login again to access this resource');
            }
            if (error.response.data.message.includes('User not found')) {
              alert('User not found');
            }
            if (error.response.data.message.includes('Invalid token')) {
              alert('Invalid token. Please login again.');
            }
            break;
          case 403:
            if (error.response.data.message.includes('Token expired')) {
              alert('Token expired. Please login again.');
            }
            if (error.response.data.message.includes('Role')) {
              alert(`Only admins are allowed to control cron job`);
            }
            break;
          default:
            alert('Internal Server Error');
        }
      }
    }
  };


  const handleCreateTransaction = () => {

    navigate('/create-transaction');

  };

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
      <button
        onClick={handleToggleCron}
        className={`inline-block px-4 py-2 duration-200 hover:bg-gray-600 rounded-md shadow-md ${!cronStatus ? 'bg-[rgb(25,118,210)] text-white' : 'bg-red-500 text-white'}`}
      >
        {cronStatus ? "Stop Cron" : "Start Cron"}
      </button>
      <button
        onClick={handleCreateTransaction}
        className={`inline-block px-4 py-2 duration-200 hover:bg-gray-600 rounded-md shadow-md bg-[rgb(25,118,210)] text-white`}
      >
        <span className="mr-2">+</span> Create Transaction
      </button>
    </div>
  );
};

export default CronAndCreateButtons;