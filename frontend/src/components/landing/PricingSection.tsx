import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    highlight: false,
    borderColor: "border-gray-200 dark:border-gray-700",
    btnClass: "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100",
    features: [
      "Up to 3 active jobs",
      "50 CV screenings/month",
      "Basic match scoring",
      "Skill breakdown report",
    ],
  },
  {
    name: "Pro",
    price: "Ksh 1,999",
    period: "per month",
    highlight: true,
    borderColor: "border-blue-600 dark:border-blue-500",
    btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
    features: [
      "Unlimited active jobs",
      "500 CV screenings/month",
      "Advanced AI scoring",
      "Detailed skill breakdown",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    highlight: false,
    borderColor: "border-gray-200 dark:border-gray-700",
    btnClass: "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100",
    features: [
      "Unlimited everything",
      "Custom AI fine-tuning",
      "ATS integration",
      "Dedicated account manager",
      "On-premise option",
    ],
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full px-4 py-2 text-sm font-semibold mb-4">
            💰 Pricing
          </div>
          <h2 className="font-black text-4xl text-gray-900 dark:text-white tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Start free. Scale when you're ready. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white dark:bg-gray-800 rounded-2xl border-2 ${plan.borderColor} p-8 flex flex-col gap-6 relative transition-all hover:shadow-lg ${
                plan.highlight
                  ? "shadow-xl shadow-blue-100 dark:shadow-blue-950"
                  : ""
              }`}
            >

              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold rounded-full px-4 py-1.5 whitespace-nowrap">
                   Most Popular
                </div>
              )}

              <div>
                <p className="font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </p>
                <p className="font-black text-4xl text-gray-900 dark:text-white tracking-tight">
                  {plan.price}
                </p>
                <p className="text-gray-400 text-sm mt-1">{plan.period}</p>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-700" />
              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <span className="text-green-500 font-bold shrink-0">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`${plan.btnClass} rounded-xl py-3 text-sm font-medium text-center transition-all`}
              >
                {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-sm mt-10">
          All plans include a 14-day free trial. No credit card required for Starter.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;