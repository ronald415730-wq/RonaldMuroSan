
import React, { useState, useEffect, useMemo } from "react";
import { Sector, DikeConfig, MeasurementEntry, ProgressEntry, ProjectBackup, BudgetSection, BackupFile } from "./types";
import { SECTORS, INITIAL_DIKES, INITIAL_MEASUREMENTS, INITIAL_BUDGET, INITIAL_PROGRESS_ENTRIES } from "./constants";
import { ConfigurationPanel } from "./components/ConfigurationPanel";
import { DataEntryGrid } from "./components/DataEntryGrid";
import { BudgetPanel } from "./components/BudgetPanel";
import { MeasurementSummaryPanel } from "./components/MeasurementSummaryPanel";
import { ProgressControlPanel } from "./components/ProgressControlPanel";
import { LinearSchedulePanel } from "./components/LinearSchedulePanel";
import { DescriptiveReportPanel } from "./components/DescriptiveReportPanel";
import { SystemStabilityPanel } from "./components/SystemStabilityPanel";
import { AIAssistant } from "./components/AIAssistant";
import { Button } from "./components/Button";
import { analyzeConstructionData } from "./services/geminiService";
import { saveProjectData, loadProjectData } from "./services/storage";
import { Database, FolderOpen, Table2, Bot, LogOut, Calculator, ClipboardList, HardHat, CalendarRange, FileText, ShieldCheck, Search, ArrowDownAZ, X } from "lucide-react";
import { TextArea } from "./components/Input";

