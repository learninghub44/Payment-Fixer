import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Programs } from "@/components/Programs";
import { Leadership } from "@/components/Leadership";
import { Announcements } from "@/components/Announcements";
import { Membership } from "@/components/Membership";
import { Welfare } from "@/components/Welfare";
import { EventsTeaser } from "@/components/EventsTeaser";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Programs />
      <Leadership />
      <Announcements />
      <Membership />
      <Welfare />
      <EventsTeaser />
      <Contact />
      <Footer />
    </div>
  );
}
