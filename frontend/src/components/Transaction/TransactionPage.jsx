import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../utils/axios";

function TransactionPage() {
  const { id } = useParams(); // Get the id from the route parameters
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await axiosClient.get(`/transaction/getTransaction/${id}`);
        if (response.status === 200) {
          const data = response.data.data;

          console.log(data);

          // Transform the response data to match the sample object format
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
        } else {
          console.error("Failed to fetch transaction");
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
      }
    };

    fetchTransaction();
  }, [id]);

  if (!transaction) {
    return <div>Loading...</div>;
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-2xl mx-auto my-8 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-600 text-white p-6 text-center">
        <h1 className="text-2xl font-bold">Transaction Details</h1>
      </div>
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-xl text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">
            Basic Information
          </h2>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Transaction ID</div>
            <div
              className="text-blue-900 font-semibold cursor-pointer hover:underline hover:text-blue-600"
              onClick={() => copyToClipboard(transaction.transactionid)}
            >
              {transaction.transactionid}
            </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Type</div>
            <div className="text-blue-900 font-semibold">{transaction.type}</div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Timestamp</div>
            <div className="text-blue-900 font-semibold">{transaction.transaction_timestamp}</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">
            User Information
          </h2>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Origin User ID</div>
            <div className="text-blue-900 font-semibold">{transaction.originuserid}</div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Destination User ID</div>
            <div className="text-blue-900 font-semibold">{transaction.destinationuserid}</div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Origin Email</div>
            <div className="text-blue-900 font-semibold">{transaction.originemail}</div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Destination Email</div>
            <div className="text-blue-900 font-semibold">{transaction.destinationemail}</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">
            Amount Details
          </h2>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Origin Amount</div>
            <div className="text-blue-900 font-semibold">{transaction.originamountdetails}</div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Destination Amount</div>
            <div className="text-blue-900 font-semibold">{transaction.destinationamountdetails}</div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Promotion Code Used</div>
            <div className="text-blue-900 font-semibold">{transaction.promotioncodeused}</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl text-blue-900 mb-4 border-b-2 border-blue-200 pb-2">
            Additional Information
          </h2>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Reference</div>
            <div className="text-blue-900 font-semibold">{transaction.reference}</div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Origin Device Data</div>
            <div className="text-blue-900 font-semibold">{transaction.origindevice_data}</div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Destination Device Data</div>
            <div className="text-blue-900 font-semibold">{transaction.destinationdevice_data}</div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Tags</div>
            <div className="text-blue-900 font-semibold">{transaction.tags}</div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-blue-200">
            <div className="text-gray-700 font-medium">Description</div>
            <div className="text-blue-900 font-semibold">{transaction.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionPage;