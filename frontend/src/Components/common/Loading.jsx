const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#3B82F6] mx-auto"></div>
        <p className="mt-4 text-[#9CA3AF]">Cargando...</p>
      </div>
    </div>
  );
};

export default Loading;
