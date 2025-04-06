export function chunkIntoPairs<T>(list: T[]) {
  const result = [];

  for (let i = 0; i < list.length; i += 2) {
    const first = list[i];
    const second = list[i + 1] !== undefined ? list[i + 1] : null;
    result.push([first, second]);
  }

  return result;
}

export function formatFrequencyString(times: number, frequency: number, frequencyType: 'minute' | 'hour' | 'day') {
    return `${times === 1 ? "once" : `${times} times`} every ${frequency === 1 ? frequencyType : `${frequency} ${frequencyType + "s"}`}`;
}