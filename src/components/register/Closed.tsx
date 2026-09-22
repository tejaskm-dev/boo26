import ComingSoon from "@/components/sections/ComingSoon";

/** Every page under /register, until registration is open: the coming-soon page. */
export default function Closed() {
  return (
    <main className="relative overflow-x-clip">
      <ComingSoon />
    </main>
  );
}
