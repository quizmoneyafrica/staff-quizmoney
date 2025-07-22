import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

// export function isIosPwaInstalled(): boolean {
//   if (typeof window === "undefined") return false;

//   const isIos = /iphone|ipad|ipod/.test(
//     window.navigator.userAgent.toLowerCase()
//   );
//   const isStandalone =
//     ("standalone" in navigator && navigator.standalone === true) ||
//     window.matchMedia("(display-mode: standalone)").matches;

//   return isIos && isStandalone;
// }

export function isIosPwaInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIosDevice =
    /iphone|ipad|ipod/.test(userAgent) ||
    (userAgent.includes('macintosh') && 'ontouchend' in document);

  const isStandalone =
    ('standalone' in navigator && navigator.standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches;

  return isIosDevice && isStandalone;
}

// export const isMobileOrTablet = () => {
//   if (typeof window === "undefined") return false;
//   return /iphone|ipad|ipod|android|mobile/i.test(
//     window.navigator.userAgent.toLowerCase()
//   );
// };
export const isMobileOrTablet = () => {
  if (typeof window === 'undefined') return false;

  const ua = window.navigator.userAgent.toLowerCase();

  const isTouchMac = ua.includes('macintosh') && 'ontouchend' in document; // modern iPads

  return /iphone|ipad|ipod|android|mobile/i.test(ua) || isTouchMac;
};

export function capitalizeFirstLetter(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export const toastPosition = isMobileOrTablet() ? 'top-center' : 'top-right';
export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const formatCountDown = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};
//For auth verification
export const resendTimer = 300;

//Format Amounts
export function formatNaira(
  amount: number | string,
  showDecimals = false,
): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(value)) return '₦0';

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(value);
}

//Date
export function formatQuizDate(input: string): string {
  const date = parseISO(input);

  const time = format(date, 'h:mm a');

  if (isToday(date)) {
    return `Today, ${time}`;
  } else if (isTomorrow(date)) {
    return `Tomorrow, ${time}`;
  } else if (!isPast(date)) {
    return `${format(date, 'EEEE')}, ${time}`;
  } else {
    // Past date
    return `${format(date, 'MMM do')}, ${time}`;
  }
}

export function formatDateTime(isoString: string) {
  const date = new Date(isoString);

  const time = format(date, 'h:mm:SS a');
  const fullDate = format(date, 'MMM dd, yyyy');

  return {
    time,
    fullDate,
  };
}

export function readTotalTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  const parts = [
    hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : '',
    minutes > 0 ? `${minutes} min${minutes !== 1 ? 's' : ''}` : '',
    seconds > 0 ? `${seconds} second${seconds !== 1 ? 's' : ''}` : '',
    milliseconds > 0 ? `${milliseconds} ms` : '',
  ];

  return parts.filter(Boolean).join(', ');
}
export function readLeaderboardTotalTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  const parts = [
    hours > 0 ? `${hours}h` : '',
    minutes > 0 ? `${minutes}m` : '',
    seconds > 0 ? `${seconds}s` : '',
    milliseconds > 0 ? `${milliseconds}ms` : '',
  ];

  return parts.filter(Boolean).join(', ');
}

export function parseTimeStringToMilliseconds(time: string): number {
  const [mm, ss, ms] = time?.split(':')?.map(Number);

  return (mm || 0) * 60000 + (ss || 0) * 1000 + (ms || 0);
}

export function truncateWords(text: string, limit: number = 5): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ') + ' ...';
}
export function formatRank(n: number): string {
  const suffixes: { [key: number]: string } = { 1: 'st', 2: 'nd', 3: 'rd' };
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  const suffix =
    lastTwoDigits >= 11 && lastTwoDigits <= 13
      ? 'th'
      : suffixes[lastDigit] || 'th';

  return `${n}${suffix}`;
}
export function disableConsoleInProduction() {
  if (process.env.NODE_ENV === 'production') {
    for (const method of ['log', 'warn', 'error', 'info', 'debug'] as const) {
      console[method] = () => {};
    }
  }
}

