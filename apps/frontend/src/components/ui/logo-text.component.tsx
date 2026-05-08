import React from 'react';

// Malipopay Social wordmark. Sources the rebranded SVG from /public/postiz-text.svg
// (which was overwritten with malipopay-website-v2/public/logos/malipopay-logo.svg
// during the brand swap). Keeping the file/component name "LogoTextComponent" so we
// don't have to update every import site upstream.
export const LogoTextComponent = () => {
  return (
    <img
      src="/postiz-text.svg"
      alt="Malipopay Social"
      width={140}
      height={32}
      style={{ height: 32, width: 'auto', display: 'block' }}
    />
  );
};
