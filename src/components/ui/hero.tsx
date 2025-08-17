import React from 'react';
import { Button } from './button';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Hero: React.FC = () => {
  return (
    <section className="dark-container min-h-screen flex items-center">
      <div className="dark-content-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="display-huge text-white leading-tight">
                Lend & Borrow 
                <span className="text-brand-primary"> Crypto</span> 
                <br />Without Limits
              </h1>
              <p className="body-large text-text-secondary max-w-lg">
                Connect directly with other users to lend or borrow cryptocurrency. 
                No banks, no middlemen, just peer-to-peer finance.
              </p>
            </div>

            {/* Key Benefits Pills */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Shield, text: 'No KYC' },
                { icon: Zap, text: 'Instant Approval' },
                { icon: Users, text: 'Decentralized' }
              ].map((pill, index) => (
                <div 
                  key={pill.text}
                  className="group flex items-center gap-2 bg-bg-overlay rounded-full px-4 py-2 transition-all duration-[400ms] ease-in-out hover:bg-[rgba(0,255,209,0.1)] hover:scale-105 hover:shadow-[0_4px_20px_rgba(0,255,209,0.2)] cursor-pointer"
                  style={{ animationDelay: `${index * 100 + 600}ms` }}
                >
                  <pill.icon className="w-4 h-4 text-brand-primary transition-all duration-[400ms] ease-in-out group-hover:scale-110 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(0,255,209,0.8)]" />
                  <span className="text-sm text-white transition-all duration-[400ms] ease-in-out group-hover:text-[#00FFD1]">
                    {pill.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated');

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button 
                              variant="secondary"
                              size="xl"
                              onClick={openConnectModal}
                              className="group transition-all duration-[400ms] ease-in-out hover:scale-105 focus:scale-105"
                            >
                              Connect Wallet
                              <ArrowRight className="w-5 h-5 transition-transform duration-[400ms] ease-in-out group-hover:translate-x-1" />
                            </Button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <Button 
                              variant="secondary"
                              size="xl"
                              onClick={openChainModal}
                            >
                              Wrong network
                            </Button>
                          );
                        }

                        return (
                          <Button 
                            variant="secondary"
                            size="xl"
                            onClick={openAccountModal}
                            className="group transition-all duration-[400ms] ease-in-out hover:scale-105 focus:scale-105"
                          >
                            {account.displayName}
                            <ArrowRight className="w-5 h-5 transition-transform duration-[400ms] ease-in-out group-hover:translate-x-1" />
                          </Button>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
              
              <Button 
                variant="secondary" 
                size="xl"
                className="group transition-all duration-[400ms] ease-in-out hover:scale-105 focus:scale-105"
              >
                Browse Loans
                <ArrowRight className="w-5 h-5 transition-transform duration-[400ms] ease-in-out group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border-subtle">
              {[
                { value: '$50M+', label: 'Total Volume' },
                { value: '10K+', label: 'Active Users' },
                { value: '24/7', label: 'Availability' }
              ].map((stat, index) => (
                <div 
                  key={stat.label}
                  className="group cursor-default transition-all duration-[400ms] ease-in-out hover:scale-105"
                  style={{ animationDelay: `${index * 200 + 1000}ms` }}
                >
                  <div className="heading-2 text-brand-primary transition-all duration-[400ms] ease-in-out group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(0,255,209,0.8)]">
                    {stat.value}
                  </div>
                  <div className="body-small text-text-muted transition-colors duration-[400ms] ease-in-out group-hover:text-white">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - 3D Placeholder */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-[500px] h-[500px] lg:w-[600px] lg:h-[600px] bg-bg-overlay border border-border-subtle flex items-center justify-center rounded-lg">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-brand-primary/20 rounded-full flex items-center justify-center">
                  <Zap className="w-12 h-12 text-brand-primary" />
                </div>
                <p className="text-text-secondary">3D Visualization Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;