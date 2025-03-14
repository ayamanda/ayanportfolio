import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Loader2, Send, User, Mail, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { getDatabase, ref, push, serverTimestamp } from 'firebase/database';
import { app } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/toaster";

// Background particle element
const BackgroundParticle: React.FC<{ 
  delay: number, 
  size: number,
  color: string 
}> = ({ delay, size, color }) => {
  return (
    <motion.div
      className={`absolute ${color}`}
      style={{ 
        left: `${Math.random() * 100}%`,
        top: `-${Math.random() * 10}%`,
        width: size,
        height: size,
        borderRadius: '50%'
      }}
      animate={{
        y: ['0vh', '100vh'],
        x: ['-5%', '5%'],
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: Math.random() * 5 + 10,
        ease: "linear",
        repeat: Infinity,
        delay: delay
      }}
    />
  );
};

// Gradient text component similar to Home component
const GradientText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400">
    {children}
  </span>
);

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Generate particles with different colors
  const particles = React.useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const colors = [
        'bg-purple-500/20', 
        'bg-indigo-500/20', 
        'bg-blue-500/20', 
        'bg-pink-500/20'
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 10 + 5;
      return { id: i, delay: i * 0.2, size, color };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const db = getDatabase(app);
      const messagesRef = ref(db, 'messages');
      
      await push(messagesRef, {
        name,
        email,
        message,
        timestamp: serverTimestamp()
      });

      toast({
        title: "Message Sent Successfully",
        description: "Thank you for reaching out! We'll respond to your message soon.",
        className: "bg-gradient-to-r from-purple-900/90 to-indigo-900/90 text-white border border-purple-500/30",
      });

      // Reset form
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Message Failed to Send",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
        className: "bg-red-900/90 text-white border border-red-500/30",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 px-4 min-h-screen flex items-center justify-center overflow-hidden relative bg-gray-900">
      {/* Background particles */}
      {particles.map(particle => (
        <BackgroundParticle 
          key={particle.id} 
          delay={particle.delay} 
          size={particle.size}
          color={particle.color}
        />
      ))}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 space-y-6">
            <h2 className="text-3xl font-bold text-center mb-2">
              <GradientText>Get in Touch</GradientText>
            </h2>
            <p className="text-center text-gray-300 mb-6">
              We would love to hear from you. Send us a message!
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" size={18} />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="pl-10 w-full bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" size={18} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  required
                  className="pl-10 w-full bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              
              <div className="relative group">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 group-focus-within:text-purple-400 transition-colors" size={18} />
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your Message"
                  required
                  className="pl-10 w-full bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  rows={4}
                />
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
            
            <Toaster />
          </div>
        </div>
      </motion.div>
    </section>
  );
} 
export default Contact;