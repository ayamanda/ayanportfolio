import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section className="py-20 bg-gray-900 bg-opacity-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Get In Touch</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glassmorphism p-8 rounded-2xl">
              <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="mr-4 text-purple-500" />
                  <span>example@email.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-4 text-purple-500" />
                  <span>+1 (123) 456-7890</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-4 text-purple-500" />
                  <span>123 Main St, City, Country</span>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <form className="glassmorphism p-8 rounded-2xl">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                <input type="text" id="name" name="name" className="w-full p-3 rounded-lg bg-gray-800 bg-opacity-50 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Your Email</label>
                <input type="email" id="email" name="email" className="w-full p-3 rounded-lg bg-gray-800 bg-opacity-50 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Your Message</label>
                <textarea id="message" name="message" rows={4} className="w-full p-3 rounded-lg bg-gray-800 bg-opacity-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"></textarea>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;