import React, { useEffect, useState } from 'react';
import { Container } from '../components';
import TransactionTable from '../components/TransactionTable/Table';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import axiosClient from '../components/utils/axios';

function Home() {
  const authStatus = useSelector((state) => state.auth.status);
  const dispatch = useDispatch();

  useEffect(() => {

    const verifyToken = async () => {

        try {
        
          const response = await axiosClient.get('/user/verifyToken');

          if (response.status === 200) {
            console.log(200);

            dispatch(login({ userData: response.data.user })); 
          } 

          else alert('Please login again to access this resource');
          

        } 
        catch (error) {

            // switch (error.status) {

            //   case 401:
            //     if (error.response.data.message.includes('Please login again')) {
            //       alert('Please login again to access this resource');
            //     }
            //     else if (error.response.data.message.includes('User not found')) {
            //       alert('User not registered . Please register first'); 
            //     }
            //     else if (error.response.data.message.includes('Invalid token')) {
            //       alert('Invalid session. Please login again.');
            //     }
            //     break;
            //   case 403:
            //     if (error.response.data.message.includes('Token expired')) {
            //       alert('Session expired. Please login again.');
            //     }
            //     break;
            //   default:
            //     alert('Internal Server Error');

            console.log(error);
            }
          }

    verifyToken();
  }, [dispatch]);


  if (!authStatus) {
    return (
      <div className="w-full py-8 mt-4 text-center">
        <Container>
          <div className="flex flex-wrap">
            <div className="p-2 w-full">
              <h1 className="text-2xl font-bold hover:text-gray-500">
                Please login to access the dashboard
              </h1>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="w-full py-8 mt-4">
      <Container>
        <TransactionTable />
      </Container>
    </div>
  );
}

export default Home;