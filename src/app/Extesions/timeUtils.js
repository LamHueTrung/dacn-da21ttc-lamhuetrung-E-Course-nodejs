// timeUtils.js

/**
 * Chuyển đổi chuỗi thời gian hh:mm:ss hoặc mm:ss thành số giây.
 * @param {string} timeString - Chuỗi thời gian, có thể là 'hh:mm:ss' hoặc 'mm:ss'.
 * @returns {number} - Số giây tương ứng với thời gian đó.
 */
function convertToSeconds(timeString) {
    const mmssRegex = /^[0-5]?[0-9]:[0-5][0-9]$/; // Định dạng mm:ss
    const hhmmssRegex = /^([0-9]{1,2}):([0-5]?[0-9]):([0-5]?[0-9])$/; // Định dạng hh:mm:ss

    // Chuẩn hóa mm:ss thành hh:mm:ss
    if (mmssRegex.test(timeString)) {
        timeString = `00:${timeString}`;
    }

    // Kiểm tra định dạng hh:mm:ss
    if (!hhmmssRegex.test(timeString)) {
        throw new Error('Invalid time format');
    }

    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds; // Trả về tổng số giây
}

/**
 * Chuyển đổi số giây thành chuỗi thời gian định dạng hh:mm:ss.
 * @param {number} totalSeconds - Tổng số giây cần chuyển đổi.
 * @returns {string} - Chuỗi thời gian dưới dạng hh:mm:ss.
 */
function convertSecondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Đảm bảo mỗi phần thời gian có 2 chữ số
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Hàm cộng tất cả các chuỗi thời gian và trả về tổng thời gian trong định dạng hh:mm:ss.
 * @param {Array} timeArray - Mảng các chuỗi thời gian (hh:mm:ss hoặc mm:ss).
 * @returns {string} - Tổng thời gian của tất cả các phần tử trong mảng, định dạng hh:mm:ss.
 */
function sumDurations(timeArray) {
    const totalSeconds = timeArray.reduce((total, timeString) => {
        try {
            const seconds = convertToSeconds(timeString);
            return total + seconds;
        } catch (error) {
            return total; // Nếu có lỗi, bỏ qua phần tử không hợp lệ
        }
    }, 0);

    return convertSecondsToTime(totalSeconds); // Chuyển lại tổng số giây thành định dạng hh:mm:ss
}

module.exports = {
    convertToSeconds,
    convertSecondsToTime,
    sumDurations,
};
