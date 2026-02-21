export default function ProgressHeader() {
  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-6 pt-8 md:pt-12 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-text-main">
          Progress
        </h1>
        {/* Add a button or actions here if needed in the future */}
      </div>
    </header>
  );
}
