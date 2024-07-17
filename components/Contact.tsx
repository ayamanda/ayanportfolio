import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from "framer-motion";
import { Loader2, Send, User, Mail, MessageSquare, Star, Heart, Zap, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { getDatabase, ref, push, serverTimestamp } from 'firebase/database';
import { app } from '@/firebase'; // Ensure this path is correct
import { Button } from '@/components/ui/button';
import { Toast } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"

const FloatingElement: React.FC<{ delay: number }> = ({ delay }) => {
  const controls = useAnimation();
  const icons = [Star, Heart, Zap, Sparkles];
  const Icon = icons[Math.floor(Math.random() * icons.length)];
  const colors = ['text-yellow-200', 'text-pink-200', 'text-blue-200', 'text-green-200'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  useEffect(() => {
    controls.start({
      y: ['0%', '100%'],
      x: ['-10%', '10%'],
      rotate: [0, 360],
      opacity: [0, 1, 0],
      transition: {
        duration: Math.random() * 10 + 10,
        ease: "easeInOut",
        repeat: Infinity,
        delay: delay
      }
    });
  }, [controls, delay]);

  return (
    <motion.div
      className={`absolute ${color}`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `-${Math.random() * 20}%`
      }}
      animate={controls}
    >
      <Icon size={Math.random() * 20 + 10} />
    </motion.div>
  );
};

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude},${position.coords.longitude}`);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    // Get user's IP address
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => setIpAddress(data.ip))
      .catch(error => console.error("Error fetching IP:", error));
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
        location,
        ipAddress,
        timestamp: serverTimestamp()
      });

      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon!",
        duration: 5000,
        className: "bg-gray-800 text-white border-gray-700",
      });

      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
        duration: 5000,
        className: "bg-red-900 text-white border-red-700",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 px-4 bg-gray-900  min-h-screen flex items-center justify-center overflow-hidden relative">
      {[...Array(40)].map((_, i) => (
        <FloatingElement key={i} delay={i * 0.2} />
      ))}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
          <div className="p-8 space-y-6">
            <h2 className="text-3xl font-bold text-center text-white mb-2">Get in Touch</h2>
            <p className="text-center text-white/80 mb-6">We&apos;d love to hear from you. Send us a message!</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="pl-10 w-full bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-white focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  required
                  className="pl-10 w-full bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-white focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-white/60" size={18} />
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your Message"
                  required
                  className="pl-10 w-full bg-white/5 border-white/10 text-white placeholder-white/50 focus:border-white focus:ring-2 focus:ring-white/50"
                  rows={4}
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
      <Toaster />
    </section>
  );
};

export default Contact;