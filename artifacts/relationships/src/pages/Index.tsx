import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Programs } from "@/components/Programs";
import { Leadership } from "@/components/Leadership";
import { Membership } from "@/components/Membership";
import { Welfare } from "@/components/Welfare";
import { Announcements } from "@/components/Announcements";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Programs />
        <Announcements />
        <Leadership />
        <Membership />
        <Welfare />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
