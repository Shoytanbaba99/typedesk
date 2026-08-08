import { TerminalContainer } from "./components/terminal/TerminalContainer";
import { TerminalHeader } from "./components/terminal/TerminalHeader";

function App() {
  return (
    <main
      className="min-h-screen bg-(--bg-main) flex items-center justify-center p-2 sm:p-6 md:p-8
  transition-colors duration-200"
    >
      <TerminalContainer>
        <TerminalHeader />

        {/* Terminal Screen Body Placeholder */}
        <div className="flex flex-col items-center justify-center gap-4 text-center py-16 sm:py-20">
          <p className="text-xl sm:text-2xl font-bold text-(--text-correct) crt-glow tracking-widest">
            AWAITING KEYSTROKE INPUT_
          </p>
          <p className="text-xs sm:text-sm text-(--text-untyped) tracking-wider uppercase">
            [PRESS ANY KEY TO INITIALIZE TEST SESSION]
          </p>
        </div>
      </TerminalContainer>
    </main>
  );
}

export default App;
