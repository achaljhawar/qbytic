import React from 'react';
import { HandCoins, Github, Twitter, Discord } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="dark-container py-16 border-t border-border-subtle">
      <div className="dark-content-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <HandCoins className="h-8 w-8 text-brand-primary" />
              <span className="text-2xl font-bold text-brand-primary">Qbytic</span>
            </div>
            <p className="body-medium text-text-secondary mb-6">
              Decentralized peer-to-peer crypto lending platform. 
              Lend and borrow cryptocurrency directly without intermediaries.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-text-muted hover:text-brand-primary transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="#" className="text-text-muted hover:text-brand-primary transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-text-muted hover:text-brand-primary transition-colors">
                <Discord className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="heading-3 text-white mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="body-medium text-text-secondary hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="body-medium text-text-secondary hover:text-white transition-colors">Benefits</a></li>
              <li><a href="#" className="body-medium text-text-secondary hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="body-medium text-text-secondary hover:text-white transition-colors">Supported Assets</a></li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="heading-3 text-white mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="body-medium text-text-secondary hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="body-medium text-text-secondary hover:text-white transition-colors">Team</a></li>
              <li><a href="#" className="body-medium text-text-secondary hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="body-medium text-text-secondary hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="heading-3 text-white mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="body-medium text-text-secondary hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="body-medium text-text-secondary hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="body-medium text-text-secondary hover:text-white transition-colors">Risk Disclosure</a></li>
              <li><a href="#" className="body-medium text-text-secondary hover:text-white transition-colors">Documentation</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center">
          <p className="body-small text-text-muted">
            © 2025 Qbytic. All rights reserved.
          </p>
          <p className="body-small text-text-muted mt-4 md:mt-0">
            Built with ❤️ for the DeFi community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;