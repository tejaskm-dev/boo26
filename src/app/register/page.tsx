import Closed from "@/components/register/Closed";
import Hub from "@/components/register/Hub";
import RegisterHeader from "@/components/register/RegisterHeader";
import { registrationMode } from "@/lib/register/mode";
import { registerMeta } from "@/lib/register/meta";
import { EVENT } from "@/lib/site";

export const metadata = registerMeta({
  title: `Register — ${EVENT.name} ${EVENT.year}`,
  description: `Register your team of two for ${EVENT.name} ${EVENT.year}: one of you starts the team, the other joins with the code. ${EVENT.dateLong}, ASIET Kalady.`,
});

export default function RegisterPage() {
  if (registrationMode() === "soon") return <Closed />;
  return (
    <>
      <RegisterHeader back={{ href: "/", label: `${EVENT.name} home` }} />
      <Hub />
    </>
  );
}
