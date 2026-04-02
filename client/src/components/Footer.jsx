import React from "react";
import { BsRobot, BsGithub, BsLinkedin, BsTwitter } from "react-icons/bs";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

        {/* Logo + About */}
        <div>
          <div className="flex items-center gap-2 text-white text-xl font-bold">
            <BsRobot />
            InterviewIQ.AI
          </div>
          <p className="mt-3 text-sm text-gray-400">
            AI-powered interview platform to help you practice, improve, and
            succeed in your career journey.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-green-400 cursor-pointer">Home</li>
            <li className="hover:text-green-400 cursor-pointer">Interviews</li>
            <li className="hover:text-green-400 cursor-pointer">History</li>
            <li className="hover:text-green-400 cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-white font-semibold mb-3">Features</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-green-400 cursor-pointer">AI Interviews</li>
            <li className="hover:text-green-400 cursor-pointer">Resume Analysis</li>
            <li className="hover:text-green-400 cursor-pointer">PDF Reports</li>
            <li className="hover:text-green-400 cursor-pointer">Analytics</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-white font-semibold mb-3">Connect</h3>
          <div className="flex gap-4 text-xl">
            <BsGithub className="cursor-pointer hover:text-green-400" />
            <BsLinkedin className="cursor-pointer hover:text-green-400" />
            <BsTwitter className="cursor-pointer hover:text-green-400" />
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 text-center text-sm py-4 text-gray-400">
        © {new Date().getFullYear()} InterviewIQ.AI. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;