with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Add imports
if "useNavigate" not in code:
    code = code.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { useNavigate } from 'react-router-dom';")

if "LogOut" not in code:
    code = code.replace("Edit3, Check } from 'lucide-react';", "Edit3, Check, LogOut } from 'lucide-react';")

# Add hook
if "const navigate = useNavigate();" not in code:
    code = code.replace("const [activeTab, setActiveTab] = useState", "const navigate = useNavigate();\n  const [activeTab, setActiveTab] = useState")

# Add button
old_sidebar_end = """              {tab.id === 'support' && supportRequests.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{supportRequests.length}</span>
              )}
            </button>
          );
        })}
      </div>"""

new_sidebar_end = """              {tab.id === 'support' && supportRequests.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{supportRequests.length}</span>
              )}
            </button>
          );
        })}
        
        <div className="mt-auto pt-4 border-t border-white/5">
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            Sair do Painel
          </button>
        </div>
      </div>"""

code = code.replace(old_sidebar_end, new_sidebar_end)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
print("Patched navigation!")
