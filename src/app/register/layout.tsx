import RegisterMotion from "@/components/register/RegisterMotion";

/**
 * Every page under /register shares the one motion pass that reads their data
 * attributes (src/components/register/RegisterMotion.tsx). It draws nothing
 * of its own.
 */
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RegisterMotion />
    </>
  );
}
