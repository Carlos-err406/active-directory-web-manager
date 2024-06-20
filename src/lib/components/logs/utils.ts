import dayjs from 'dayjs';

const errorRegexp = new RegExp(/^(.*?)\[Error\]:/);
const infoRegexp = new RegExp(/^(.*?)\[Info\]:/);
export const isErrorLog = (log: string) => errorRegexp.test(log);
export const isInfoLog = (log: string) => infoRegexp.test(log);
export const getLogDate = (log: string) => dayjs(log.split(' -- ')[0].split(' ')[0]);
export const getLogContent = (log: string) => log.split(' -- ')[1];
