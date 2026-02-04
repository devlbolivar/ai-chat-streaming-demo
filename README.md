# AI Chat Streaming Demo

A modern SaaS-style dashboard application built with Next.js 15 (App Router), Tailwind CSS v4, and TypeScript. This project demonstrates a premium "protected" layout typically found in enterprise AI chat applications.

## ⚡ Features

- **Next.js App Router**: Leveraging React Server Components and nested layouts.
- **Tailwind CSS v4**: Utilizing the new engine with CSS variable-based theme configuration.
- **Premium UI**: 
  - Dark mode first aesthetic.
  - Glassmorphism effects and sophisticated color palettes (`#0dccf2` primary).
  - Custom scrollbars as neon effects.
- **Responsive Layout**:
  - Collapsible sidebar.
  - Sticky header with detailed session info.
- **Streaming Chat Interface**:
  - Simulated active streaming UI state.
  - Leaky bucket algorithm visualization in chat content.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) & [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
- **Icons**: [Material Symbols](https://fonts.google.com/icons)

## 🚀 Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```

3.  **Open the application**:
    Visit [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 📂 Project Structure

```bash
src/
├── app/
│   ├── (dashboard)/      # Protected route group
│   │   ├── layout.tsx    # Dashboard shell (Sidebar + Header)
│   │   └── page.tsx      # Main chat interface
│   ├── globals.css       # Tailwind v4 theme & global styles
│   └── layout.tsx        # Root layout with font configuration
├── components/
│   └── dashboard/
│       ├── Header.tsx    # Top navigation bar
│       └── Sidebar.tsx   # Left navigation sidebar
```

## 🎨 Design System

The project uses a custom color palette defined in `src/app/globals.css`:

- **Primary**: Cyan (`#0dccf2`)
- **Background**: Deep Charcoal (`#101f22`)
- **Surface**: Dark Blue-Grey (`#16282c`)
- **Typography**: Inter (UI) and JetBrains Mono (Code)
