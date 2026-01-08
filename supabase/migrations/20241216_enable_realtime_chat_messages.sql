-- Enable Realtime for chat_messages table
-- This allows the ChatWidget to receive new messages in real-time

-- Add chat_messages to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Enable replica identity full for better realtime updates
ALTER TABLE chat_messages REPLICA IDENTITY FULL;
