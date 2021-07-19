import dayjs from 'dayjs'

// 格式化日期，例如：
// formatTime(Date.now(), 'YYYY-MM-DD HH:mm:ss', '暂无数据')
export const formatTime = (time, format, inValidText = '') => {
  if (dayjs(time).isValid()) {
    return dayjs(time).format(format);
  } else {
    return inValidText;
  }
}
