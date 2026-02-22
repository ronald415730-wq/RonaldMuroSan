
import React, { useState, useMemo, useEffect } from "react";
import { DikeConfig, BudgetSection, ProgressEntry, Sector } from "../types";
import { CalendarRange, Filter, Map, Layers, LayoutTemplate, Search, ArrowRight } from "lucide-react";

interface LinearSchedulePanelProps {
  dikes: DikeConfig[];
  budget: BudgetSection[];
  progressEntries: ProgressEntry[];
  sectors: Sector[];
}

export const LinearSchedulePanel: React.FC<LinearSchedulePanelProps> = ({ dikes, budget, progressEntries, sectors }) => {
  const [selectedSectorId, setSelectedSectorId] = useState<string>("TODOS");
  const [selectedDikeId, setSelectedDikeId] = useState(dikes[0]?.id || "");
  const [resolution, setResolution] = useState(100); // Meters per column
  const [activeTab, setActiveTab] = useState<"ALL" | "B1" | "B2">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter dikes by sector
  const filteredDikes = useMemo(() => {
      if (selectedSectorId === "TODOS") return dikes;
      return dikes.filter(d => d.sectorId === selectedSectorId);
  }, [dikes, selectedSectorId]);

  // Auto-select first dike when list changes
  useEffect(() => {
      if (filteredDikes.length > 0) {
          if (!filteredDikes.find(d => d.id === selectedDikeId)) {
              setSelectedDikeId(filteredDikes[0].id);
          }
      } else {
          setSelectedDikeId("");
      }
  }, [filteredDikes, selectedDikeId]);

  const selectedDike = dikes.find(d => d.id === selectedDikeId);

  // Helper: Parse PK string to meters
  const parsePk = (pkStr: string): number => {
    if (!pkStr) return 0;
    if (pkStr.includes('+')) {
      const [km, m] = pkStr.split('+');
      return (parseFloat(km) * 1000) + parseFloat(m);
    }
    return parseFloat(pkStr) || 0;
  };

  // Helper: Format meters back to PK string
  const formatPk = (meters: number): string => {
    const km = Math.floor(meters / 1000);
    const m = meters % 1000;
    return `${km}+${m.toString().padStart(3, '0')}`;
  };

  // Generate Grid Columns (PK Intervals)
  const gridColumns = useMemo(() => {
    if (!selectedDike) return [];
    
    // Use Dike Start/End if defined, else defaults
    const start = parsePk(selectedDike.progInicioDique) || 0;
    // Fallback if config is missing end point, estimate from totalML
    const end = selectedDike.progFinDique ? parsePk(selectedDike.progFinDique) : start + selectedDike.totalML; 
    
    // Sanity check for negative or weird config
    const safeStart = Math.min(start, end);
    const safeEnd = Math.max(start, end);

    const cols = [];
    for (let current = safeStart; current < safeEnd; current += resolution) {
      cols.push({
        start: current,
        end: Math.min(current + resolution, safeEnd),
        label: formatPk(current)
      });
    }
    return cols;
  }, [selectedDike, resolution]);

  // Extract Flattened Partidas (Items) for Rows, including Group ID for filtering
  const allPartidas = useMemo(() => {
    return budget.flatMap(section => 
        section.groups.flatMap(group => 
            group.items.map(item => ({
                code: item.code,
                desc: item.description,
                unit: item.unit,
                groupId: group.id,
                groupName: group.name
            }))
        )
    );
  }, [budget]);

  // Filter Partidas based on active Tab and Search Term
  const displayedPartidas = useMemo(() => {
    let filtered = allPartidas;
    
    if (activeTab !== "ALL") {
        filtered = filtered.filter(p => p.groupId === activeTab);
    }

    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
            p.code.toLowerCase().includes(lowerTerm) || 
            p.desc.toLowerCase().includes(lowerTerm)
        );
    }

    return filtered;
  }, [allPartidas, activeTab, searchTerm]);

  // Determine cell status
  const checkProgress = (partidaCode: string, colStart: number, colEnd: number) => {
    // Find any progress entry for this dike and partida that overlaps with this column's range
    return progressEntries.some(entry => {
      if (entry.dikeId !== selectedDikeId) return false;
      // Loose match on code to handle potential formatting diffs
      if (!entry.partida.startsWith(partidaCode)) return false; 
      
      const pStart = parsePk(entry.progInicio);
      const pEnd = parsePk(entry.progFin);
      
      const entryMin = Math.min(pStart, pEnd);
      const entryMax = Math.max(pStart, pEnd);

      // Check overlap: Interval [colStart, colEnd] overlaps with [entryMin, entryMax]
      // Overlap condition: start1 < end2 && start2 < end1
      return (entryMin < colEnd && entryMax > colStart);
    });
  };

  if (!dikes.length) return <div className="p-8 text-center text-gray-500 text-sm">No hay diques configurados.</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg">
                <CalendarRange className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cronograma Lineal</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Visualización Espacio-Tiempo</p>
            </div>
            </div>

            <div className="flex-1 w-full md:max-w-md px-2">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Search className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-8 pr-3 py-1.5 border border-blue-300 dark:border-blue-700 rounded-lg leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                        placeholder="Buscar partida..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {/* Sector Filter */}
                <div className="relative">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <div className="pl-2 pr-1.5 py-1.5 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600">
                            <Filter className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <select 
                            className="bg-transparent border-none text-xs focus:ring-0 text-gray-800 dark:text-gray-200 outline-none py-1.5 pl-2 pr-6 appearance-none min-w-[100px]"
                            value={selectedSectorId}
                            onChange={(e) => setSelectedSectorId(e.target.value)}
                        >
                            <option value="TODOS">Todos Sectores</option>
                            {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Dike Selector */}
                <div className="relative">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <div className="pl-2 pr-1.5 py-1.5 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600">
                            <Map className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <select 
                            className="bg-transparent border-none text-xs focus:ring-0 text-gray-800 dark:text-gray-200 outline-none py-1.5 pl-2 pr-6 appearance-none min-w-[140px] max-w-[200px]"
                            value={selectedDikeId}
                            onChange={(e) => setSelectedDikeId(e.target.value)}
                        >
                            {filteredDikes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            {filteredDikes.length === 0 && <option value="">Sin diques</option>}
                        </select>
                    </div>
                </div>

                {/* Resolution Selector */}
                <div className="relative">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <div className="pl-2 pr-1.5 py-1.5 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600">
                            <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <select 
                            className="bg-transparent border-none text-xs focus:ring-0 text-gray-800 dark:text-gray-200 outline-none py-1.5 pl-2 pr-6 appearance-none"
                            value={resolution}
                            onChange={(e) => setResolution(Number(e.target.value))}
                        >
                            <option value={10}>10m</option>
                            <option value={20}>20m</option>
                            <option value={50}>50m</option>
                            <option value={100}>100m</option>
                            <option value={200}>200m</option>
                            <option value={500}>500m</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabs for B1 / B2 */}
        <div className="flex space-x-2 bg-gray-50 dark:bg-gray-900/30 p-1 rounded-lg w-fit border border-gray-200 dark:border-gray-700 mb-3">
            <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === "ALL"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-sm border border-gray-200 dark:border-gray-600"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            >
            <Layers className="w-3 h-3" />
            Todos
            </button>
            <button
            onClick={() => setActiveTab("B1")}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === "B1"
                ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-300 shadow-sm border border-gray-200 dark:border-gray-600"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            >
            <LayoutTemplate className="w-3 h-3" />
            B1 - Dique Nuevo
            </button>
            <button
            onClick={() => setActiveTab("B2")}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === "B2"
                ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-300 shadow-sm border border-gray-200 dark:border-gray-600"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            >
            <LayoutTemplate className="w-3 h-3" />
            B2 - Refuerzo
            </button>
        </div>

        {selectedDike ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                {/* Legend */}
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex gap-4 text-[10px] bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-sm"></div>
                        <span>Pendiente</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-green-500 border border-green-600 rounded-sm"></div>
                        <span>Ejecutado</span>
                    </div>
                </div>

                {/* Grid Container */}
                <div className="overflow-auto relative max-h-[600px] custom-scrollbar">
                    <table className="border-collapse w-max">
                        <thead className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-sm">
                            <tr>
                                <th className="sticky left-0 z-30 bg-gray-100 dark:bg-gray-700 text-left px-3 py-2 border-b border-r border-gray-300 dark:border-gray-600 min-w-[300px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] h-20 align-bottom">
                                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 uppercase">Partida / Actividad</span>
                                </th>
                                {gridColumns.map((col, idx) => (
                                    <th key={idx} className="text-center px-0 border-b border-r border-gray-200 dark:border-gray-700 min-w-[20px] bg-gray-50 dark:bg-gray-800 h-20 align-bottom pb-2">
                                        <div className="text-[8px] font-mono text-gray-500 -rotate-90 w-3 mx-auto whitespace-nowrap origin-center">
                                            {col.label}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {displayedPartidas.map(partida => {
                                if (!partida.code) return null;

                                return (
                                    <tr key={`${partida.groupId}-${partida.code}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 px-3 py-1.5 border-r border-gray-200 dark:border-gray-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span className={`text-[8px] px-1 rounded-sm font-bold ${partida.groupId === 'B1' ? 'bg-green-100 text-green-700' : (partida.groupId === 'B2' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600')}`}>
                                                        {partida.groupId}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200">{partida.code}</span>
                                                </div>
                                                <span className="text-[9px] text-gray-500 truncate max-w-[280px]" title={partida.desc}>{partida.desc}</span>
                                            </div>
                                        </td>
                                        {gridColumns.map((col, idx) => {
                                            const isDone = checkProgress(partida.code, col.start, col.end);
                                            return (
                                                <td key={idx} className={`border-r border-b border-gray-100 dark:border-gray-700 relative p-0 h-8`}>
                                                    {isDone && (
                                                        <div className="absolute inset-0.5 bg-green-500/80 rounded-sm border border-green-600/50" title={`Ejecutado: ${partida.code} en ${col.label}`}></div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-500">
                <Map className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Seleccione un Dique</p>
                <p className="text-xs mt-1">Utilice los filtros superiores para seleccionar un sector y dique.</p>
            </div>
        )}
      </div>
    </div>
  );
};
