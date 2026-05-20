const productLinks = ["Features", "Pricing", "API Docs", "Changelog"];
const companyLinks = ["About", "Blog", "Careers", "Contact"];
const legalLinks = ["Privacy Policy", "Terms of Use", "Cookie Policy", "GDPR"];
const trustBadges = ["SOC 2 Patent", "GDPR Ready", "256-bit SSL"];

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div className="md:col-span-1">
            <div className="flex items-center gap-1 mb-4">
              <span className="font-black text-xl text-white tracking-tight">
                RecruitBot
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-500 mb-3 inline-block" />
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              AI-powered CV screening that helps teams hire faster,
              fairer, and smarter — built for the modern recruiter.
            </p>

            <p className="text-gray-500 text-sm font-medium">
              Built By Trevor
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-5 tracking-wide">
              Product
            </h4>
            <ul className="flex flex-col gap-3">
              {productLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-5 tracking-wide">
              Company
            </h4>
            <ul className="flex flex-col gap-3">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-5 tracking-wide">
              Legal
            </h4>
            <ul className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-px bg-gray-800 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 RecruitBot. All rights reserved.
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            {trustBadges.map((badge) => (
              <span
                key={badge}
                className="bg-gray-800 text-gray-400 rounded-lg px-3 py-1.5 text-xs font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;