const fs = require('fs');
let code = fs.readFileSync('src/screens/QueueScreen.tsx', 'utf-8');

const targetImports = `import { useEffect } from 'react';`;
const replacementImports = `import { useEffect, useState } from 'react';`;
code = code.replace(targetImports, replacementImports);

const targetState = `  const { queuePosition, estimatedWaitTime, updateQueue, startConsultation, pagamento_consulta, consultationActive, subscribeToQueue } = useStore();`;
const replacementState = `  const { queuePosition, estimatedWaitTime, updateQueue, startConsultation, pagamento_consulta, consultationActive, subscribeToQueue } = useStore();
  const [displayPosition, setDisplayPosition] = useState<number | null>(null);

  useEffect(() => {
    const realPos = queuePosition + 1;
    if (displayPosition === null) {
      if (realPos === 1) {
        setDisplayPosition(Math.floor(Math.random() * 4) + 3); // 3 to 6
      } else {
        setDisplayPosition(realPos);
      }
    } else if (realPos > displayPosition) {
      setDisplayPosition(realPos);
    }
  }, [queuePosition, displayPosition]);

  useEffect(() => {
    const realPos = queuePosition + 1;
    let timer: NodeJS.Timeout;
    
    if (displayPosition !== null && displayPosition > Math.max(1, realPos)) {
      const decreaseQueue = () => {
        setDisplayPosition(prev => {
          const target = Math.max(1, queuePosition + 1);
          if (prev && prev > target) return prev - 1;
          return prev;
        });
      };
      
      const nextInterval = Math.floor(Math.random() * 15000) + 10000; // 10s to 25s
      timer = setTimeout(decreaseQueue, nextInterval);
    }
    
    return () => clearTimeout(timer);
  }, [displayPosition, queuePosition]);`;

code = code.replace(targetState, replacementState);

const targetRender = `{queuePosition + 1}`;
const replacementRender = `{displayPosition || (queuePosition + 1)}`;
code = code.replace(targetRender, replacementRender);

fs.writeFileSync('src/screens/QueueScreen.tsx', code);
