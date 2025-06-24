// import React from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { useRequestInstance } from '@/app/api/config';

// const WithdrawalStatsTest: React.FC = () => {
//   const request = useRequestInstance();

//   const { data, isPending, error, refetch } = useQuery({
//     queryKey: ['test_withdrawal_stats'],
//     queryFn: () =>
//       request
//         .post(`/getAllTransactionsWithStats`)
//         .then((res) => {
//           console.log('✅ API Response Success:', res.data);
//           console.log('✅ Full Response Object:', res);
//           return res.data;
//         })
//         .catch((error) => {
//           console.error('❌ API Error:', error);
//           console.error('❌ Error Response:', error.response?.data);
//           console.error('❌ Error Status:', error.response?.status);
//           throw error.response?.data || error;
//         }),
//     retry: false,
//   });

//   return (
//     <div className="mx-auto mt-8 max-w-2xl rounded-lg bg-white p-6 shadow-lg">
//       <h2 className="mb-4 text-2xl font-bold">Withdrawal Stats API Test</h2>

//       <div className="space-y-4">
//         <div className="flex gap-4">
//           <button
//             onClick={() => refetch()}
//             disabled={isPending}
//             className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
//           >
//             {isPending ? 'Testing...' : 'Test API'}
//           </button>

//           <div className="flex items-center gap-2">
//             <div
//               className={`h-3 w-3 rounded-full ${
//                 isPending
//                   ? 'bg-yellow-500'
//                   : error
//                   ? 'bg-red-500'
//                   : data
//                   ? 'bg-green-500'
//                   : 'bg-gray-300'
//               }`}
//             ></div>
//             <span className="text-sm">
//               {isPending
//                 ? 'Loading...'
//                 : error
//                 ? 'Error'
//                 : data
//                 ? 'Success'
//                 : 'Not tested'}
//             </span>
//           </div>
//         </div>

//         {isPending && (
//           <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
//             <p className="text-yellow-800">🔄 Calling API...</p>
//           </div>
//         )}

//         {error && (
//           <div className="rounded border border-red-200 bg-red-50 p-4">
//             <h3 className="mb-2 font-semibold text-red-800">
//               ❌ Error Details:
//             </h3>
//             <pre className="overflow-auto text-sm text-red-700">
//               {JSON.stringify(error, null, 2)}
//             </pre>
//           </div>
//         )}

//         {data && (
//           <div className="rounded border border-green-200 bg-green-50 p-4">
//             <h3 className="mb-2 font-semibold text-green-800">
//               ✅ API Response:
//             </h3>
//             <pre className="overflow-auto rounded border bg-white p-3 text-sm text-green-700">
//               {JSON.stringify(data, null, 2)}
//             </pre>
//           </div>
//         )}

//         <div className="rounded border border-blue-200 bg-blue-50 p-4">
//           <h3 className="mb-2 font-semibold text-blue-800">📋 Instructions:</h3>
//           <ol className="space-y-1 text-sm text-blue-700">
//             <li>1. Click "Test API" button</li>
//             <li>2. Open browser DevTools (F12)</li>
//             <li>3. Check Console tab for detailed logs</li>
//             <li>4. Copy the response structure shown above</li>
//             <li>5. Share it with me to create the proper integration</li>
//           </ol>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WithdrawalStatsTest;
