# AI Chat Streaming Demo

A modern AI chat application with real-time streaming responses, built with Next.js 16, Supabase, and the Vercel AI SDK. Features a premium SaaS-style dashboard UI with authentication, message persistence, and rate limiting.

## Architectural Decisions

- **Streaming**: Implemented using the `ReadableStream` API and the `AbortController` API to allow for cancellation of the stream
- **Authentication**: Secure email/password auth using Supabase Auth with RLS policies
- **Message Persistence**: Chat history stored in Supabase PostgreSQL with Row Level Security
- **Rate Limiting**: Daily message limits tracked per user with automatic reset at midnight UTC

## ⚡ Features

- **Real-time AI Streaming**: Live token-by-token response streaming using Groq's LLaMA 3.3 70B model
- **Stop Generation**: Cancel AI responses mid-stream with AbortController
- **Authentication**: Secure user auth with Supabase (email/password)
- **Message Persistence**: Chat history saved to Supabase PostgreSQL database
- **Rate Limiting**: 10 messages/day limit per user (configurable)
- **Chat Management**: Create new chats, switch between conversations
- **Premium UI**: 
  - Dark mode first aesthetic with glassmorphism effects
  - Custom neon-styled scrollbars and animations
  - Blinking cursor during streaming
- **Responsive Layout**: Collapsible sidebar with grouped chat history (Today/Yesterday/Previous)

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| **AI/LLM** | [Vercel AI SDK](https://sdk.vercel.ai/) + [Groq](https://groq.com/) (LLaMA 3.3 70B) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Fonts** | [Inter](https://fonts.google.com/specimen/Inter) & [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) |
| **Icons** | [Material Symbols](https://fonts.google.com/icons) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account ([supabase.com](https://supabase.com))
- Groq API key ([console.groq.com](https://console.groq.com))

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/devlbolivar/ai-chat-streaming-demo.git
   cd ai-chat-streaming-demo
   npm install
   ```

2. **Set up environment variables**:
   Create `.env.local` with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   ```

3. **Set up Supabase database**:
   Run the SQL from `supabase/schema.sql` in your Supabase SQL Editor to create the `chats`, `messages`, and `user_usage` tables with Row Level Security.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the application**:
   Visit [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected route group
│   │   ├── actions.ts        # Chat server actions (create/delete)
│   │   ├── layout.tsx        # Dashboard shell (Sidebar + Header)
│   │   └── page.tsx          # Main chat interface (server component)
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # AI streaming endpoint + rate limiting
│   ├── login/
│   │   ├── page.tsx          # Login/signup page
│   │   └── actions.ts        # Auth server actions
│   ├── globals.css           # Tailwind v4 theme & global styles
│   └── layout.tsx            # Root layout
├── components/
│   └── dashboard/
│       ├── ChatInterface.tsx # Client chat component with streaming
│       ├── Header.tsx        # Top navigation bar
│       └── Sidebar.tsx       # Left sidebar with chat history
├── utils/
│   └── supabase/
│       ├── client.ts         # Browser Supabase client
│       └── server.ts         # Server Supabase client
├── middleware.ts             # Auth middleware for protected routes
└── types.ts                  # TypeScript interfaces
```

## 🔐 Database Schema

```sql
-- Chats table
create table chats (
  id uuid primary key,
  user_id uuid references auth.users,
  title text,
  created_at timestamptz,
  updated_at timestamptz
);

-- Messages table  
create table messages (
  id uuid primary key,
  chat_id uuid references chats(id),
  role text check (role in ('user', 'assistant', 'system')),
  content text,
  created_at timestamptz
);

-- User usage table (rate limiting)
create table user_usage (
  id uuid primary key,
  user_id uuid references auth.users unique,
  message_count integer default 0,
  last_reset_at date default current_date,
  updated_at timestamptz
);
```

All tables have Row Level Security (RLS) enabled so users can only access their own data.

## ⚙️ Configuration

### Rate Limiting

Modify the daily message limit in `src/app/api/chat/route.ts`:

```typescript
const DAILY_MESSAGE_LIMIT = 10; // Change this value
```

## 📝 License

MIT
