import React from 'react';
import { ArrowRight, Lock, DollarSign, RefreshCw } from 'lucide-react';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const HowItWorks: React.FC = () => {
  const lendingSteps: Step[] = [
    {
      icon: <DollarSign className="w-8 h-8 text-brand-primary" />,
      title: "Deposit Assets",
      description: "Deposit your USDC or USDT to start earning interest from borrowers"
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-brand-primary" />,
      title: "Auto-Match",
      description: "Our algorithm automatically matches you with verified borrowers"
    },
    {
      icon: <ArrowRight className="w-8 h-8 text-brand-primary" />,
      title: "Earn Returns",
      description: "Receive competitive interest rates paid directly to your wallet"
    }
  ];

  const borrowingSteps: Step[] = [
    {
      icon: <Lock className="w-8 h-8 text-brand-primary" />,
      title: "Collateralize ETH",
      description: "Lock your ETH as collateral in our secure smart contract"
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-brand-primary" />,
      title: "Get Matched",  
      description: "Instantly matched with lenders offering the best rates"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-brand-primary" />,
      title: "Receive Funds",
      description: "Get USDC or USDT sent directly to your wallet within minutes"
    }
  ];

  const renderSteps = (steps: Step[]) => (
    <div className="space-y-8">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-6">
          <div className="flex-shrink-0 w-16 h-16 bg-bg-overlay border border-border-subtle flex items-center justify-center transition-all duration-[400ms] ease-in-out hover:scale-110 hover:bg-[rgba(0,255,209,0.1)] hover:border-brand-primary/50">
            {step.icon}
          </div>
          <div>
            <h4 className="heading-3 text-white mb-2 transition-colors duration-[400ms] ease-in-out hover:text-brand-primary">
              {step.title}
            </h4>
            <p className="body-medium text-text-secondary">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section id="how-it-works" className="dark-container py-32">
      <div className="dark-content-container">
        <div className="text-center mb-20">
          <h2 className="display-large text-white mb-6">How It Works</h2>
          <p className="body-large text-text-secondary max-w-2xl mx-auto">
            Simple, secure, and transparent lending and borrowing process
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Lending Process */}
          <div className="bg-bg-secondary p-12 border border-border-subtle transition-all duration-[400ms] ease-in-out hover:border-brand-primary/30 hover:shadow-[0_8px_32px_rgba(0,255,209,0.1)]">
            <h3 className="heading-1 text-white mb-8 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-brand-primary" />
              For Lenders
            </h3>
            {renderSteps(lendingSteps)}
          </div>

          {/* Borrowing Process */}
          <div className="bg-bg-secondary p-12 border border-border-subtle transition-all duration-[400ms] ease-in-out hover:border-brand-primary/30 hover:shadow-[0_8px_32px_rgba(0,255,209,0.1)]">
            <h3 className="heading-1 text-white mb-8 flex items-center gap-3">
              <Lock className="w-8 h-8 text-brand-primary" />
              For Borrowers
            </h3>
            {renderSteps(borrowingSteps)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;