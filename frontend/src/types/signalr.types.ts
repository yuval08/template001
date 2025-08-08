/**
 * TypeScript type definitions for SignalR messages and events
 */

import type { UserId, ProjectId, FileId } from '@/shared/types/branded';

/**
 * Base SignalR message interface
 */
export interface BaseSignalRMessage {
  timestamp: string;
  userId?: UserId;
}

/**
 * Job-related message types
 */
export interface JobCompletedMessage extends BaseSignalRMessage {
  jobId: string;
  result: JobResult;
  message: string;
}

export interface JobFailedMessage extends BaseSignalRMessage {
  jobId: string;
  error: string;
  message: string;
  stackTrace?: string;
}

/**
 * Job result types based on job type
 */
export type JobResult = 
  | ReportGenerationResult
  | FileProcessingResult
  | DataExportResult
  | EmailJobResult
  | GenericJobResult;

export interface ReportGenerationResult {
  type: 'report';
  reportId: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
}

export interface FileProcessingResult {
  type: 'file';
  fileId: FileId;
  originalName: string;
  processedName: string;
  thumbnailUrl?: string;
  metadata: Record<string, unknown>;
}

export interface DataExportResult {
  type: 'export';
  exportId: string;
  fileName: string;
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  recordCount: number;
  downloadUrl: string;
}

export interface EmailJobResult {
  type: 'email';
  messageId: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: 'completed' | 'partial' | 'failed';
}

export interface GenericJobResult {
  type: 'generic';
  data: Record<string, unknown>;
  summary: string;
}

/**
 * Project-related message types
 */
export interface ProjectUpdatedMessage extends BaseSignalRMessage {
  projectId: ProjectId;
  name: string;
  changes: ProjectUpdateChanges;
  updatedBy: UserId;
  updatedByName: string;
}

export interface ProjectUpdateChanges {
  name?: { from: string; to: string };
  description?: { from: string; to: string };
  status?: { from: ProjectStatus; to: ProjectStatus };
  endDate?: { from: string | null; to: string | null };
  members?: {
    added: Array<{ userId: UserId; userName: string }>;
    removed: Array<{ userId: UserId; userName: string }>;
  };
}

export type ProjectStatus = 'active' | 'completed' | 'paused' | 'cancelled';

/**
 * User-related message types
 */
export interface UserJoinedMessage extends BaseSignalRMessage {
  userId: UserId;
  userName: string;
  userEmail: string;
  joinedAt: string;
}

export interface UserLeftMessage extends BaseSignalRMessage {
  userId: UserId;
  userName: string;
  leftAt: string;
  reason?: 'logout' | 'timeout' | 'disconnect';
}

/**
 * System announcement message types
 */
export interface SystemAnnouncementMessage extends BaseSignalRMessage {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  targetAudience?: 'all' | 'admins' | 'managers' | UserId[];
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
}

export type AnnouncementType = 'info' | 'warning' | 'maintenance' | 'feature' | 'security';
export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * File upload/processing message types
 */
export interface FileUploadedMessage extends BaseSignalRMessage {
  fileId: FileId;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedBy: UserId;
  uploadedByName: string;
  projectId?: ProjectId;
  isPublic: boolean;
}

export interface FileProcessingMessage extends BaseSignalRMessage {
  fileId: FileId;
  fileName: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  processingSteps?: Array<{
    step: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    startedAt?: string;
    completedAt?: string;
  }>;
}

/**
 * Real-time activity message types
 */
