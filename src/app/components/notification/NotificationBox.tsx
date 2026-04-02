// import { formatDateTime, truncateWords } from '@/app/utils/utils';
// import { Flex, Grid } from '@radix-ui/themes';
// import React from 'react';

// type Props = {
//   notification: ApiResponse;
//   setOpenNotification: React.Dispatch<React.SetStateAction<boolean>>;
//   setPassedNotification: React.Dispatch<React.SetStateAction<ApiResponse>>;
// };

// export const NotificationBox = ({
//   notification,
//   setPassedNotification,
//   setOpenNotification,
// }: Props) => {
//   const { time, fullDate } = formatDateTime(notification.createdAt);

//   const handleViewNotification = async () => {
//     setOpenNotification(true);
//     setPassedNotification(notification);
//   };
//   return (
//     <>
//       <button
//         onClick={handleViewNotification}
//         className="hover:bg-primary-50 focus:bg-primary-50 w-full cursor-pointer rounded-[10px] border border-neutral-200 bg-white p-4"
//       >
//         <Grid columns="3" align="center" justify="between">
//           <div className="col-span-2 grid grid-cols-[56px_1fr] items-center gap-2">
//             <div
//               className={`bg-primary-50 grid h-14 w-14 place-items-center rounded-full`}
//             >
//               <span className="text-3xl">
//                 {notification.message.includes('deposit')
//                   ? '💰'
//                   : notification.message.includes('purchased')
//                   ? '🛍'
//                   : notification.message.includes('request')
//                   ? '💸'
//                   : '🔔 '}
//               </span>
//             </div>
//             <Grid className="text-left">
//               <p className="text-primary-800 font-bold">
//                 {notification.message}
//               </p>
//               <span className="text-xs text-neutral-600">
//                 {truncateWords(notification.mainText)}
//               </span>
//             </Grid>
//           </div>
//           {/* Right  */}
//           <Grid gap="2">
//             <Flex
//               direction="column"
//               align="end"
//               justify="end"
//               className="text-xs text-neutral-600"
//             >
//               <span>{time}</span>
//               <Flex align="center" gap="1">
//                 <span>{fullDate}</span>
//                 {!notification.read && (
//                   <div className="bg-positive-900 h-[8px] w-[8px] rounded-full " />
//                 )}
//               </Flex>
//             </Flex>
//             {!notification.read && (
//               <p className="text-right text-xs text-neutral-400">Unread</p>
//             )}
//           </Grid>
//         </Grid>
//       </button>
//     </>
//   );
// };
