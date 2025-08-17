import React from 'react';
import { Button } from './button';
import { ArrowRight, Wallet, UserPlus, TrendingUp } from 'lucide-react';

interface TrustIndicator {
  label: string;
}

const CTA: React.FC = () => {
  const trustIndicators: TrustIndicator[] = [
    { label: "Audited Smart Contracts" },
    { label: "Open Source Protocol" },
    { label: "Non-Custodial" }
  ];

  const handleConnectWallet = (): void => {
    // This will be handled by RainbowKit ConnectButton
    console.log('Connect Wallet clicked');
  };

  const handleStartLending = (): void => {
    // Navigate to lending interface
    console.log('Start Lending clicked');
  };

  const handleJoinWaitlist = (): void => {
    // Navigate to waitlist signup
    console.log('Join Waitlist clicked');
  };

  return (
    <section className="dark-container py-32">
      <div className="dark-content-container">
        <div className="bg-bg-secondary p-16 border border-border-subtle text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="display-large text-white">
              Ready to Start Your 
              <span className="text-brand-primary"> Crypto Journey</span>?
            </h2>
            <p className="body-large text-text-secondary">
              Join thousands of users already earning and borrowing on our decentralized platform. 
              No fees to get started, no minimum deposits required.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button 
                variant="primary"
                size="lg"
                onClick={handleConnectWallet}
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                variant="secondary"
                size="lg"
                onClick={handleStartLending}
              >
                <TrendingUp className="w-5 h-5" />
                Start Lending
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                variant="secondary"
                size="lg"
                onClick={handleJoinWaitlist}
              >
                <UserPlus className="w-5 h-5" />
                Join Waitlist
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-12 border-t border-border-subtle">
              <p className="body-small text-text-muted mb-6">Trusted by the community</p>
              <div className="flex justify-center items-center gap-8 flex-wrap">
                {trustIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-text-secondary text-sm">{indicator.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;