export interface UserActivityMessage extends BaseSignalRMessage {
  activityType: 'page_view' | 'action' | 'idle' | 'active';
  page?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Connection status message types
 */
export interface ConnectionStatusMessage {
  connected: boolean;
  connectionId: string;
  connectedAt?: string;
  disconnectedAt?: string;
  reason?: string;
  userCount?: number;
}

/**
 * Chat/messaging related types
 */
export interface ChatMessage extends BaseSignalRMessage {
  messageId: string;
  senderId: UserId;
  senderName: string;
  content: string;
  messageType: 'text' | 'file' | 'system' | 'notification';
  channelId?: string;
  replyToId?: string;
  mentions?: UserId[];
  attachments?: Array<{
    fileId: FileId;
    fileName: string;
    contentType: string;
    size: number;
  }>;
}

/**
 * Union type of all possible SignalR messages
 */
export type SignalRMessage = 
  | JobCompletedMessage
  | JobFailedMessage
  | ProjectUpdatedMessage
  | UserJoinedMessage
  | UserLeftMessage
  | SystemAnnouncementMessage
  | FileUploadedMessage
  | FileProcessingMessage
  | UserActivityMessage
  | ConnectionStatusMessage
  | ChatMessage;

/**
 * SignalR event names mapped to their message types
 */
export interface SignalREvents {
  'ReceiveNotification': SystemAnnouncementMessage;
  'JobCompleted': JobCompletedMessage;
  'JobFailed': JobFailedMessage;
  'ProjectUpdated': ProjectUpdatedMessage;
  'UserJoined': UserJoinedMessage;
  'UserLeft': UserLeftMessage;
  'SystemAnnouncement': SystemAnnouncementMessage;
  'FileUploaded': FileUploadedMessage;
  'FileProcessing': FileProcessingMessage;
  'UserActivity': UserActivityMessage;
  'ConnectionStatus': ConnectionStatusMessage;
  'ReceiveMessage': ChatMessage;
}

/**
 * SignalR hub method names and their parameter types
 */
export interface SignalRMethods {
  'JoinUserGroup': [userId: UserId];
  'LeaveUserGroup': [userId: UserId];
  'SendMessageToUser': [targetUserId: UserId, message: string];
  'SendMessageToAll': [message: string];
  'NotifyProjectUpdate': [projectId: ProjectId];
  'JoinProjectGroup': [projectId: ProjectId];
  'LeaveProjectGroup': [projectId: ProjectId];
  'UpdateUserActivity': [activity: UserActivityMessage];
  'SendChatMessage': [message: Omit<ChatMessage, 'messageId' | 'timestamp' | 'senderId' | 'senderName'>];
}

/**
 * Type-safe SignalR connection interface
 */
export interface TypedHubConnection {
  on<K extends keyof SignalREvents>(
    methodName: K,
    handler: (message: SignalREvents[K]) => void
  ): void;

  invoke<K extends keyof SignalRMethods>(
    methodName: K,
    ...args: SignalRMethods[K]
  ): Promise<void>;

  off<K extends keyof SignalREvents>(
    methodName: K,
    handler?: (message: SignalREvents[K]) => void
  ): void;

  start(): Promise<void>;
  stop(): Promise<void>;
  
  readonly state: 'Connected' | 'Connecting' | 'Reconnecting' | 'Disconnected' | 'Disconnecting';
  readonly connectionId: string | null;
}

/**
 * Custom event types for browser event system
 */
export interface SignalRCustomEvents {
  'signalr:jobCompleted': CustomEvent<JobCompletedMessage>;
  'signalr:jobFailed': CustomEvent<JobFailedMessage>;
  'signalr:projectUpdated': CustomEvent<ProjectUpdatedMessage>;
  'signalr:notification': CustomEvent<SystemAnnouncementMessage>;
  'signalr:fileUploaded': CustomEvent<FileUploadedMessage>;
  'signalr:userJoined': CustomEvent<UserJoinedMessage>;
  'signalr:userLeft': CustomEvent<UserLeftMessage>;
  'signalr:connectionStatus': CustomEvent<ConnectionStatusMessage>;
}

/**
 * SignalR service configuration
 */
export interface SignalRServiceConfig {
  hubUrl: string;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  automaticReconnect: boolean;
  withCredentials: boolean;
  enableLogging: boolean;
}

/**
 * Connection state with metadata
 */
export interface SignalRConnectionState {
  status: 'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'error';
  connectionId?: string;
  connectedAt?: Date;
  lastError?: Error;
  reconnectAttempts: number;
  userGroups: Set<UserId>;
  projectGroups: Set<ProjectId>;
}