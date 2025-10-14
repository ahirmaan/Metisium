import type { Agent, Project, Message } from './types';
import { MessageSender } from './types';

export const AGENTS: Agent[] = [
  { id: 'gemini', name: 'Gemini', avatar: 'https://i.imgur.com/e5k2m2I.png' },
  { id: 'claude', name: 'Claude', avatar: 'https://i.imgur.com/gDCGk8v.png' },
  { id: 'chatgpt', name: 'ChatGPT', avatar: 'https://i.imgur.com/6VB2ey4.png' },
  { id: 'grok', name: 'Grok', avatar: 'https://i.imgur.com/bWtRqJM.png' },
];

export const PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Marketing Campaign',
    roles: [
      { agentId: 'chatgpt', role: 'Content Writer' },
      { agentId: 'gemini', role: 'Image Generator & Data Analyst' },
      { agentId: 'claude', role: 'Strategic Advisor' },
      { agentId: 'grok', role: 'Social Media Tone Analyst' },
    ],
  },
  {
    id: 'proj-2',
    name: 'Software Development',
    roles: [
      { agentId: 'chatgpt', role: 'Code Documentation Writer' },
      { agentId: 'gemini', role: 'Code Generation & Optimization' },
      { agentId: 'claude', role: 'Project Architecture Reviewer' },
      { agentId: 'grok', role: 'User Feedback Summarizer' },
    ],
  },
];

export const PAST_CHATS = [
    { id: 'chat-1', title: 'Brainstorming session Q3' },
    { id: 'chat-2', title: 'Initial draft for blog post' },
    { id: 'chat-3', title: 'Code review for new feature' },
];

export const MOCK_RESPONSES: Record<string, Record<string, string>> = {
  gemini: {
    'Image Generator & Data Analyst': "Certainly. Based on the data, I recommend focusing on the 25-34 demographic. I've also generated a concept image for the ad campaign. Here it is.",
    'Code Generation & Optimization': "I've analyzed the provided snippet and identified a performance bottleneck. Here is an optimized version of the function using a more efficient algorithm.",
    default: "Hello! As Gemini, I'm ready to assist with my multi-modal capabilities. What can I help you with?",
  },
  claude: {
    'Strategic Advisor': "Considering the long-term goals, we should prioritize brand trust over immediate conversions. This involves a more educational content approach.",
    'Project Architecture Reviewer': "The proposed architecture is solid, but I would suggest implementing a message queue for decoupling the microservices to improve scalability and resilience.",
    default: "Hello, I'm Claude. I'm here to provide thoughtful and safe responses. How can I assist you today?",
  },
  chatgpt: {
    'Content Writer': "Here is a draft for the social media post: 'Unleash your creativity with our new product! ✨ Transform your workflow and achieve more. #Innovation #Productivity'",
    'Code Documentation Writer': "I have generated the documentation for the API endpoints you've created. It includes function descriptions, parameters, and return values in Markdown format.",
    default: "Hi there! I'm ChatGPT, ready to help with a wide range of tasks. What's on your mind?",
  },
  grok: {
    'Social Media Tone Analyst': "Okay, so the sentiment on Twitter is leaning sarcastic but positive. They love the idea but are making fun of the launch video. We should lean into the humor.",
    'User Feedback Summarizer': "After analyzing the latest user feedback, the key takeaway is that users love the new feature but find the UI confusing. They keep mentioning the 'blue button' is hard to find.",
    default: "Grok here. I've got access to real-time info and a bit of a rebellious streak. Ask me anything.",
  },
};

export const MOCK_CHAT_HISTORY: Record<string, Message[]> = {
  'chat-1': [
    { id: 'c1m1', text: 'Hey everyone, let\'s start brainstorming for the Q3 marketing campaign. @claude what should be our main strategic focus?', sender: MessageSender.USER, senderId: 'user', timestamp: '2023-10-26T10:00:00Z' },
    { id: 'c1m2', text: 'Considering the long-term goals, we should prioritize brand trust over immediate conversions. This involves a more educational content approach.', sender: MessageSender.AGENT, senderId: 'claude', timestamp: '2023-10-26T10:01:00Z' },
    { id: 'c1m3', text: 'Good point. @chatgpt can you draft some content ideas around that?', sender: MessageSender.USER, senderId: 'user', timestamp: '2023-10-26T10:02:00Z' },
    { id: 'c1m4', text: "Here is a draft for the social media post: 'Unleash your creativity with our new product! ✨ Transform your workflow and achieve more. #Innovation #Productivity'", sender: MessageSender.AGENT, senderId: 'chatgpt', timestamp: '2023-10-26T10:03:00Z' },
  ],
  'chat-2': [
    { id: 'c2m1', text: 'I need to write a blog post about the future of AI. @chatgpt can you give me a starting point?', sender: MessageSender.USER, senderId: 'user', timestamp: '2023-10-25T14:00:00Z' },
    { id: 'c2m2', text: 'Of course. A good angle would be discussing the impact of multi-agent collaboration platforms. Here\'s an opening paragraph: "The paradigm of artificial intelligence is shifting from single, monolithic models to a dynamic ecosystem of specialized agents working in concert..."', sender: MessageSender.AGENT, senderId: 'chatgpt', timestamp: '2023-10-25T14:01:00Z' },
  ],
  'chat-3': [
    { id: 'c3m1', text: 'Can someone review this code for performance issues? @gemini', sender: MessageSender.USER, senderId: 'user', timestamp: '2023-10-24T11:00:00Z' },
    { id: 'c3m2', text: "I've analyzed the provided snippet and identified a performance bottleneck. Here is an optimized version of the function using a more efficient algorithm.", sender: MessageSender.AGENT, senderId: 'gemini', timestamp: '2023-10-24T11:01:30Z' },
    { id: 'c3m3', text: '@claude from an architectural standpoint, does this look sound?', sender: MessageSender.USER, senderId: 'user', timestamp: '2023-10-24T11:02:00Z' },
    { id: 'c3m4', text: "The proposed architecture is solid, but I would suggest implementing a message queue for decoupling the microservices to improve scalability and resilience.", sender: MessageSender.AGENT, senderId: 'claude', timestamp: '2023-10-24T11:03:00Z' },
  ]
};


export const WELCOME_QUOTE = "Orchestrate your brilliance.";