export function formatTimeToMinutesAndSeconds(timeString: string): string {
  // Split the time string by colons
  const parts = timeString.split(':').map(Number); // Convert each part to a number

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  // Determine if it's HH:MM:SS, MM:SS, or just SS based on the number of parts
  if (parts.length === 3) {
    [hours, minutes, seconds] = parts;
  } else if (parts.length === 2) {
    [minutes, seconds] = parts;
  } else if (parts.length === 1) {
    [seconds] = parts;
  } else {
    // Handle invalid input format
    console.warn(
      `Invalid time string format: ${timeString}. Expected HH:MM:SS, MM:SS, or SS.`,
    );
    return ''; // Or throw an error, depending on desired behavior
  }

  // Calculate total seconds from all parts
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Calculate final minutes and seconds from the total seconds
  const finalMinutes = Math.floor(totalSeconds / 60);
  const finalSeconds = totalSeconds % 60;

  let formattedTime = '';

  if (finalMinutes > 0) {
    formattedTime += `${finalMinutes}m`;
  }

  // Only add seconds if there are seconds, or if there are no minutes
  // and we still need to display the seconds (e.g., "0m 30s" vs "30s")
  if (
    finalSeconds > 0 ||
    (finalMinutes === 0 && finalSeconds === 0 && timeString !== '')
  ) {
    // Ensure seconds are displayed, especially if minutes are 0 (e.g., "30s" instead of nothing)
    if (formattedTime !== '') {
      // Add a space if minutes were already added
      formattedTime += ' ';
    }
    formattedTime += `${finalSeconds}s`;
  } else if (
    finalMinutes === 0 &&
    finalSeconds === 0 &&
    timeString === '00:00'
  ) {
    // Special case for '00:00' to show '0s'
    formattedTime = '0s';
  }

  return formattedTime.trim(); // Trim any leading/trailing space just in case
}

export function formatNairaValue(value: string | number) {
  if (typeof value === 'string' && value.startsWith('₦')) {
    return formatNaira(parseFloat(value.replace(/[^\d.]/g, '')));
  }
  return formatNaira(value);
}

// import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

// // export function isIosPwaInstalled(): boolean {
// //   if (typeof window === "undefined") return false;

// //   const isIos = /iphone|ipad|ipod/.test(
// //     window.navigator.userAgent.toLowerCase()
// //   );
// //   const isStandalone =
// //     ("standalone" in navigator && navigator.standalone === true) ||
// //     window.matchMedia("(display-mode: standalone)").matches;

// //   return isIos && isStandalone;
// // }

// export function isIosPwaInstalled(): boolean {
//   if (typeof window === 'undefined') return false;

//   const userAgent = window.navigator.userAgent.toLowerCase();
//   const isIosDevice =
//     /iphone|ipad|ipod/.test(userAgent) ||
//     (userAgent.includes('macintosh') && 'ontouchend' in document);

//   const isStandalone =
//     ('standalone' in navigator && navigator.standalone === true) ||
//     window.matchMedia('(display-mode: standalone)').matches;

//   return isIosDevice && isStandalone;
// }

// // export const isMobileOrTablet = () => {
// //   if (typeof window === "undefined") return false;
// //   return /iphone|ipad|ipod|android|mobile/i.test(
// //     window.navigator.userAgent.toLowerCase()
// //   );
// // };
// export const isMobileOrTablet = () => {
//   if (typeof window === 'undefined') return false;

//   const ua = window.navigator.userAgent.toLowerCase();

//   const isTouchMac = ua.includes('macintosh') && 'ontouchend' in document; // modern iPads

//   return /iphone|ipad|ipod|android|mobile/i.test(ua) || isTouchMac;
// };

// export function capitalizeFirstLetter(str: string) {
//   if (!str) return '';
//   return str.charAt(0).toUpperCase() + str.slice(1);
// }

// export function cn(...classes: (string | undefined | null | false)[]) {
//   return classes.filter(Boolean).join(' ');
// }

// export const toastPosition = isMobileOrTablet() ? 'top-center' : 'top-right';
// export const isValidEmail = (email: string) =>
//   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// export const formatCountDown = (seconds: number) => {
//   const m = Math.floor(seconds / 60)
//     .toString()
//     .padStart(2, '0');
//   const s = (seconds % 60).toString().padStart(2, '0');
//   return `${m}:${s}`;
// };
// //For auth verification
// export const resendTimer = 300;

// //Format Amounts
// export function formatNaira(
//   amount: number | string,
//   showDecimals = false,
// ): string {
//   const value = typeof amount === 'string' ? parseFloat(amount) : amount;

//   if (isNaN(value)) return '₦0';

//   return new Intl.NumberFormat('en-NG', {
//     style: 'currency',
//     currency: 'NGN',
//     minimumFractionDigits: showDecimals ? 2 : 0,
//     maximumFractionDigits: showDecimals ? 2 : 0,
//   }).format(value);
// }

// //Date
// export function formatQuizDate(input: string): string {
//   const date = parseISO(input);

//   const time = format(date, 'h:mm a');

//   if (isToday(date)) {
//     return `Today, ${time}`;
//   } else if (isTomorrow(date)) {
//     return `Tomorrow, ${time}`;
//   } else if (!isPast(date)) {
//     return `${format(date, 'EEEE')}, ${time}`;
//   } else {
//     // Past date
//     return `${format(date, 'MMM do')}, ${time}`;
//   }
// }

// // //notification
// // export function formatDateTime(isoString: string) {
// //   const date = new Date(isoString);
// //   const time = format(date, 'h:mm a');
// //   const fullDate = format(date, 'MMM dd, yyyy');

// //   return {
// //     time,
// //     fullDate,
// //   };
// // }

