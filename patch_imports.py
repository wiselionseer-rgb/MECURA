with open("src/components/DoctorAnalyticsDashboard.tsx", "r") as f:
    code = f.read()

code = code.replace(
    "import { Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Check, X, Bell, Plus } from 'lucide-react';",
    "import { Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Check, X, Bell, Plus, MessageCircle } from 'lucide-react';"
)
code = code.replace(
    "import { useStore } from '../store/useStore';",
    "import { useStore } from '../store/useStore';\nimport { collection, addDoc } from 'firebase/firestore';\nimport { db } from '../firebase';"
)

with open("src/components/DoctorAnalyticsDashboard.tsx", "w") as f:
    f.write(code)
