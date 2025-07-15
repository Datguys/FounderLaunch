import { Button } from '@/components/ui/button';
import { Check, X, Star } from 'lucide-react';
import { useState } from 'react';
import { FAQSection } from '@/components/FAQSection';
import { getStripe } from '@/lib/stripe';

export default function UpgradePage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // TODO: Replace with your real Stripe price IDs
  const STRIPE_PRICES = {
    pro: {
      monthly: 'price_pro_monthly_id',
      annual: 'price_pro_annual_id',
    },
    ultra: {
      monthly: 'price_ultra_monthly_id',
      annual: 'price_ultra_annual_id',
    },
  };

  const handleStripeCheckout = async (plan: 'pro' | 'ultra', isAnnual: boolean) => {
    setLoadingPlan(plan);
    const stripe = await getStripe();
    const priceId = STRIPE_PRICES[plan][isAnnual ? 'annual' : 'monthly'];
    await stripe?.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: window.location.origin + '/dashboard?checkout=success',
      cancelUrl: window.location.href,
    });
    setLoadingPlan(null);
  };

  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for exploring startup ideas',
      price: { monthly: 0, annual: 0 },
      features: [
        '5 AI-generated ideas per month',
        'Basic market analysis',
        'Limited planning tools',
        'Community support',
      ],
      cta: 'Continue',
      variant: 'outline' as const,
    },
    {
      name: 'Pro',
      description: 'Best for serious entrepreneurs',
      price: { monthly: 29, annual: 22 },
      features: [
        '20 AI-generated ideas per month',
        'Full launch plans & roadmaps',
        'Advanced market research',
        'BOM & budget builder',
        'Export capabilities',
        'Priority support',
      ],
      cta: 'Start Pro Trial',
      variant: 'primary' as const,
      badge: 'Best Value',
      popular: true,
    },
    {
      name: 'Ultra',
      description: 'For teams and scaling startups',
      price: { monthly: 79, annual: 59 },
      features: [
        'Unlimited AI generations',
        'AI business agents',
        'Investor deck creation',
        'Team collaboration',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated support',
      ],
      cta: 'Upgrade to Ultra',
      variant: 'secondary' as const,
    },
  ];

  return (
    <section
      id="upgrade"
      className="landing-theme py-24 min-h-screen text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-4xl font-bold">Choose Your Plan</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-purple-200">
            Start free and scale as you grow. All plans include our core AI features.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 glass-card p-2 rounded-full">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !isAnnual
                  ? 'bg-primary text-primary-foreground shadow-glow-primary'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                isAnnual
                  ? 'bg-primary text-primary-foreground shadow-glow-primary'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Annual
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                -25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* All pricing cards use a more neutral dark background for consistency */}
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`glass-card p-8 rounded-2xl relative transition-all duration-300 bg-[#181024] ${
                plan.popular
                  ? 'border-primary/50 shadow-[0_0_60px_16px_rgba(139,92,246,0.5)] scale-105 glow-primary'
                  : 'hover:shadow-[0_0_40px_8px_rgba(139,92,246,0.3)] hover:scale-105'
              }`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-1 rounded-full text-sm font-medium text-white flex items-center gap-1 shadow-glow-primary">
                    <Star className="w-3 h-3" />
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-2 text-white">{plan.name}</h3>
                <p className="text-purple-200 text-sm mb-4">{plan.description}</p>

                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-purple-300">/month</span>
                </div>

                {isAnnual && plan.price.monthly > 0 && (
                  <p className="text-sm text-green-400 mt-2">
                    Save ${(plan.price.monthly - plan.price.annual) * 12}/year
                  </p>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-purple-200">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {/* CTA Button: Free plan routes to login, paid plans use Stripe */}
              {plan.name === 'Basic' ? (
                <Button
                  variant={plan.variant}
                  className={`w-full text-lg font-semibold py-3 ${plan.popular ? 'glow-primary' : 'hover:glow-primary'}`}
                  size="lg"
                  onClick={() => window.location.href = '/login'}
                >
                  {plan.cta}
                </Button>
              ) : (
                <Button
                  variant={plan.variant}
                  className={`w-full text-lg font-semibold py-3 ${plan.popular ? 'glow-primary' : 'hover:glow-primary'}`}
                  size="lg"
                  disabled={loadingPlan === plan.name.toLowerCase()}
                  onClick={() => handleStripeCheckout(plan.name.toLowerCase() as 'pro' | 'ultra', isAnnual)}
                >
                  {loadingPlan === plan.name.toLowerCase() ? 'Redirecting…' : plan.cta}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-5xl mx-auto mt-20 mb-20">
          <div className="glass-card rounded-2xl overflow-hidden shadow-lg bg-[#181024]">
            <h3 className="text-2xl font-semibold text-center py-6 text-white bg-[#181024] border-b border-border">Compare Plans</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-purple-100">
                <thead className="bg-[#181024] border-b border-border">
                  <tr>
                    <th className="py-4 px-6 font-bold">Feature</th>
                    <th className="py-4 px-6 font-bold">Basic</th>
                    <th className="py-4 px-6 font-bold">Pro</th>
                    <th className="py-4 px-6 font-bold">Ultra</th>
                  </tr>
                </thead>
                <tbody className="bg-[#181024] divide-y divide-border">
                  {[{
                    feature: 'AI-generated ideas per month',
                    values: ['5', '20', 'Unlimited']
                  },
                  {
                    feature: 'Market analysis',
                    values: ['Basic', 'Advanced', 'Advanced + Custom']
                  },
                  {
                    feature: 'Planning tools',
                    values: ['Limited', 'Full', 'Full + Team']
                  },
                  {
                    feature: 'Export capabilities',
                    values: [false, true, true]
                  },
                  {
                    feature: 'Support',
                    values: ['Community', 'Priority', 'Dedicated']
                  },
                  {
                    feature: 'Team collaboration',
                    values: [false, false, true]
                  },
                  {
                    feature: 'Custom integrations',
                    values: [false, false, true]
                  },
                  {
                    feature: 'AI business agents',
                    values: [false, false, true]
                  },
                  {
                    feature: 'Investor deck creation',
                    values: [false, false, true]
                  },
                  {
                    feature: 'Advanced analytics',
                    values: [false, false, true]
                  },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 px-6">{row.feature}</td>
                      {row.values.map((value, j) => (
                        <td key={j} className="py-3 px-6">
                          {typeof value === 'boolean' ? (value ? <Check className="w-5 h-5 text-green-400 inline" /> : <X className="w-5 h-5 text-red-400 inline" />) : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="text-center mt-16">
          <div className="glass-card p-8 rounded-2xl max-w-2xl mx-auto bg-[#181024]">
            <h3 className="text-xl font-semibold mb-2 text-white">Need a custom solution?</h3>
            <p className="text-purple-200 mb-6">
              Enterprise plans with custom AI models, dedicated infrastructure, and white-label options.
            </p>
            <Button variant="outline" className="text-white border-purple-400 hover:bg-purple-800/40">
              Contact Enterprise Sales
            </Button>
          </div>
        </div>

        {/* FAQ Section - styled like landing page */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Import and render the FAQSection */}
            {/* @ts-ignore: FAQSection is default export */}
            <FAQSection />
          </div>
        </div>
      </div>
    </section>
  );
}
