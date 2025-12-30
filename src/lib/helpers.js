import * as XLSX from "xlsx";
import { CalendarDate } from "@internationalized/date";


// Утилиты для работы с данными
export const helpers = {
    imgproxy_path: (file, width, height) => {
		`https://fudomedia.ru/insecure/rs:fill:${width}:${height}/g:sm/format:webp/${btoa(`local:///${file}`)}`
    },

//     date_to_str: (timestamp) => {
//         const date = new Date(timestamp);
//         const day = String(date.getDate()).padStart(2, "0");
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const year = date.getFullYear();
//         return `${year}-${month}-${day}`;
//     },

//     ts_to_date_time: (timestamp, showSec) => {
//         const date = new Date(timestamp * 1000);
//         const day = String(date.getDate()).padStart(2, "0");
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const year = date.getFullYear();
//         let hours = date.getHours();
//         let minuts = date.getMinutes();
//         hours = hours < 10 ? "0" + hours : hours;
//         minuts = minuts < 10 ? "0" + minuts : minuts;
//         let seconds =
//             date.getSeconds() < 10
//                 ? "0" + date.getSeconds()
//                 : date.getSeconds();
//         if (showSec) {
//             return `${day}.${month}.${year} ${hours}:${minuts}:${seconds}`;
//         } else {
//             return `${day}.${month}.${year} ${hours}:${minuts}`;
//         }
//     },
//     format_date(date_string) {
//         const date = new Date(date_string);

//         const day = String(date.getDate()).padStart(2, '0');
//         const month = String(date.getMonth() + 1).padStart(2, '0'); 
//         const year = date.getFullYear();
    
//         return `${day}.${month}.${year}`;
//     }, 
//     format_date2: (date_string) => {
//         const date = new Date(date_string);
//         const day = String(date.getDate()).padStart(2, "0");
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const year = date.getFullYear();

//         return `${year}-${month}-${day}`;
//     },
//     date_to_date_value: (date) => {
//         if (!date) return undefined;
//         return new CalendarDate(
//             date.getFullYear(),
//             date.getMonth() + 1,
//             date.getDate()
//         );
//     },
//     ts_to_date: (timestamp) => {
//         const date = new Date(timestamp);
//         const day = String(date.getDate()).padStart(2, "0");
//         const month = String(date.getMonth() + 1).padStart(2, "0"); // месяцы начинаются с 0
//         const year = date.getFullYear();
//         return `${day}.${month}.${year}`;
//     },
//     // Преобразует дату в timestamp
//     date_to_ts : (date_string) => {
//         const timestamp = Date.parse(date_string);
//         return isNaN(timestamp) ? null : timestamp;
//     },
//     get_date_now: () => {
//         const now = new Date();
//         const year = now.getFullYear();
//         const month = String(now.getMonth() + 1).padStart(2, '0');
//         const day = String(now.getDate()).padStart(2, '0');
//         const hours = String(now.getHours()).padStart(2, '0');
//         const minutes = String(now.getMinutes()).padStart(2, '0');

//         return `${year}-${month}-${day} ${hours}:${minutes}`;
//     },
//     format_city_name: (city) => {
// 	if (!city) return '-';
//         const normalized_city = city.toLowerCase();
//         return CITY_TRANSLATIONS[normalized_city] || '-';
//     },
//     xml_parser: (xmlData, tagNames) => {
//         const parser = new DOMParser();
//         const xmlDoc = parser.parseFromString(xmlData, 'text/xml');

//         const extractedData = [];

//         tagNames.forEach(tagName => {
//             const tagElement = xmlDoc.getElementsByTagName(tagName)[0];
//             if (tagElement && tagElement.textContent !== '') {
//                 extractedData.push(tagElement.textContent || '');
//             }
//         });

//         return extractedData.length > 0 ? extractedData.join(', ') : '-';
//     }
};
// const CITY_TRANSLATIONS = {
// 	chelyabinsk: 'Челябинск',
// 	kopeysk: 'Копейск',
// 	ekaterinburg: 'Екатеринбург',
// };