import React from "react";

function TransactionPage() {
  // Transaction data
  const transaction = {
    transactionid: "TRANS-98765-XYZ",
    type: "Digital Transfer",
    transaction_timestamp: "2024-01-15 14:30:22",
    originuserid: "USER-12345",
    destinationuserid: "USER-67890",
    originamountdetails: "$500.00 USD",
    destinationamountdetails: "$500.00 USD",
    promotioncodeused: "WELCOME20",
    reference: "REF-DIGITAL-TRANSFER",
    origindevice_data: "iOS/Safari",
    destinationdevice_data: "Android/Chrome",
    tags: "Digital, International",
    description: "Peer-to-Peer Transfer",
    originemail: "sender@example.com",
    destinationemail: "receiver@example.com",
  };

  // Format the timestamp to a more readable format
  const formattedTimestamp = new Date(
    transaction.transaction_timestamp
  ).toLocaleString();

  // Function to copy text to clipboard
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
            <div className="text-blue-900 font-semibold">{formattedTimestamp}</div>
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