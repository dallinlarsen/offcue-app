export function chunkIntoPairs<T>(list: T[]) {
  const result = [];

  for (let i = 0; i < list.length; i += 2) {
    const first = list[i];
    const second = list[i + 1] !== undefined ? list[i + 1] : null;
    result.push([first, second]);
  }

  return result;
}

export function formatFrequencyString(times: number, interval_num: number, interval_type: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year') {
    return `${times === 1 ? "once" : `${times} times`} every ${interval_num === 1 ? interval_type : `${interval_num} ${interval_type + "s"}`}`;
}