import dayjs from 'dayjs';
import db from '../db';
import { RNotification } from '../notifications/notifications.types';

export type ResponseRecord = Pick<RNotification, 'reminder_id' | 'scheduled_at' | 'response_status'>;

export async function getResponses(
  reminderIds?: number[],
  startDate?: string,
  endDate?: string,
): Promise<ResponseRecord[]> {
  const where: string[] = [];
  const params: any[] = [];
  if (reminderIds && reminderIds.length > 0) {
    where.push(`reminder_id IN (${reminderIds.map(() => '?').join(',')})`);
    params.push(...reminderIds);
  }
  if (startDate) {
    where.push('DATE(scheduled_at) >= DATE(?)');
    params.push(dayjs(startDate).format('YYYY-MM-DD'));
  }
  if (endDate) {
    where.push('DATE(scheduled_at) <= DATE(?)');
    params.push(dayjs(endDate).format('YYYY-MM-DD'));
  }
  const sql = `SELECT reminder_id, scheduled_at, response_status FROM notifications ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY scheduled_at ASC;`;
  const rows = await db.getAllAsync<ResponseRecord>(sql, params);
  return rows;
}

export type ResponseCounts = { done: number; skip: number; no_response: number };

export function summarizeResponses(rows: ResponseRecord[]): ResponseCounts {
  return rows.reduce<ResponseCounts>(
    (acc, r) => {
      if (r.response_status === 'done') acc.done += 1;
      else if (r.response_status === 'skip') acc.skip += 1;
      else acc.no_response += 1;
      return acc;
    },
    { done: 0, skip: 0, no_response: 0 },
  );
}