// //notification

// export function formatDateTime(isoString: string) {
//   const date = new Date(isoString);

//   const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

//   const time = format(date, 'h:mm') + `:${milliseconds} ` + format(date, 'a');
//   const fullDate = format(date, 'MMM dd, yyyy');

//   return {
//     time,
//     fullDate,
//   };
// }

// export function readTotalTime(ms: number): string {
//   const hours = Math.floor(ms / 3600000);
//   const minutes = Math.floor((ms % 3600000) / 60000);
//   const seconds = Math.floor((ms % 60000) / 1000);
//   const milliseconds = ms % 1000;

//   const parts = [
//     hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : '',
//     minutes > 0 ? `${minutes} min${minutes !== 1 ? 's' : ''}` : '',
//     seconds > 0 ? `${seconds} second${seconds !== 1 ? 's' : ''}` : '',
//     milliseconds > 0 ? `${milliseconds} ms` : '',
//   ];

//   return parts.filter(Boolean).join(', ');
// }
// export function readLeaderboardTotalTime(ms: number): string {
//   const hours = Math.floor(ms / 3600000);
//   const minutes = Math.floor((ms % 3600000) / 60000);
//   const seconds = Math.floor((ms % 60000) / 1000);
//   const milliseconds = ms % 1000;

//   const parts = [
//     hours > 0 ? `${hours}h` : '',
//     minutes > 0 ? `${minutes}m` : '',
//     seconds > 0 ? `${seconds}s` : '',
//     milliseconds > 0 ? `${milliseconds}ms` : '',
//   ];

//   return parts.filter(Boolean).join(', ');
// }

// export function parseTimeStringToMilliseconds(time: string): number {
//   const [mm, ss, ms] = time?.split(':')?.map(Number);

//   return (mm || 0) * 60000 + (ss || 0) * 1000 + (ms || 0);
// }

// export function truncateWords(text: string, limit: number = 5): string {
//   const words = text.trim().split(/\s+/);
//   if (words.length <= limit) return text;
//   return words.slice(0, limit).join(' ') + ' ...';
// }
// export function formatRank(n: number): string {
//   const suffixes: { [key: number]: string } = { 1: 'st', 2: 'nd', 3: 'rd' };
//   const lastDigit = n % 10;
//   const lastTwoDigits = n % 100;

//   const suffix =
//     lastTwoDigits >= 11 && lastTwoDigits <= 13
//       ? 'th'
//       : suffixes[lastDigit] || 'th';

//   return `${n}${suffix}`;
// }
// export function disableConsoleInProduction() {
//   if (process.env.NODE_ENV === 'production') {
//     for (const method of ['log', 'warn', 'error', 'info', 'debug'] as const) {
//       console[method] = () => {};
//     }
//   }
// }

// export function formatTimeToMinutesAndSeconds(timeString: string): string {
//   // Split the time string by colons
//   const parts = timeString.split(':').map(Number); // Convert each part to a number

//   let hours = 0;
//   let minutes = 0;
//   let seconds = 0;

//   // Determine if it's HH:MM:SS, MM:SS, or just SS based on the number of parts
//   if (parts.length === 3) {
//     [hours, minutes, seconds] = parts;
//   } else if (parts.length === 2) {
//     [minutes, seconds] = parts;
//   } else if (parts.length === 1) {
//     [seconds] = parts;
//   } else {
//     // Handle invalid input format
//     console.warn(
//       `Invalid time string format: ${timeString}. Expected HH:MM:SS, MM:SS, or SS.`,
//     );
//     return ''; // Or throw an error, depending on desired behavior
//   }

//   // Calculate total seconds from all parts
//   const totalSeconds = hours * 3600 + minutes * 60 + seconds;

//   // Calculate final minutes and seconds from the total seconds
//   const finalMinutes = Math.floor(totalSeconds / 60);
//   const finalSeconds = totalSeconds % 60;

//   let formattedTime = '';

//   if (finalMinutes > 0) {
//     formattedTime += `${finalMinutes}m`;
//   }

//   // Only add seconds if there are seconds, or if there are no minutes
//   // and we still need to display the seconds (e.g., "0m 30s" vs "30s")
//   if (
//     finalSeconds > 0 ||
//     (finalMinutes === 0 && finalSeconds === 0 && timeString !== '')
//   ) {
//     // Ensure seconds are displayed, especially if minutes are 0 (e.g., "30s" instead of nothing)
//     if (formattedTime !== '') {
//       // Add a space if minutes were already added
//       formattedTime += ' ';
//     }
//     formattedTime += `${finalSeconds}s`;
//   } else if (
//     finalMinutes === 0 &&
//     finalSeconds === 0 &&
//     timeString === '00:00'
//   ) {
//     // Special case for '00:00' to show '0s'
//     formattedTime = '0s';
//   }

//   return formattedTime.trim(); // Trim any leading/trailing space just in case
// }
