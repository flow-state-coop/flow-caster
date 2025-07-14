import Image from "next/image";

export default function Header() {
  return (
    <div className="flex flex-row items-center gap-1 w-full mb-1">
      <Image
        src="/images/fs-logo-circle-black.svg"
        width={30}
        height={30}
        alt="logo"
      />

      <h1 className="text-xl font-header text-black tracking-tight">
        Flow Caster
      </h1>
    </div>
  );
}
