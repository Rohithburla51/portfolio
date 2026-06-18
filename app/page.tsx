import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { CodingProfiles } from "@/components/sections/coding-profiles";
import { GithubProjects } from "@/components/sections/github-projects";
import { Experience } from "@/components/sections/experience";
import { Certifications } from "@/components/sections/certifications";
import { Achievements } from "@/components/sections/achievements";
import { Blog } from "@/components/sections/blog";
import { Resume } from "@/components/sections/resume";
import { Contact } from "@/components/sections/contact";

export const revalidate = 3600; // ISR top-level

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <CodingProfiles />
      <GithubProjects />
      <Experience />
      <Achievements />
      <Certifications />
      <Blog />
      <Resume />
      <Contact />
    </>
  );
}
