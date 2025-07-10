import Image from "next/image";

export default function Header() {
  return (
    <div className="flex flex-row items-center gap-1 w-full">
      <Image
        src="images/fs-logo-circle.svg"
        width={25}
        height={25}
        alt="logo"
      />

      <h1 className="text-xl font-header text-primary-500 tracking-tight">
        Flow Caster
      </h1>
    </div>
  );
}
