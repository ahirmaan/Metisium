export interface Agent {
  id: string;
  name: string;
  avatar: string; // URL or path to image
}

export interface AgentRole {
  agentId: string;
  role: string;
}

export interface SubChat {
  id: string;
  title: string;
}

export interface Project {
  id: string;
  name: string;
  roles: AgentRole[];
  subChats: SubChat[];
}

export enum MessageSender {
  USER = 'user',
  AGENT = 'agent',
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  senderId: string; // 'user' or agent's ID
  timestamp: string;
}