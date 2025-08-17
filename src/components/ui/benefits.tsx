import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, Users, Lock, Globe, DollarSign } from 'lucide-react';

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

const Benefits: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState([
    { value: '0', label: 'Uptime' },
    { value: '0', label: 'Avg. Match Time' },
    { value: '0', label: 'Security Incidents' },
    { value: '0', label: 'Support' }
  ]);
  const sectionRef = useRef<HTMLElement>(null);

  const benefits: Benefit[] = [
    {
      icon: <Users className="w-12 h-12 text-brand-primary transition-all duration-[400ms] ease-in-out group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(0,255,209,0.8)]" />,
      title: "Fully Decentralized",
      description: "No central authority controls your funds. Pure peer-to-peer lending powered by smart contracts."
    },
    {
      icon: <Shield className="w-12 h-12 text-brand-primary transition-all duration-[400ms] ease-in-out group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(0,255,209,0.8)]" />,
      title: "No KYC Required",
      description: "Start lending and borrowing instantly without identity verification or lengthy approval processes."
    },
    {
      icon: <Zap className="w-12 h-12 text-brand-primary transition-all duration-[400ms] ease-in-out group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(0,255,209,0.8)]" />,
      title: "Instant Approval",
      description: "Get matched with lenders or borrowers within seconds. No waiting, no manual reviews."
    },
    {
      icon: <Lock className="w-12 h-12 text-brand-primary transition-all duration-[400ms] ease-in-out group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(0,255,209,0.8)]" />,
      title: "Secure Smart Contracts",
      description: "Audited smart contracts ensure your collateral is safe and transactions are trustless."
    },
    {
      icon: <Globe className="w-12 h-12 text-brand-primary transition-all duration-[400ms] ease-in-out group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(0,255,209,0.8)]" />,
      title: "Global Access",
      description: "Access liquidity from anywhere in the world, 24/7. No geographical restrictions."
    },
    {
      icon: <DollarSign className="w-12 h-12 text-brand-primary transition-all duration-[400ms] ease-in-out group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(0,255,209,0.8)]" />,
      title: "Competitive Rates",
      description: "Market-driven interest rates ensure both lenders and borrowers get the best deals."
    }
  ];

  const stats: Stat[] = [
    { value: "99.9%", label: "Uptime" },
    { value: "<30s", label: "Avg. Match Time" },
    { value: "0", label: "Security Incidents" },
    { value: "24/7", label: "Support" }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          // Animate stats when they come into view
          setTimeout(() => {
            setAnimatedStats(stats);
          }, 500);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <section ref={sectionRef} id="benefits" className="dark-container py-32">
      <div className="dark-content-container">
        <div className="text-center mb-20">
          <h2 className="display-large text-white mb-6">Why Choose Qbytic</h2>
          <p className="body-large text-text-secondary max-w-2xl mx-auto">
            Experience the future of decentralized finance with our key advantages
          </p>
        </div>

        <div className="dark-grid">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="group bg-bg-secondary p-8 border border-border-subtle transition-all duration-[400ms] ease-in-out hover:-translate-y-2 hover:shadow-[0_8px_32px_rgba(0,255,209,0.2)] hover:border-brand-primary/50"
              style={{ 
                animationDelay: `${index * 100}ms`,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                opacity: isVisible ? 1 : 0,
                transition: `all 0.6s ease-out ${index * 100}ms`
              }}
            >
              <div className="space-y-6">
                <div className="w-20 h-20 bg-bg-overlay border border-border-subtle flex items-center justify-center transition-all duration-[400ms] ease-in-out group-hover:bg-[rgba(0,255,209,0.1)] group-hover:border-brand-primary/50 group-hover:scale-110">
                  {benefit.icon}
                </div>
                
                <div>
                  <h3 className="heading-2 text-white mb-4 transition-all duration-[400ms] ease-in-out group-hover:text-brand-primary">
                    {benefit.title}
                  </h3>
                  <p className="body-medium text-text-secondary leading-relaxed transition-colors duration-[400ms] ease-in-out group-hover:text-white">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-bg-secondary p-12 border border-border-subtle transition-all duration-[400ms] ease-in-out hover:border-brand-primary/30 hover:shadow-[0_8px_32px_rgba(0,255,209,0.1)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {animatedStats.map((stat, index) => (
              <div 
                key={index}
                className="group transition-all duration-[400ms] ease-in-out hover:scale-105"
              >
                <div className="display-medium text-brand-primary mb-2 transition-all duration-[400ms] ease-in-out group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(0,255,209,0.8)]">
                  {stat.value}
                </div>
                <div className="body-small text-text-muted transition-colors duration-[400ms] ease-in-out group-hover:text-white">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;