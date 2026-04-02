// 'use client';

// import React from 'react';
// import { useRouter } from 'next/navigation';
// import { useQuery } from '@tanstack/react-query';
// import {
//   ArrowLeft,
//   Calendar,
//   Clock,
//   DollarSign,
//   Hash,
//   User,
//   Wallet,
//   Loader2,
// } from 'lucide-react';
// import { VerifiedIcon } from '@/app/icons/icons';
// import GameApi from '@/app/api/game';
// import { formatDateTime, formatNaira } from '@/app/utils/utils';

// interface NumberGuessingGameHistoryProps {
//   params: {
//     id: string;
//   };
//   searchParams: {
//     gameId: string;
//     status: string;
//   };
// }

// interface NumberGuessingGameSession {
//   id: string;
//   name: string;
//   email: string;
//   hiddenNo: number;
//   extraTrials: number;
//   result: string;
//   amountWon: number;
//   gameId: string;
//   entryFee: number;
//   lowerBound: number;
//   upperBound: number;
//   gameTime: string;
//   attemptLimit: number;

//   trialData?: GameAttempt[];
//   duration?: number;
//   endTime?: string;
// }

// interface ApiGameSessionData {
//   id: string;
//   name?: string;
//   playerName?: string;
//   email?: string;
//   playerEmail?: string;
//   hiddenNo?: number;
//   hiddenNumber?: number;
//   extraTrials?: number;
//   result?: string;
//   amountWon?: number;
//   totalWinnings?: number;
//   gameId?: string;
//   entryFee?: number;
//   stake?: number;
//   lowerBound?: number;
//   upperBound?: number;
//   gameTime?: string;
//   startTime?: string;
//   attemptLimit?: number;
//   trialData?: GameAttempt[];
//   duration?: number;
//   endTime?: string;
// }

// interface GameAttempt {
//   attempt: number;
//   guessedNumber: number;
//   result: string;
//   timeTaken: string;
//   correct: boolean;
// }

// const NumberGuessingGameHistory: React.FC<NumberGuessingGameHistoryProps> = ({
//   params,
//   searchParams,
// }) => {
//   const router = useRouter();
//   const status = searchParams?.status || '';

//   const {
//     data: gameSession,
//     isLoading,
//     error,
//   } = useQuery<NumberGuessingGameSession>({
//     queryKey: ['gameSessionDetails', params.id],
//     queryFn: async (): Promise<NumberGuessingGameSession> => {
//       const response = await GameApi.getGameSessionById(
//         params.id,
//         'NUMBER_GUESSER',
//       );

//       const sessionData = response.data.data as ApiGameSessionData;

//       return {
//         id: sessionData.id,
//         name: sessionData.name || sessionData.playerName || 'Unknown Player',
//         email:
//           sessionData.email || sessionData.playerEmail || 'No email provided',
//         hiddenNo: sessionData.hiddenNo || sessionData.hiddenNumber || 0,
//         extraTrials: sessionData.extraTrials || 0,
//         result: sessionData.result || 'UNKNOWN',
//         amountWon: sessionData.amountWon || sessionData.totalWinnings || 0,
//         gameId: sessionData.gameId || sessionData.id,
//         entryFee: sessionData.entryFee || sessionData.stake || 0,
//         lowerBound: sessionData.lowerBound || 0,
//         upperBound: sessionData.upperBound || 100,
//         gameTime:
//           sessionData.gameTime ||
//           sessionData.startTime ||
//           new Date().toISOString(),
//         attemptLimit: sessionData.attemptLimit || 3,
//         trialData: sessionData.trialData || [],
//         duration: sessionData.duration,
//         endTime: sessionData.endTime,
//       };
//     },
//     enabled: !!params.id,
//   });

//   const handleBackClick = () => {
//     router.push('/number-guessing');
//   };

