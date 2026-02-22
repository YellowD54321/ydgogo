import { ISerializedMoveTree } from '@/models/serialize/types';

export interface RecordListItem {
  recordId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordDetail extends RecordListItem {
  gameTree: ISerializedMoveTree;
}

export interface ListRecordsResponse {
  records: RecordListItem[];
  nextCursor: string | null;
}

export interface ListRecordsParams {
  limit?: number;
  cursor?: string;
}

export interface CreateRecordInput {
  title: string;
  gameTree: ISerializedMoveTree;
}

export interface UpdateRecordInput {
  title: string;
  gameTree: ISerializedMoveTree;
}
