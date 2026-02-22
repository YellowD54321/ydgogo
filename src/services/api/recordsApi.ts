import {
  ListRecordsParams,
  ListRecordsResponse,
  RecordListItem,
  RecordDetail,
  CreateRecordInput,
  UpdateRecordInput,
} from '@/types/apis/recordsApi.types';
import { fetchWithAuth } from './common/apiClient';

export function listRecords(
  token: string,
  params?: ListRecordsParams,
): Promise<ListRecordsResponse> {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.cursor) query.set('cursor', params.cursor);

  const qs = query.toString();
  const endpoint = `/records${qs ? `?${qs}` : ''}`;

  return fetchWithAuth<ListRecordsResponse>('GET', endpoint, token);
}

export function getRecord(
  token: string,
  recordId: string,
): Promise<RecordDetail> {
  return fetchWithAuth<RecordDetail>('GET', `/records/${recordId}`, token);
}

export function createRecord(
  token: string,
  input: CreateRecordInput,
): Promise<RecordListItem> {
  return fetchWithAuth<RecordListItem>('POST', '/records', token, input);
}

export function updateRecord(
  token: string,
  recordId: string,
  input: UpdateRecordInput,
): Promise<RecordDetail> {
  return fetchWithAuth<RecordDetail>(
    'PUT',
    `/records/${recordId}`,
    token,
    input,
  );
}

export function deleteRecord(token: string, recordId: string): Promise<void> {
  return fetchWithAuth<void>('DELETE', `/records/${recordId}`, token);
}