//   const getStatusColor = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case 'won':
//         return { bg: '#E7FEED', text: '#009028' };
//       case 'lost':
//       case 'loss':
//         return { bg: '#FFE7E7', text: '#E02424' };
//       case 'in_progress':
//         return { bg: '#FFF6C5', text: '#ED7B2B' };
//       default:
//         return { bg: '#E7FEED', text: '#009028' };
//     }
//   };

//   const getResultStyle = (result: string, isCorrect: boolean) => {
//     if (isCorrect) return 'bg-green-100 text-green-600';
//     if (result === 'Too High') return 'bg-red-100 text-red-600';
//     if (result === 'Too Low') return 'bg-yellow-100 text-yellow-600';
//     return 'bg-gray-100 text-gray-600';
//   };

//   const formatResultDisplay = (result: string) => {
//     switch (result) {
//       case 'IN_PROGRESS':
//         return 'In Progress';
//       case 'WON':
//         return 'Won';
//       case 'LOSS':
//         return 'Lost';
//       default:
//         return result;
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="text-center">
//           <p className="mb-4 text-red-600">
//             Failed to load game details. Please try again.
//           </p>
//           <button
//             onClick={handleBackClick}
//             className="hover:bg-primary-800 rounded bg-blue-600 px-4 py-2 text-white"
//           >
//             Back to Games
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!gameSession) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="text-center">
//           <p className="mb-4">Game session not found</p>
//           <button
//             onClick={handleBackClick}
//             className="hover:bg-primary-800 rounded bg-blue-600 px-4 py-2 text-white"
//           >
//             Back to Games
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const statusColors = getStatusColor(gameSession.result || status);

//   const gameDate = gameSession.gameTime
//     ? formatDateTime(gameSession.gameTime)
//     : { time: '', fullDate: '' };

//   const duration = gameSession.duration
//     ? `${Math.floor(gameSession.duration / 60)}:${(gameSession.duration % 60)
//         .toString()
//         .padStart(2, '0')}`
//     : '00:00';

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
//       <div className="mb-6">
//         <button
//           onClick={handleBackClick}
//           className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-800"
//         >
//           <ArrowLeft className="h-5 w-5" />
//           <span className="text-sm font-medium">Back to Games</span>
//         </button>
//       </div>

//       <div className="mx-auto max-w-6xl">
//         <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
//           <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
//             <h1 className="mb-4 text-2xl font-bold text-gray-900 lg:mb-0">
//               Number Guessing Game History
//             </h1>
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-medium text-gray-700">
//                 Game Status:
//               </span>
//               <span
//                 className="rounded-full px-4 py-2 text-sm font-medium capitalize"
//                 style={{
//                   backgroundColor: statusColors.bg,
//                   color: statusColors.text,
//                 }}
//               >
//                 {formatResultDisplay(gameSession.result || status)}
//               </span>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
//             <div className="flex flex-col items-center text-center">
//               <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
//                 <User className="h-6 w-6 text-blue-600" />
//               </div>
//               <div className="mb-1 flex items-center gap-1">
//                 <span className="font-bold text-blue-700">
//                   {gameSession.name}
//                 </span>
//                 {/* <VerifiedIcon size={14} className="ml-0.5 text-blue-600" /> */}
//               </div>
//               <span className="text-sm text-gray-500">{gameSession.email}</span>
//             </div>

//             <div className="flex flex-col items-center text-center">
//               <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
//                 <Hash className="h-6 w-6 text-blue-600" />
//               </div>
//               <span className="font-bold text-blue-700">
//                 {gameSession.gameId}
//               </span>
//               <span className="text-sm text-gray-500">Game ID</span>
//             </div>

//             <div className="flex flex-col items-center text-center">
//               <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
//                 <Calendar className="h-6 w-6 text-blue-600" />
//               </div>
//               <span className="font-bold text-blue-700">
//                 {gameDate.fullDate || 'N/A'}
//               </span>
//               <span className="text-sm text-gray-500">
//                 {gameDate.time || 'N/A'}
//               </span>
//             </div>

