'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, RotateCcw, Paperclip, FileText, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  sender_type: 'partner' | 'admin';
  message: string;
  created_at: string;
  attachment_url?: string;
  attachment_type?: string;
}

// Allowed file types and max size (must match Supabase bucket settings)
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB - synced with Supabase bucket

interface ChatWidgetProps {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
}

// Polling interval in milliseconds (3 seconds)
const POLL_INTERVAL = 3000;

export function ChatWidget({ partnerId, partnerName, partnerEmail }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize supabase client
  const supabase = useMemo(() => createClient(), []);

  // Function to check for new messages (polling)
  const checkForNewMessages = useCallback(async () => {
    if (!partnerId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error polling messages:', fetchError);
        return;
      }

      if (data && data.length > 0) {
        const latestId = data[data.length - 1].id;
        // Only update if there are new messages
        if (latestId !== lastMessageIdRef.current) {
          setMessages(data);
          lastMessageIdRef.current = latestId;
        }
      }
    } catch (err) {
      console.error('Error polling messages:', err);
    }
  }, [partnerId, supabase]);

  // Load messages on open and start polling
  useEffect(() => {
    if (isOpen && partnerId) {
      loadMessages();

      // Start polling for new messages
      const pollInterval = setInterval(checkForNewMessages, POLL_INTERVAL);

      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [isOpen, partnerId, checkForNewMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error loading messages:', fetchError);
        setError('Nepodařilo se načíst zprávy');
      } else if (data) {
        setMessages(data);
        if (data.length > 0) {
          lastMessageIdRef.current = data[data.length - 1].id;
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Nepodařilo se načíst zprávy');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || isSending) return;

    setIsSending(true);
    setError(null);
    const messageText = newMessage.trim();
    const fileToUpload = selectedFile;
    setNewMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Optimistic update - show message immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      sender_type: 'partner',
      message: messageText || (fileToUpload ? `📎 ${fileToUpload.name}` : ''),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // Upload file if selected
      let attachmentData: { url: string; type: string } | null = null;
      if (fileToUpload) {
        setIsUploading(true);
        attachmentData = await uploadFile(fileToUpload);
        setIsUploading(false);

        if (!attachmentData) {
          setError('Nepodařilo se nahrát soubor');
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          setIsSending(false);
          return;
        }
      }

      // Insert message to Supabase
      const { data, error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          partner_id: partnerId,
          sender_type: 'partner',
          message: messageText || (fileToUpload ? `📎 ${fileToUpload.name}` : ''),
          attachment_url: attachmentData?.url || null,
          attachment_type: attachmentData?.type || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error sending message:', insertError);
        setError('Nepodařilo se odeslat zprávu');
        setNewMessage(messageText); // Restore message
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else if (data) {
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? data : m))
        );
        // Send Telegram notification (don't wait for it)
        fetch('/api/partner/chat-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerId,
            partnerName,
            partnerEmail,
            message: messageText,
            attachmentUrl: attachmentData?.url,
            attachmentType: attachmentData?.type,
          }),
        }).catch(console.error);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Nepodařilo se odeslat zprávu');
      setNewMessage(messageText); // Restore message
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Get file extension for Android Chrome MIME type bug workaround
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type.toLowerCase();

    // Android Chrome bug workaround - check extension if MIME is empty or non-standard
    const isValidType = ALLOWED_TYPES.includes(mimeType) ||
                        (mimeType === '' && ALLOWED_EXTENSIONS.includes(extension)) ||
                        (mimeType === 'image/jpg' && ALLOWED_EXTENSIONS.includes(extension));

    if (!isValidType) {
      console.error('[ChatWidget] Invalid file type:', { mimeType, extension, fileName: file.name });
      setError(`Nepovolený typ souboru. Povolené: JPG, PNG, GIF, WebP, PDF`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      console.error('[ChatWidget] File too large:', { size: file.size, sizeMB, fileName: file.name });
      setError(`Soubor je příliš velký (${sizeMB}MB). Maximum je 20MB.`);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; type: string } | null> => {
    // Verify session is still active before upload
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('[ChatWidget] No active session for upload');
      setError('Vaše session vypršela. Prosím, obnovte stránku a přihlaste se znovu.');
      return null;
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${partnerId}/${fileName}`;

    console.log('[ChatWidget] Uploading file:', { fileName, filePath, fileType: file.type, fileSize: file.size });

    try {
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) {
        console.error('[ChatWidget] Upload error:', uploadError);
        // Show specific error to user with more details
        let errorMsg = uploadError.message || 'Neznámá chyba při nahrávání';
        if (errorMsg.includes('Payload too large')) {
          errorMsg = 'Soubor je příliš velký pro server';
        } else if (errorMsg.includes('Invalid')) {
          errorMsg = 'Neplatný formát souboru';
        }
        setError(`Upload selhal: ${errorMsg}`);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      console.log('[ChatWidget] Upload successful:', publicUrl);

      // Determine type based on extension if MIME is unreliable
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '');

      return {
        url: publicUrl,
        type: isImage ? 'image' : 'pdf'
      };
    } catch (err) {
      console.error('[ChatWidget] Upload exception:', err);
      setError('Chyba sítě při nahrávání. Zkuste znovu.');
      return null;
    }
  };

  const clearChatHistory = async () => {
    if (!confirm('Opravdu chcete smazat historii chatu? Tuto akci nelze vrátit.')) {
      return;
    }

    setIsClearing(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('partner_id', partnerId);

      if (deleteError) {
        console.error('Error clearing chat:', deleteError);
        setError('Nepodařilo se smazat historii');
      } else {
        setMessages([]);
        lastMessageIdRef.current = null;
      }
    } catch (err) {
      console.error('Error clearing chat:', err);
      setError('Nepodařilo se smazat historii');
    } finally {
      setIsClearing(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 bg-[#f5a623] hover:bg-[#e09000] text-black p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        title="Podpora"
        aria-label={isOpen ? 'Zavřít chat' : 'Otevřít chat'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="bg-[#f5a623] text-black px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="font-bold">Podpora TaxiNearMe</h3>
              <p className="text-xs opacity-80">Odpovíme co nejdříve</p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChatHistory}
                disabled={isClearing}
                className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                title="Nový chat - smazat historii"
                aria-label="Nový chat"
              >
                {isClearing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-4 py-2 border-b border-red-100">
              {error}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px] bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>Začněte konverzaci</p>
                <p className="text-xs mt-1">Napište nám a odpovíme</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'partner' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg ${
                      msg.sender_type === 'partner'
                        ? 'bg-[#f5a623] text-black'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    {/* Attachment preview */}
                    {msg.attachment_url && (
                      <div className="mb-2">
                        {msg.attachment_type === 'image' ? (
                          <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={msg.attachment_url}
                              alt="Příloha"
                              className="max-w-full max-h-40 rounded cursor-pointer hover:opacity-90"
                            />
                          </a>
                        ) : (
                          <a
                            href={msg.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm underline hover:no-underline"
                          >
                            <FileText className="h-4 w-4" />
                            Zobrazit PDF
                          </a>
                        )}
                      </div>
                    )}
                    {msg.message && <p className="text-sm whitespace-pre-wrap">{msg.message}</p>}
                    <p className={`text-xs mt-1 ${msg.sender_type === 'partner' ? 'text-black/60' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Selected file preview */}
          {selectedFile && (
            <div className="px-3 py-2 bg-gray-100 border-t border-gray-200 flex items-center gap-2">
              {selectedFile.type.startsWith('image/') ? (
                <ImageIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <FileText className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-xs text-gray-600 truncate flex-1">{selectedFile.name}</span>
              <button
                type="button"
                onClick={removeSelectedFile}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Odstranit soubor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              {/* Attachment button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending || isUploading}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50 p-2 rounded-lg transition-colors"
                title="Přidat přílohu (max 20MB)"
                aria-label="Přidat přílohu"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Napsat zprávu..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a623] focus:border-transparent"
                disabled={isSending || isUploading}
              />
              <button
                type="submit"
                disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading}
                className="bg-[#f5a623] hover:bg-[#e09000] disabled:opacity-50 disabled:cursor-not-allowed text-black p-2 rounded-lg transition-colors"
                aria-label="Odeslat zprávu"
              >
                {isSending || isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
