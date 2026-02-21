function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex space-x-2">
        <span className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="h-3 w-3 rounded-full bg-primary animate-bounce" />
      </div>
    </div>
  );
}
export default LoadingScreen;