//             <div className="flex flex-col items-center text-center">
//               <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
//                 <DollarSign className="h-6 w-6 text-blue-600" />
//               </div>
//               <span className="font-bold text-blue-700">
//                 {formatNaira(gameSession.entryFee)}
//               </span>
//               <span className="text-sm text-gray-500">Entry Fee</span>
//             </div>

//             <div className="flex flex-col items-center text-center">
//               <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
//                 <Wallet className="h-6 w-6 text-blue-600" />
//               </div>
//               <span className="font-bold text-blue-700">
//                 {formatNaira(gameSession.amountWon)}
//               </span>
//               <span className="text-sm text-gray-500">Total Earned</span>
//             </div>
//           </div>
//         </div>

//         <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">
//           <div className="mb-6 flex items-center justify-between">
//             <h2 className="text-xl font-bold text-gray-900">Game Details</h2>
//             <div className="flex items-center gap-2 text-blue-600">
//               <Clock className="h-5 w-5" />
//               <span className="font-medium">Time Taken: {duration}</span>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
//             <div className="text-center">
//               <div className="mb-3 flex items-center justify-center gap-2">
//                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
//                   {gameSession.lowerBound}
//                 </div>
//                 <div className="h-0.5 w-8 bg-gray-300"></div>
//                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
//                   {gameSession.upperBound}
//                 </div>
//               </div>
//               <span className="text-sm font-medium text-gray-700">
//                 Number Range
//               </span>
//             </div>

//             <div className="text-center">
//               <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
//                 <span className="text-xl font-bold text-yellow-600">
//                   {gameSession.hiddenNo}
//                 </span>
//               </div>
//               <span className="text-sm font-medium text-gray-700">
//                 Hidden number
//               </span>
//             </div>

//             <div className="text-center">
//               <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
//                 <span className="text-xl font-bold text-green-600">
//                   {gameSession.trialData?.length || 0}/
//                   {gameSession.attemptLimit}
//                 </span>
//               </div>
//               <span className="text-sm font-medium text-gray-700">Trials</span>
//             </div>

//             <div className="text-center">
//               <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
//                 <span className="text-xl font-bold text-green-600">
//                   {gameSession.extraTrials}
//                 </span>
//               </div>
//               <span className="text-sm font-medium text-gray-700">
//                 Trials bought
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="rounded-2xl border bg-white p-6 shadow-sm">
//           <h2 className="mb-6 text-xl font-bold text-gray-900">
//             Trial history
//           </h2>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200">
//                   <th className="px-4 py-3 text-left font-medium text-gray-600">
//                     Attempt
//                   </th>
//                   <th className="px-4 py-3 text-left font-medium text-gray-600">
//                     Player Guess
//                   </th>
//                   <th className="px-4 py-3 text-left font-medium text-gray-600">
//                     Result
//                   </th>
//                   <th className="px-4 py-3 text-left font-medium text-gray-600">
//                     Time taken
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {gameSession.trialData && gameSession.trialData.length > 0 ? (
//                   gameSession.trialData.map((attempt, index) => (
//                     <tr
//                       key={index}
//                       className="border-b border-gray-100 hover:bg-gray-50"
//                     >
//                       <td className="px-4 py-4">
//                         <span className="font-bold text-gray-900">
//                           #{attempt.attempt || index + 1}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4">
//                         <span className="font-semibold text-gray-900">
//                           {attempt.guessedNumber}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4">
//                         <span
//                           className={`rounded-full px-3 py-1 text-sm font-medium ${getResultStyle(
//                             attempt.result,
//                             attempt.correct,
//                           )}`}
//                         >
//                           {attempt.correct ? 'Correct' : 'Wrong'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4">
//                         <span className="text-gray-600">
//                           {attempt.timeTaken || 'N/A'}
//                         </span>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan={4}
//                       className="px-4 py-8 text-center text-gray-500"
//                     >
//                       No attempts recorded
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NumberGuessingGameHistory;
