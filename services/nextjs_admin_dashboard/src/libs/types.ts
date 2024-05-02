export interface Group extends Record<string, unknown> {
  id: string;
  name: string;
  created_at: Date;
  path_ids: string | null;
  path_names: string;
}

export interface Permission {
  id: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  created_at: Date;
  group_name: string;
  document_type: string;
  document_name: string;
}

export interface Document {
  id: string;
  type: string;
  name: string;
  created_at: Date;
}

export interface User {
  id: string;
  email: string;
  created_at: Date;
}
