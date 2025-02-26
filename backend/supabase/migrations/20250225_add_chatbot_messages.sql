-- Create chatbot_messages table
CREATE TABLE IF NOT EXISTS public.chatbot_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES public.partners(partner_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_user BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_partner_id ON public.chatbot_messages(partner_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_created_at ON public.chatbot_messages(created_at);

-- Add RLS policies
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select their own chatbot messages
CREATE POLICY select_own_chatbot_messages ON public.chatbot_messages
  FOR SELECT USING (
    partner_id IN (
      SELECT partner_id FROM public.partners WHERE user_id = auth.uid()
    )
  );

-- Policy to allow users to insert their own chatbot messages
CREATE POLICY insert_own_chatbot_messages ON public.chatbot_messages
  FOR INSERT WITH CHECK (
    partner_id IN (
      SELECT partner_id FROM public.partners WHERE user_id = auth.uid()
    )
  );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT ON public.chatbot_messages TO authenticated;