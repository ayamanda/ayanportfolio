import React from 'react';
import { Send } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  autoResizeTextarea: () => void;
}

export function ChatInput({
  input,
  setInput,
  isLoading,
  handleSubmit,
  handleKeyDown,
  inputRef,
  autoResizeTextarea
}: ChatInputProps) {
  return (
    <div className="border-t border-gray-800 p-4 bg-gray-900/95 backdrop-blur-sm">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResizeTextarea();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            className="w-full bg-gray-800 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none border border-gray-700/50"
            style={{ maxHeight: '120px' }}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 p-2 rounded-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1.5 text-center">
          Responses are AI-generated and may not be perfect.
        </p>
      </form>
    </div>
  );
}