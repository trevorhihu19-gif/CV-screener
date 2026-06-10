import LandingNavbar from "../components/landing/landingNavbar.tsx";
import HeroSection from "../components/landing/HeroSection.tsx";
import FeaturesSection from "../components/landing/FeaturesSection.tsx";
import AboutSection from "../components/landing/AboutSection.tsx";
import PricingSection from "../components/landing/PricingSection.tsx";
import CTASection from "../components/landing/CTASection.tsx";
import Footer from "../components/landing/FooterSection.tsx";

const HomePage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <LandingNavbar />
            <HeroSection />
            <FeaturesSection />
            <AboutSection />
            <PricingSection />
            <CTASection />
            <Footer />
        </div>
    )
};

export default HomePage;