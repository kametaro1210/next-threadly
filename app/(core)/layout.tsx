
import { Navbar } from "@/components/layout/navbar";


export default async function CoreGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="mx-auto flex max-w-[1200px] gap-8 px-4 pb-16 pt-2">
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}