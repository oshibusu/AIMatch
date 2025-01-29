# AIMatch Backend

This directory contains the backend services for AIMatch, implemented using Supabase Edge Functions.

## Structure

```
backend/
├── supabase/
│   ├── config.toml          # Supabase configuration
│   └── functions/
│       └── generate-messages/  # Message generation Edge Function
│           ├── index.ts        # Main function code
│           ├── deno.jsonc      # Deno configuration
│           └── types.d.ts      # TypeScript declarations
```

## Edge Functions

### generate-messages

This function generates message suggestions for chat conversations using OpenAI's GPT-4 model.

#### Setup

1. Install Supabase CLI if not already installed:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Set the required environment variables:
```bash
supabase secrets set OPENAI_API_KEY=your-api-key
```

#### Deployment

Deploy the function to Supabase:
```bash
supabase functions deploy generate-messages
```

#### Local Development

1. Start the function locally:
```bash
supabase start
cd backend/supabase/functions/generate-messages
deno task serve
```

2. Test the function:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-messages' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "tone": {
      "formalityLevel": 1,
      "friendlinessLevel": 3,
      "humorLevel": 2
    }
  }'
```

## API Reference

### POST /functions/v1/generate-messages

Generates message suggestions based on the provided parameters.

#### Request Body

```typescript
{
  images?: string[];  // Optional image URLs
  tone: {
    formalityLevel: number;   // 1: frank, 2: normal, 3: formal
    friendlinessLevel: number;  // 1: low, 2: medium, 3: high
    humorLevel: number;   // 1: low, 2: medium, 3: high
  }
}
```

#### Response

```typescript
{
  messages: string[]  // Array of generated message suggestions
}
```

#### Error Response

```typescript
{
  error: string  // Error message
}