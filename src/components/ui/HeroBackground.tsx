const BACKGROUND_IMAGES = {
  mobile:
    "https://images.unsplash.com/photo-1648995361141-30676a75fd27?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  desktop:
    "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
};

// Component: Hero Section Background
const HeroBackground = () => (
  <>
    {/* Mobile Image: Shown only on screens smaller than 768px */}
    <div
      className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat md:hidden"
      style={{
        backgroundImage: `url('${BACKGROUND_IMAGES.mobile}')`,
      }}
    >
      <div className="absolute inset-0 hero-gradient"></div>
    </div>

    {/* Desktop Image: Shown only on screens 768px and larger */}
    <div
      className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat hidden md:block"
      style={{
        backgroundImage: `url('${BACKGROUND_IMAGES.desktop}')`,
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
    </div>
  </>
);
export default HeroBackground;
