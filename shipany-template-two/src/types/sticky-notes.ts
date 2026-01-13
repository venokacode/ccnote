export type NoteType =
  | 'missing_call'
  | 'installation_record'
  | 'general_inquiry'
  | 'internal_task'
  | 'other';

export type NoteColor = 'blue' | 'red' | 'yellow' | 'green' | 'purple';

export type NoteStatus = 'new' | 'in_progress' | 'waiting' | 'done' | 'archived';

export const NOTE_TYPE_CONFIG: Record<
  NoteType,
  { label: string; color: NoteColor }
> = {
  missing_call: { label: 'Missing Call', color: 'blue' },
  installation_record: { label: 'Installation Record', color: 'red' },
  general_inquiry: { label: 'General Inquiry', color: 'yellow' },
  internal_task: { label: 'Internal Task', color: 'green' },
  other: { label: 'Other', color: 'purple' },
};

export const NOTE_STATUS_CONFIG: Record<NoteStatus, { label: string }> = {
  new: { label: 'New' },
  in_progress: { label: 'In Progress' },
  waiting: { label: 'Waiting' },
  done: { label: 'Done' },
  archived: { label: 'Archived' },
};

export interface StickyNote {
  id: string;
  orgId: string;
  createdByUserId: string;
  title: string | null;
  content: string;
  type: NoteType;
  color: NoteColor;
  status: NoteStatus;
  tags: string[];
  positionX: number;
  positionY: number;
  zIndex: number;
  isCollapsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  orgId: string;
  noteId: string;
  remindAt: Date;
  message: string;
  isTriggered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteComment {
  id: string;
  orgId: string;
  noteId: string;
  userId: string;
  content: string;
  createdAt: Date;
  userName?: string;
}

export interface WorkspaceState {
  orgId: string;
  zoomLevel: number;
  viewportOffsetX: number;
  viewportOffsetY: number;
  updatedAt: Date;
}

export interface CreateNoteInput {
  title?: string;
  content: string;
  type: NoteType;
  tags?: string[];
  positionX?: number;
  positionY?: number;
}

export interface UpdateNoteInput {
  title?: string | null;
  content?: string;
  status?: NoteStatus;
  tags?: string[];
  positionX?: number;
  positionY?: number;
  zIndex?: number;
  isCollapsed?: boolean;
}

export interface CreateReminderInput {
  remindAt: Date | string;
  message: string;
}

export interface CreateCommentInput {
  content: string;
}

export interface UpdateWorkspaceInput {
  zoomLevel?: number;
  viewportOffsetX?: number;
  viewportOffsetY?: number;
}

export const EMAIL_TEMPLATES: Record<
  NoteType,
  { subject: string; body: string }[]
> = {
  missing_call: [
    {
      subject: 'Following Up on Your Recent Call',
      body: `Dear [Customer Name],

We apologize for missing your call. We value your time and would like to assist you as soon as possible.

Please let us know a convenient time to reach you, or feel free to call us back at your convenience.

Best regards,
ProDent Support Team`,
    },
  ],
  installation_record: [
    {
      subject: 'Installation Confirmation - [Product Name]',
      body: `Dear [Customer Name],

This email confirms the successful installation of [Product Name] at your location.

Installation Details:
- Date: [Date]
- Time: [Time]
- Technician: [Technician Name]

If you have any questions or concerns, please don't hesitate to contact us.

Best regards,
ProDent Installation Team`,
    },
  ],
  general_inquiry: [
    {
      subject: 'Re: Your Inquiry',
      body: `Dear [Customer Name],

Thank you for contacting ProDent Support. We have received your inquiry and our team is reviewing your request.

We will get back to you within 24 hours with a detailed response.

Best regards,
ProDent Support Team`,
    },
  ],
  internal_task: [],
  other: [],
};

// Quick reminder presets
export const REMINDER_PRESETS = [
  { label: 'In 1 hour', hours: 1 },
  { label: 'In 2 hours', hours: 2 },
  { label: 'In 4 hours', hours: 4 },
  { label: 'Tomorrow', hours: 24 },
  { label: 'In 2 days', hours: 48 },
  { label: 'In 1 week', hours: 168 },
];