const App: React.FC = () => {
  // App State
  const [activeTab, setActiveTab] = useState<"config" | "data" | "summary" | "budget" | "progress" | "schedule" | "report" | "ai" | "support">("data");
  const [selectedDikeId, setSelectedDikeId] = useState<string | null>("DIPR_001_MI"); 
  
  // Sidebar Search & Sort State
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [sidebarSort, setSidebarSort] = useState<"default" | "asc">("default");

  // Data State
  const [dikes, setDikes] = useState<DikeConfig[]>(INITIAL_DIKES);
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>(INITIAL_MEASUREMENTS);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>(INITIAL_PROGRESS_ENTRIES);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [sectors, setSectors] = useState<Sector[]>(SECTORS);
  const [storagePath, setStoragePath] = useState<string>("C:/DATA_CONTROL/DB_LOCAL");
  
  // Virtual File System State for Backups
  const [virtualFileSystem, setVirtualFileSystem] = useState<BackupFile[]>([]);

  // Budget State: Per Sector
  const [budgetBySector, setBudgetBySector] = useState<Record<string, BudgetSection[]>>(() => {
    const initial: Record<string, BudgetSection[]> = {};
    SECTORS.forEach(sector => {
        initial[sector.id] = JSON.parse(JSON.stringify(INITIAL_BUDGET));
    });
    return initial;
  });

  const [budgetByDike, setBudgetByDike] = useState<Record<string, BudgetSection[]>>({});
  
  // AI State
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    loadData();
    loadVirtualFileSystem();
  }, []);

  useEffect(() => {
    if (dikes.length > 0) {
        saveData();
    }
  }, [measurements, progressEntries, customColumns, dikes, sectors, budgetBySector, budgetByDike, storagePath]);

  useEffect(() => {
      const intervalId = setInterval(() => {
          performAutoBackup();
      }, 5 * 60 * 1000);
      return () => clearInterval(intervalId);
  }, [dikes, measurements, progressEntries, budgetBySector, budgetByDike]);

  const performAutoBackup = () => {
      const data: ProjectBackup = {
          sectors, dikes, measurements, progressEntries, customColumns, budgetBySector, budgetByDike, storagePath, timestamp: Date.now()
      };
      const timestamp = new Date();
      const fileName = `AutoSave_${timestamp.toISOString().replace(/[:.]/g, '-')}.json`;
      const file: BackupFile = {
          id: Date.now().toString(),
          name: fileName,
          path: `${storagePath}/AUTOGUARDADO`,
          type: 'auto',
          date: timestamp.toLocaleString(),
          size: `${(JSON.stringify(data).length / 1024).toFixed(2)} KB`,
          data: data
      };
      setVirtualFileSystem(prev => {
          const autos = prev.filter(f => f.type === 'auto');
          const others = prev.filter(f => f.type !== 'auto');
          const newAutos = [file, ...autos].slice(0, 10); 
          const updatedFS = [...newAutos, ...others];
          localStorage.setItem('virtualFileSystem', JSON.stringify(updatedFS));
          return updatedFS;
      });
  };

  const createTempSnapshot = (actionName: string) => {
      const data: ProjectBackup = {
          sectors, dikes, measurements, progressEntries, customColumns, budgetBySector, budgetByDike, storagePath, timestamp: Date.now()
      };
      const file: BackupFile = {
          id: Date.now().toString(),
          name: `Snapshot_${actionName}_${Date.now()}.tmp`,
          path: `${storagePath}/TEMPORALES`,
          type: 'temp',
          date: new Date().toLocaleString(),
          size: `${(JSON.stringify(data).length / 1024).toFixed(2)} KB`,
          data: data
      };
       setVirtualFileSystem(prev => {
          const updatedFS = [file, ...prev].slice(0, 20);
          localStorage.setItem('virtualFileSystem', JSON.stringify(updatedFS));
          return updatedFS;
      });
  };

  const loadVirtualFileSystem = () => {
      const storedFS = localStorage.getItem('virtualFileSystem');
      if (storedFS) {
          try {
              setVirtualFileSystem(JSON.parse(storedFS));
          } catch (e) { console.error("Error loading Virtual FS", e); }
      }
  };

  const consolidatedBudget = useMemo(() => {
    const templateSector = Object.keys(budgetBySector)[0];
    const template = templateSector ? budgetBySector[templateSector] : INITIAL_BUDGET;
    const totalBudget: BudgetSection[] = JSON.parse(JSON.stringify(template));
    totalBudget.forEach(sec => sec.groups.forEach(grp => grp.items.forEach(item => { item.metrado = 0; })));
    (Object.values(budgetBySector) as BudgetSection[][]).forEach(sectorBudget => {
        sectorBudget.forEach(sec => {
            const targetSec = totalBudget.find(s => s.id === sec.id);
            if (targetSec) {
                sec.groups.forEach(grp => {
                    const targetGrp = targetSec.groups.find(g => g.id === grp.id);
                    if (targetGrp) {
                        grp.items.forEach(item => {
                            const targetItem = targetGrp.items.find(i => i.id === item.id);
                            if (targetItem) { targetItem.metrado += item.metrado; }
                        })
                    }
                })
            }
        })
    });
    return totalBudget;
  }, [budgetBySector]);

  const filteredDikesBySector = useMemo(() => {
      return sectors.map(sector => {
          let sectorDikes = dikes.filter(d => d.sectorId === sector.id);
          if (sidebarSearch) { sectorDikes = sectorDikes.filter(d => d.name.toLowerCase().includes(sidebarSearch.toLowerCase())); }
          if (sidebarSort === 'asc') { sectorDikes = [...sectorDikes].sort((a, b) => a.name.localeCompare(b.name)); }
          return { sector, dikes: sectorDikes, hasMatches: sectorDikes.length > 0 };
      });
  }, [sectors, dikes, sidebarSearch, sidebarSort]);

  const saveData = async () => {
    const data: any = { sectors, dikes, measurements, progressEntries, customColumns, budgetBySector, budgetByDike, storagePath, timestamp: Date.now() };
    try { await saveProjectData(data); setLastSaved(new Date().toLocaleTimeString()); } catch (e) { console.error("Failed to save to IndexedDB", e); }
  };

  const loadData = async () => {
    try {
        const data = await loadProjectData();
        if (data) {
            if (data.sectors && data.sectors.length > 0) setSectors(data.sectors);
            if (data.dikes && data.dikes.length > 0) setDikes(data.dikes);
            if (data.measurements) setMeasurements(data.measurements);
            if (data.progressEntries) setProgressEntries(data.progressEntries);
            if (data.customColumns) setCustomColumns(data.customColumns);
            if (data.storagePath) setStoragePath(data.storagePath);
            if (data.budgetBySector) {
                const loadedBudget = { ...data.budgetBySector };
                SECTORS.forEach(sector => { if (!loadedBudget[sector.id]) { loadedBudget[sector.id] = JSON.parse(JSON.stringify(INITIAL_BUDGET)); } });
                setBudgetBySector(loadedBudget);
            } else {
                const loadedBudget: Record<string, BudgetSection[]> = {};
                (data.sectors || SECTORS).forEach((sector: Sector) => { loadedBudget[sector.id] = JSON.parse(JSON.stringify(INITIAL_BUDGET)); });
                setBudgetBySector(loadedBudget);
            }
            if (data.budgetByDike) { setBudgetByDike(data.budgetByDike); }
            setLastSaved(new Date(data.timestamp).toLocaleTimeString());
        }
    } catch (e) { console.error("Failed to load from IndexedDB", e); }
  };

  const handleDownloadBackup = () => {
    const data: ProjectBackup = { sectors, dikes, measurements, progressEntries, customColumns, budgetBySector, budgetByDike, storagePath, timestamp: Date.now() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `RESALDO_TOTAL_SISTEMA_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const currentDike = dikes.find(d => d.id === selectedDikeId) || null;
  const currentDikeMeasurements = measurements.filter(m => m.dikeId === selectedDikeId);

  const handleAddEntry = (entry: MeasurementEntry) => { setMeasurements([...measurements, entry]); createTempSnapshot('add_entry'); };
  const handleUpdateEntries = (updatedEntries: MeasurementEntry[]) => {
    const otherEntries = measurements.filter(m => m.dikeId !== selectedDikeId);
    setMeasurements([...otherEntries, ...updatedEntries]);
    createTempSnapshot('update_entries');
  };
  const handleDeleteEntry = (id: string) => { setMeasurements(measurements.filter(m => m.id !== id)); createTempSnapshot('delete_entry'); };
  const handleAddColumn = (columnName: string) => { if (columnName && !customColumns.includes(columnName)) { setCustomColumns([...customColumns, columnName]); } };
  const handleDeleteColumn = (columnName: string) => { setCustomColumns(customColumns.filter(c => c !== columnName)); };
  const handleRestore = (data: ProjectBackup) => {
      if (data) {
          createTempSnapshot('before_restore');
          if (Array.isArray(data.sectors)) setSectors(data.sectors);
          if (Array.isArray(data.dikes)) setDikes(data.dikes);
          if (Array.isArray(data.measurements)) setMeasurements(data.measurements);
          if (Array.isArray(data.progressEntries)) setProgressEntries(data.progressEntries);
          if (Array.isArray(data.customColumns)) setCustomColumns(data.customColumns);
          if (data.budgetBySector) setBudgetBySector(data.budgetBySector);
          if (data.budgetByDike) setBudgetByDike(data.budgetByDike);
          if (data.storagePath) setStoragePath(data.storagePath);
          alert("Base de datos restaurada.");
      }
  };

  const handleAddSector = (sector: Sector) => { setSectors([...sectors, sector]); setBudgetBySector(prev => ({...prev, [sector.id]: JSON.parse(JSON.stringify(INITIAL_BUDGET))})); createTempSnapshot('add_sector'); };
  const handleUpdateSector = (updated: Sector) => setSectors(sectors.map(s => s.id === updated.id ? updated : s));
  const handleDeleteSector = (id: string) => { if (dikes.some(d => d.sectorId === id)) { alert("No se puede eliminar un sector que contiene diques."); return; } setSectors(sectors.filter(s => s.id !== id)); const newB = {...budgetBySector}; delete newB[id]; setBudgetBySector(newB); createTempSnapshot('delete_sector'); };
  const handleAddDike = (d: DikeConfig) => setDikes([...dikes, d]);
  const handleUpdateDike = (u: DikeConfig) => setDikes(dikes.map(d => d.id === u.id ? u : d));
  const handleDeleteDike = (id: string) => { if(measurements.some(m => m.dikeId === id) && !confirm("Este dique tiene metrados asociados. ¿Está seguro de eliminarlo?")) return; setDikes(dikes.filter(d => d.id !== id)); setMeasurements(measurements.filter(m => m.id !== id)); if(selectedDikeId === id) setSelectedDikeId(null); createTempSnapshot('delete_dike'); };
  
  const handleAddProgress = (entry: ProgressEntry) => { setProgressEntries([entry, ...progressEntries]); createTempSnapshot('add_progress'); };
  const handleUpdateProgressEntry = (u: ProgressEntry) => setProgressEntries(progressEntries.map(p => p.id === u.id ? u : p));
  const handleDeleteProgress = (id: string) => { setProgressEntries(progressEntries.filter(p => p.id !== id)); createTempSnapshot('delete_progress'); };
  const handleUpdateBudget = (sid: string, b: BudgetSection[]) => { setBudgetBySector(prev => ({...prev, [sid]: b})); createTempSnapshot('update_budget'); };
  const handleUpdateDikeBudget = (dikeId: string, b: BudgetSection[]) => { setBudgetByDike(prev => ({...prev, [dikeId]: b})); createTempSnapshot('update_dike_budget'); };

  // --- LOGICA DE EJERCICIO MASIVO MEJORADA ---
  const handleGenerateExercise = () => {
    if (!confirm("Esta acción generará metrados automáticos e HISTORIAL DE AVANCE para TODOS los diques configurados. Los datos existentes serán reemplazados para este ejercicio. ¿Desea continuar?")) return;
    
    const parsePkLocal = (pkStr: string): number => {
        if (!pkStr) return 0;
        const clean = pkStr.replace(/\s/g, '');
        if (clean.includes('+')) {
            const [km, m] = clean.split('+');
            return (parseFloat(km) * 1000) + parseFloat(m);
        }
        return parseFloat(clean) || 0;
    };

    const formatPkLocal = (meters: number): string => {
        const km = Math.floor(meters / 1000);
        const m = (meters % 1000).toFixed(2);
        return `${km}+${m.toString().padStart(6, '0')}`;
    };

    const newExerciseMeasurements: MeasurementEntry[] = [];
    const newExerciseProgress: ProgressEntry[] = [];
    const step = 50; // Cada 50 metros un punto de medición

    dikes.forEach(dike => {
        const startM = parsePkLocal(dike.progInicioDique);
        const endM = parsePkLocal(dike.progFinDique);
        const totalLength = Math.abs(endM - startM);
        
        if (totalLength <= 0) return;

        const points = Math.ceil(totalLength / step);
        const direction = endM > startM ? 1 : -1;

        // 1. Generar Hoja de Metrados (Celdas)
        for (let i = 0; i <= points; i++) {
            let currentM = startM + (i * step * direction);
            if ((direction === 1 && currentM > endM) || (direction === -1 && currentM < endM)) {
                currentM = endM;
            }

            const dist = i === 0 ? 0 : Math.abs(currentM - (startM + ((i-1) * step * direction)));
            if (i > 0 && dist === 0) continue;

            const isB2 = Math.random() > 0.7; // 30% probabilidad de ser refuerzo B2

            const entry: MeasurementEntry = {
                id: `EXERCISE_M_${dike.id}_${i}_${Date.now()}`,
                dikeId: dike.id,
                pk: formatPkLocal(currentM),
                distancia: parseFloat(dist.toFixed(2)),
                tipoTerreno: isB2 ? "B2" : "B1",
                tipoEnrocado: Math.random() > 0.5 ? "TIPO 1" : "TIPO 2",
                intervencion: "LLENADO DE EJERCICIO AUTOMÁTICO",
                item501A_Carguio: 1, 
                item403A_Contractual: parseFloat((Math.random() * 2.5 + 1.2).toFixed(2)),
                item403A_Rep: 0,
                item403A_Fund: 0,
                corteRoca_Recuperacion: parseFloat((Math.random() * 4).toFixed(2)),
                item402B_Contractual: parseFloat((Math.random() * 1.8).toFixed(2)),
                item402B_Rep: 0,
                item402B_Fund: 0,
                item402E_NivelFreatico: parseFloat((Math.random() * 6 + 3).toFixed(2)),
                item402E_NivelFreatico_MM: 0,
                item405A_Descolmatacion: 0,
                item405A_Descolmatacion_MM: 0,
                item404_Talud_T1: parseFloat((Math.random() * 4 + 4).toFixed(2)),
                item404_Talud_T2: 0,
                item404_Talud_T1_MM: 0,
                item404_Talud_T2_MM: 0,
                item404_Una_T1: parseFloat((Math.random() * 3 + 3).toFixed(2)),
                item404_Una_T2: 0,
                item404_Una_T1_MM: 0,
                item404_Una_T2_MM: 0,
                item413A_Contractual: parseFloat((Math.random() * 2.2).toFixed(2)),
                item413A_MM: 0,
                item412A_Afirmado: 0.62,
                item406A_Perfilado: 1.5,
                item409A_Geotextil: 12.5,
                item416A_Fundacion: 0,
                item408A_Zanja: 0,
                gavion: isB2 ? parseFloat((Math.random() * 5).toFixed(2)) : 0
            };
            newExerciseMeasurements.push(entry);
            if (currentM === endM) break;
        }

        // 2. Generar Historial de Avance Diario (ProgressEntries)
        const totalProgressPoints = 8;
        const subStep = totalLength / totalProgressPoints;
        const today = new Date();

        for(let j = 0; j < totalProgressPoints; j++) {
            const progressStart = startM + (j * subStep * direction);
            const progressEnd = startM + ((j + 1) * subStep * direction);
            const entryDate = new Date();
            entryDate.setDate(today.getDate() - (totalProgressPoints - j));

            const progEntry: ProgressEntry = {
                id: `EXERCISE_P_${dike.id}_${j}_${Date.now()}`,
                date: entryDate.toISOString().split('T')[0],
                dikeId: dike.id,
                progInicio: formatPkLocal(progressStart),
                progFin: formatPkLocal(progressEnd),
                longitud: parseFloat(subStep.toFixed(2)),
                tipoTerreno: Math.random() > 0.8 ? "B2" : "B1",
                tipoEnrocado: "TIPO 2",
                partida: "404.A ENROCADO Y ACOMODO",
                capa: "Capa Única",
                observaciones: "Avance generado en ejercicio masivo"
            };
            newExerciseProgress.push(progEntry);
        }
    });

    createTempSnapshot('before_bulk_exercise');
    setMeasurements(newExerciseMeasurements);
    setProgressEntries(newExerciseProgress);
    alert(`Ejercicio Completado:\n- ${newExerciseMeasurements.length} celdas de metrados llenadas.\n- ${newExerciseProgress.length} registros de avance diario creados.\n\nRevise ahora los paneles de Cronograma, Resumen y Memoria.`);
    setActiveTab("summary");
  };

  const handleFixData = (type: 'orphans' | 'dates' | 'budget' | 'units') => {
    if (type === 'orphans') {
        const validDikeIds = new Set(dikes.map(d => d.id));
        const orphanCount = measurements.filter(m => !validDikeIds.has(m.dikeId)).length;
        
        if (orphanCount === 0) {
            alert("No se detectaron registros de metrados huérfanos.");
            return;
        }

        if (confirm(`Se han detectado ${orphanCount} registros que no pertenecen a ningún dique configurado. ¿Desea eliminarlos permanentemente?`)) {
            createTempSnapshot('fix_orphans');
            const cleanedMeasurements = measurements.filter(m => validDikeIds.has(m.dikeId));
            setMeasurements(cleanedMeasurements);
            alert(`Limpieza completada. Se eliminaron ${orphanCount} registros huérfanos.`);
        }
    }
  };

  const handleAskAI = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse("");
    try {
      const response = await analyzeConstructionData(dikes, measurements, consolidatedBudget, aiQuery);
      setAiResponse(response);
    } catch (error) {
      console.error("AI Error:", error);
      setAiResponse("Lo siento, ocurrió un error al procesar su consulta técnica. Por favor, intente nuevamente.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <header className="bg-[#003366] text-white shadow-md z-30 shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-lg">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/OHLA_Group_logo.svg/1200px-OHLA_Group_logo.svg.png" alt="OHLA" className="h-8 w-auto" />
            </div>
            <div>
                <h1 className="text-lg font-bold tracking-tight">DEFENSAS RIBEREÑAS CASMA</h1>
                <p className="text-[10px] text-gray-300 uppercase tracking-wider">Autor: Ing. Ronald Octavio Muro Sandoval - CIP 292149</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {lastSaved && <span className="text-[10px] text-gray-300 italic">Guardado (DB): {lastSaved}</span>}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-20 h-full">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
                <nav className="space-y-1">
                    <button onClick={() => setActiveTab("config")} className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'config' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                        <FolderOpen className="w-3.5 h-3.5" /><span className="font-medium text-xs">Configuración</span>
                    </button>
                    <button onClick={() => setActiveTab("data")} className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'data' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                        <Table2 className="w-3.5 h-3.5" /><span className="font-medium text-xs">Hoja de Metrados</span>
                    </button>
                    <button onClick={() => setActiveTab("summary")} className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'summary' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                        <ClipboardList className="w-3.5 h-3.5" /><span className="font-medium text-xs">Resumen Partidas</span>
                    </button>
                    <button onClick={() => setActiveTab("budget")} className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'budget' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                        <Calculator className="w-3.5 h-3.5" /><span className="font-medium text-xs">Presupuesto</span>
                    </button>
                    <button onClick={() => setActiveTab("progress")} className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'progress' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                        <HardHat className="w-3.5 h-3.5" /><span className="font-medium text-xs">Avance de Obra</span>
                    </button>
                    <button onClick={() => setActiveTab("schedule")} className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'schedule' ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                        <CalendarRange className="w-3.5 h-3.5" /><span className="font-medium text-xs">Cronograma</span>
                    </button>
                    <button onClick={() => setActiveTab("report")} className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'report' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                        <FileText className="w-3.5 h-3.5" /><span className="font-medium text-xs">Memoria Descriptiva</span>
                    </button>
                    <button onClick={() => setActiveTab("support")} className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'support' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                        <ShieldCheck className="w-3.5 h-3.5" /><span className="font-medium text-xs">Soporte Técnico</span>
                    </button>
                    <button onClick={() => setActiveTab("ai")} className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'ai' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                        <Bot className="w-3.5 h-3.5" /><span className="font-medium text-xs">Asistente Técnico</span>
                    </button>
                </nav>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <Search className="h-3 w-3 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-7 pr-7 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-[10px] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Buscar dique..."
                        value={sidebarSearch}
                        onChange={(e) => setSidebarSearch(e.target.value)}
                    />
                </div>
                {filteredDikesBySector.map(({ sector, dikes: sectorDikes, hasMatches }) => {
                    if (sidebarSearch && !hasMatches) return null;
                    return (
                        <div key={sector.id} className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden shadow-sm">
                            <div className="bg-[#003366] text-white py-1 px-2 text-center">
                                <span className="text-[10px] font-bold uppercase tracking-wide">{sector.name}</span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                {sectorDikes.map(dike => (
                                    <button 
                                        key={dike.id}
                                        onClick={() => { setSelectedDikeId(dike.id); if (activeTab !== "progress" && activeTab !== "schedule" && activeTab !== "data") { setActiveTab("data"); } }}
                                        className={`w-full text-left px-2.5 py-1.5 text-[10px] font-medium transition-colors flex items-center gap-2 ${selectedDikeId === dike.id ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 font-bold" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedDikeId === dike.id ? "bg-blue-600" : "bg-gray-300"}`} />
                                        <span className="truncate">{dike.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>

        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {activeTab === "config" && <ConfigurationPanel sectors={sectors} dikes={dikes} customColumns={customColumns} onRestore={handleRestore} onBackup={handleDownloadBackup} onAddSector={handleAddSector} onUpdateSector={handleUpdateSector} onDeleteSector={handleDeleteSector} onAddDike={handleAddDike} onUpdateDike={handleUpdateDike} onDeleteDike={handleDeleteDike} onAddColumn={handleAddColumn} onDeleteColumn={handleDeleteColumn} onGenerateExercise={handleGenerateExercise} />}
                {activeTab === "data" && <DataEntryGrid dike={currentDike} entries={currentDikeMeasurements} customColumns={customColumns} budget={budgetBySector[currentDike?.sectorId || ""] || []} onAddEntry={handleAddEntry} onUpdateEntries={handleUpdateEntries} onDeleteEntry={handleDeleteEntry} onAddColumn={handleAddColumn} onDeleteColumn={handleDeleteColumn} onFullImport={()=>{}} />}
                {activeTab === "summary" && <MeasurementSummaryPanel budget={consolidatedBudget} measurements={measurements} dikes={dikes} sectors={sectors} budgetBySector={budgetBySector} onUpdateBudget={handleUpdateBudget} />}
                {activeTab === "budget" && <BudgetPanel budgetBySector={budgetBySector} budgetByDike={budgetByDike} sectors={sectors} onUpdateBudget={handleUpdateBudget} onUpdateDikeBudget={handleUpdateDikeBudget} measurements={measurements} dikes={dikes} />}
                {activeTab === "progress" && <ProgressControlPanel sectors={sectors} dikes={dikes} budget={consolidatedBudget} budgetBySector={budgetBySector} entries={progressEntries} onAddEntry={handleAddProgress} onUpdateEntry={handleUpdateProgressEntry} onDeleteEntry={handleDeleteProgress} />}
                {activeTab === "schedule" && <LinearSchedulePanel sectors={sectors} dikes={dikes} budget={consolidatedBudget} progressEntries={progressEntries} />}
                {activeTab === "report" && <DescriptiveReportPanel sectors={sectors} dikes={dikes} measurements={measurements} budgetBySector={budgetBySector} progressEntries={progressEntries} />}
                {activeTab === "support" && <SystemStabilityPanel dikes={dikes} measurements={measurements} progressEntries={progressEntries} budgetBySector={budgetBySector} onFixData={handleFixData} onClearLogs={()=>{}} storagePath={storagePath} onUpdateStoragePath={setStoragePath} onGenerateExercise={handleGenerateExercise} />}
                {activeTab === "ai" && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                             <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><Bot className="w-4 h-4 text-purple-600" />Asistente de Ingeniería</h2>
                             <TextArea label="Consulta sobre el proyecto" placeholder="Ej: ¿Cuál es el presupuesto total?" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} className="min-h-[80px] text-xs" />
                             <div className="mt-3 flex justify-end">
                                <Button onClick={handleAskAI} isLoading={isAiLoading} disabled={!aiQuery.trim()} className="text-xs h-8">Analizar Datos</Button>
                             </div>
                        </div>
                        {aiResponse && <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900/20"><div className="prose dark:prose-invert text-xs max-w-none"><p className="whitespace-pre-line">{aiResponse}</p></div></div>}
                    </div>
                )}
            </div>
            <AIAssistant activeTab={activeTab} />
        </main>
      </div>
    </div>
  );
};

export default App;
