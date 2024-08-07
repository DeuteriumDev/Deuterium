export interface Group extends Record<string, unknown> {
  id: string;
  _name: string;
  name: string;
  created_at: Date;
  _parent_name: string;
  parent_name: string;
  path_ids: string | null;
  path_names: string;
}

export interface Permission extends Record<string, unknown> {
  id: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  created_at: Date;
  group_name: string;
  group_id: string;
  document_type: string;
  document_name: string;
  document_id: string;
  foreign_id: string;
}

export interface Document extends Record<string, unknown> {
  id: string;
  type: string;
  name: string;
  _name: string;
  created_at: Date;
}

export interface User extends Record<string, unknown> {
  id: string;
  email: string;
  created_at: Date;
}


export type Node = {
  id: string;
  name: string;
  type: 'user' | 'group' | 'permission' | 'document';
  created_at: Date;
};