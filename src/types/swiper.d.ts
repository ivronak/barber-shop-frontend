/* eslint-disable @typescript-eslint/no-explicit-any */
// Type stubs for swiper when the library isn't installed yet.
// Remove this file once you add @types/swiper or the actual package.

declare module 'swiper/react' {
  import * as React from 'react';
  export const Swiper: React.FC<Record<string, unknown>>;
  export const SwiperSlide: React.FC<Record<string, unknown>>;
  export default Swiper;
}

declare module 'swiper/modules' {
  export const Navigation: unknown;
  export const Pagination: unknown;
  export const Autoplay: unknown;
} 