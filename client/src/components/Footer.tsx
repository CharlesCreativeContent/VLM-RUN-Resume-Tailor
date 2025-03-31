export default function Footer() {
  return (
    <footer className="bg-white mt-12 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
          <p className="mt-1">This application uses VLM Run and Gemini APIs to process your data.</p>
        </div>
      </div>
    </footer>
  );
}
