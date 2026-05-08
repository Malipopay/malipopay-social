'use client';

// Malipopay Social icon mark. Sources the rebranded SVG from /public/postiz.svg
// (which was overwritten with malipopay-website-v2/public/logos/logo.svg during the
// brand swap). Keeping the export name "Logo" to avoid touching every call site.
export const Logo = () => {
  return (
    <img
      src="/postiz.svg"
      alt="Malipopay Social"
      width={60}
      height={60}
      className="mt-[8px] min-w-[60px] min-h-[60px]"
    />
  );
};
