import React, { useEffect} from 'react';
import { Container } from '../components';
import TransactionTable from '../components/TransactionTable/Table';
import { useSelector, useDispatch } from 'react-redux';
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

        console.log(error);

      }
    }

    verifyToken();
  }, [dispatch]);


  if (!authStatus) {
    return (
      <div className="w-full h-[70vh] flex items-center justify-center">
        <Container>
          <div className="flex flex-wrap justify-center">
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