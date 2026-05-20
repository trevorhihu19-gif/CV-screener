import LandingNavbar from "../components/landing/landingNavbar.tsx";
import HeroSection from "../components/landing/HeroSection.tsx";

const HomePage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <LandingNavbar />
            <HeroSection />
        </div>
    )
};

export default HomePage;